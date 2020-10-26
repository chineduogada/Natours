const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require("./handlerFactory");
// const AppError = require('../utils/AppError');

exports.topCheap = (req, _res, next) => {
  req.query.fields = 'name,ratingsAverage,price,duration';
  req.query.limit = 5;
  req.query.page = 1;
  req.query.sort = '-ratingsAverage,price';

  next();
};

// CONTROLLERS
exports.getAllTours = factory.getMany(Tour, 'tours');
exports.getTour = factory.getOne(Tour, 'tour', { path: "reviews" });
exports.createTour = factory.createOne(Tour, 'tour');
exports.updateTour = factory.updateOne(Tour, 'tour');
exports.deleteTour = factory.deleteOne(Tour, 'tour');

// Aggregates
exports.tourStats = catchAsync(async (_req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.monthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1, month: 1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});






























