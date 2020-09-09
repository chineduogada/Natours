const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');

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

exports.restrict = catchAsync(async (req, res, next) => {});

