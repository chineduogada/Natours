const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const { sendRes: JSend } = require('../utils');

exports.getAllUsers = catchAsync(async (_req, res) => {
  const users = await User.find().select('-__v');

  res.status(200).json({
    status: 'success',
    count: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = (_req, res) => {
  JSend.error(res, 500, 'This route is not yet defined!');
};

exports.createUser = (_req, res) => {
  JSend.error(res, 500, 'This route is not yet defined!');
};

exports.updateUser = (_req, res) => {
  JSend.error(res, 500, 'This route is not yet defined!');
};

exports.deleteUser = (_req, res) => {
  JSend.error(res, 500, 'This route is not yet defined!');
};

