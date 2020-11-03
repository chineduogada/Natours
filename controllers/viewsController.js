const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');

exports.getOverview = catchAsync(async (_req, res) => {
  const tours = await Tour.find();

  res.status(200).render('index', {
    title: 'Exciting tours for adventurous people',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) {
    const err = new AppError('There is no `Tour` with that name!', 404);
    return next(err);
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (_req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (_req, res) => {
  res.status(200).render('signup', {
    title: 'Create a new account',
  });
};

exports.getAccount = (_req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true, runValidators: true }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user,
  });
});

