const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (req, res) => {
  let newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordCheck: req.body.passwordCheck,
  });

  newUser = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };

  const token = signToken(newUser._id);

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

  const token = signToken(existingUser._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  req.user = {};
  next();
});

exports.restrict = catchAsync(async (req, res, next) => {});

