const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

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

const filterObj = (obj, allowedFields) =>{
  const filteredObj = {};
  
  for (key in obj) {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  }

  return filteredObj
 } 

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Throw an Error if password data is POSTed
  if (req.body.password || req.body.passwordCheck) {
    const err = new AppError('This route is not for Password updates. Please use `/updateMyPassword`.', 400);
    return next(err)
  }

  // 2. Filtered unwanted fields that should be updated this way
  const filteredBody = filterObj(req.body, ["name", "email"])

  // 2. update User document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidator: true
  });

  res.status(200).json({
    status: "success", 
    data: {
      user: updatedUser
    }
  })
})

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















