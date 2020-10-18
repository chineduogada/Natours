const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs/dist/bcrypt');

const signToken = async (id) => {
  const token = await promisify(jwt.sign)({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

exports.signUp = catchAsync(async (req, res) => {
  let newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordCheck: req.body.passwordCheck,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  newUser = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };

  const token = await signToken(newUser._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if both fields exist
  if (!email || !password) {
    const err = new AppError('please provide email and password!', 400);
    return next(err);
  }

  // Check if user exists & password is correct
  const existingUser = await User.findOne({ email: req.body.email }).select(
    '+password'
  );
  if (
    !existingUser ||
    !(await existingUser.isPasswordCorrect(password, existingUser.password))
  ) {
    const err = new AppError('email or password is incorrect', 401);
    return next(err);
  }

  const token = await signToken(existingUser._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: existingUser,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  /**
   * Checks
   * 1. get the token and check if it's there
   * 2. validate the token
   * 3. if the user is not deleted
   * 4. if the user changed password after the token was issued
   */

  // 1.
  const { authorization } = req.headers;
  let token;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) {
    // const err = new AppError('access denied. no token sent', 401);
    const err = new AppError(
      "you're not logged in! please log in to gain access!",
      401
    );
    return next(err);
  }

  // 2.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3.
  const existingUser = await User.findById(decoded.id);
  if (!existingUser) {
    const err = new AppError(
      'the user whom this token was issued to, no longer exists.',
      401
    );
    return next(err);
  }

  // 4.
  const changedPasswordAfterJWTWasIssued = existingUser.changedPasswordAfterJWTWasIssued(
    decoded.iat
  );

  if (changedPasswordAfterJWTWasIssued) {
    const err = new AppError(
      'user recently changed password! please login a again'
    );
    return next(err);
  }

  // GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = existingUser;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  console.log(req.user.role);

  if (!roles.includes(req.user.role)) {
    const err = new AppError('access denied! unauthorized', 403);
    return next(err);
  }

  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  /**
   * Steps to implementation
   * 1. validate Email input
   * 2. check if user exits
   * 3. generate a random password reset token
   * 4. send it the user's email
   */

  // 1
  const { email } = req.body;
  if (!email) {
    const err = new AppError('please provide your email', 400);
    return next(err);
  }

  // 2
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    const err = new AppError('no user with this email address', 404);
    return next(err);
  }

  // 3
  const resetToken = existingUser.createPasswordResetToken();
  await existingUser.save({ validateBeforeSave: false });

  // 4
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `
  Forgot your password? Submit a PATCH request with your new 'password' and 'passwordCheck' to: ${resetURL}.\n
  if you didn't forgot your password, please ignore this email.
  `;

  try {
    const emailOptions = {
      email: existingUser.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    };
    await sendEmail(emailOptions);
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email successfully',
    });
  } catch (err) {
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetTokenExpiresIn = undefined;
    await existingUser.save({ validateBeforeSave: false });

    err = new AppError(
      'there was an error sending the email! please try again later.',
      500
    );

    return next(err);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  /**
   * Steps
   * 1. Get user based on the token
   * 2. If token has not expired, and there is user, set the new password
   * 3. Update passwordChangeAt property for the user (Automated in the `pre('save)` middleware)
   * 4. Log in the user, send JWT
   */
  // 1.
  const { token: resetToken } = req.params;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const existingUser = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });

  // 2.
  if (!existingUser) {
    const err = new AppError('resetToken is invalid or has expired', 400);
    return next(err);
  }

  existingUser.password = req.body.password;
  existingUser.passwordCheck = req.body.passwordCheck;
  existingUser.passwordResetToken = undefined;
  existingUser.passwordResetTokenExpiresIn = undefined;
  await existingUser.save();

  // 4.
  const token = await signToken(existingUser._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  /**
   * Steps
   * 1. get the user form collection
   * 2. check if the password correct
   * 3. if so, update password
   * 4. log uer in, send JWT
   */

  // 1.
  const existingUser = await User.findById(req.user._id).select('+password');

  // 2.
  const isPasswordCorrect = await existingUser.isPasswordCorrect(
    req.body.passwordCurrent,
    existingUser.password
  );
  if (!isPasswordCorrect) {
    const err = new AppError('incorrect current password!', 401);
    return next(err);
  }

  // 3.
  existingUser.password = req.body.password;
  existingUser.passwordCheck = req.body.passwordCheck;
  await existingUser.save();

  // 4.
  const token = await signToken(existingUser._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: existingUser,
    },
  });
});

// const test = catchAsync(async (req, res, next) => {
//   const { passwordCurrent, passwordNew, passwordCheck } = req.body;

//   // 1. Get the User
//   const user = await User.findById(req.user._id).select("+password");

//   // 2. Check for current password
// const passwordIsCorrect =  await user.isPasswordCorrect(passwordCurrent, user.password)
  
  
//   if (!passwordIsCorrect) {
//     return next(new AppError("incorrect current password!", 400))
//   }

//   // 3. Update the new password
//   user.password = passwordNew;
//   user.passwordCheck = passwordCheck
//   await user.save()

//   // 4. Login the User
//   const token = await signToken(user._id);

//   res.status(200).json({
//     status: "success",
//     token
//   })
// })






