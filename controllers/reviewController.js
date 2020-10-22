const Review = require("../models/reviewModel");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllReviews = catchAsync(async (_req, res) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews
    }
  })
})

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    const err = new AppError("no `review` with the given `Id`.", 404);
    return next(err);
  }

  res.status(200).json({
    status: "success",
    data: {
      review
    }
  })
})

exports.createReview = catchAsync(async (req, res) => {
  // const review = await Review.create({
  //   review: req.body.review,
  //   rating: req.body.rating,
  //   user: req.user._id,
  //   tour: req.body.tour,
  // });

  const review = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review
    }
  })
})













