const debug = require('debug')('app:startup');
const { API_Features } = require('../utils');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// MODEL
const TourModel = require('./../models/tourModel');

// MIDDLEWARES
exports.addIdToReq = (req, _res, next, value) => {
  req.id = value;
  next();
};

exports.topCheap = (req, res, next) => {
  req.query.fields = 'name,ratingsAverage,price,duration';
  req.query.limit = 5;
  req.query.page = 1;
  req.query.sort = '-ratingsAverage,price';

  next();
};

// CONTROLLERS
exports.getAllTours = catchAsync(async (req, res, next) => {
  const apiFeatures = new API_Features(TourModel, req.query)
    .filter()
    .sort()
    .paginate()
    .project();

  // EXECUTE QUERY
  const tours = await apiFeatures.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req;

  // const tour = await TourModel.findOne({ _id: id });
  const tour = await TourModel.findById(id);

  if (!tour) {
    return next(new AppError('no `tour` with the given ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  // const newTour = await new TourModel(req.body);
  // const result = await newTour.save()

  const newTour = await TourModel.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id, body } = req;

  const tour = await TourModel.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('no `tour` with the given ID', 404));
  }

  console.log('object', object);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req;

  const tour = await TourModel.findByIdAndRemove(id);

  if (!tour) {
    return next(new AppError('no `tour` with the given ID', 404));
  }

  res.status(204);
});

exports.tourStats = catchAsync(async (_req, res) => {
  const stats = await TourModel.aggregate([
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

exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await TourModel.aggregate([
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
