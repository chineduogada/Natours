const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const Email = require('../utils/Email');

const signToken = async (id) => {
  const token = await promisify(jwt.sign)({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

const sendToken = async (userId, statusCode, res, user) => {
  const token = await signToken(userId);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  if (user) {
    user.password = undefined;

    return res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  }

  return res.status(statusCode).json({
    status: 'success',
    token,
  });
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

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  await sendToken(newUser._id, 201, res, newUser);
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

  await sendToken(existingUser._id, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
});

// Only for rendered pages and there will be no Errors
exports.isLoggedIn = async (req, res, next) => {
  /**
   * Checks
   * 1 validate the token
   * 2. if the user is not deleted
   * 3. if the user changed password after the token was issued
   */

  try {
    if (req.cookies.jwt) {
      // 1.
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2.
      const existingUser = await User.findById(decoded.id);
      if (!existingUser) {
        return next();
      }

      // 3.
      const changedPasswordAfterJWTWasIssued = existingUser.changedPasswordAfterJWTWasIssued(
        decoded.iat
      );

      if (changedPasswordAfterJWTWasIssued) {
        return next();
      }

      // GRANT ACCESS TO THE PUG Template
      res.locals.user = existingUser;
      return next();
    }
  } catch (err) {
    return next();
  }

  next();
};

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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  res.locals.user = existingUser;
  next();
});

exports.restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    const err = new AppError(
      "access denied! `unauthorized`: You don't permission to perform this action.",
      403
    );
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

  try {
    await new Email(existingUser, resetURL).sendPasswordReset();

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
  await sendToken(existingUser, 200, res);
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
  const existingUser = await User.findById(req.user.id).select('+password');

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
  await existingUser.save({ validateModifiedOnly: true });

  // 4.
  await sendToken(existingUser, 200, res);
});

