const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/AppError');

// Filter options for finding all `Reviews`
exports.setFilterOptions = (req, _res, next) => {
  let filterOptions = {};
  if (req.params.tourId) {
    filterOptions = { tour: req.params.tourId };
  }

  req.filterOptions = filterOptions;
  next();
}

exports.setTourUserIDsInReq = (req, _res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
}


exports.getAllReviews = factory.getMany(Review, 'reviews');
exports.getReview = factory.getOne(Review, 'review');
exports.createReview = factory.createOne(Review, 'review');
exports.updateReview = factory.updateOne(Review, 'review');
exports.deleteReview = factory.deleteOne(Review, 'review');
















