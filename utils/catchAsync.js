const catchAsync = function (asyncFunc) {
  return function (req, res, next) {
    return asyncFunc(req, res, next).catch((err) => next(err));
  };
};

module.exports = catchAsync;
