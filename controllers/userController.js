const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const filterObject = require('../utils/filterObject');
const factory = require("./handlerFactory");

exports.getMe = catchAsync(async (req, _res, next) => {
  req.params.id = req.user.id;

  next();
})

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Throw an Error if password data is POSTed
  if (req.body.password || req.body.passwordCheck) {
    const err = new AppError('This route is not for Password updates. Please use `/updateMyPassword`.', 400);
    return next(err)
  }

  // 2. Filtered unwanted fields that should be updated this way
  const filteredBody = filterObject(req.body, ["name", "email"])

  // 2. update User document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidator: true
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false }, {
    new: true,
    runValidator: true
  });

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.createUser = catchAsync(async (_req, _res, next) => {
  return next(new AppError("This route is not defined! Please use /signup instead."))
})

exports.getAllUsers = factory.getMany(User, 'users');
exports.getUser = factory.getOne(User, 'user');
exports.updateUser = factory.updateOne(User, 'user');
exports.deleteUser = factory.deleteOne(User, 'user');




















