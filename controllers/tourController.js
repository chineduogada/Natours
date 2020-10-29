const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require("./handlerFactory");
const AppError = require('../utils/AppError');
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

// /within/300/center/34.241828, -118.660343/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const earthRadius = unit === "mi" ? 3958.8 : 6371;
  const radians = distance / earthRadius

  if (!lat || !lng) {
    return next(new AppError("Wrong param format! has to be .../center/lat,lng/...", 400))
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radians]
      }
    }
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours
    }
  })
});

exports.getTourDistances = catchAsync(async (req, res, next) => {

  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(new AppError("Wrong param format! has to be .../center/lat,lng/...", 400))
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: "distance",
        distanceMultiplier: multiplier
      }
    },
    {
      $project: { distance: 1, name: 1 }
    }
  ]);

  res.status(200).json({
    status: "success",
    results: distances.length,
    data: {
      distances
    }
  })
})






































































