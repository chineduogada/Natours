// const Joi = require('joi');
const debug = require('debug')('app:startup');
const { sendRes: JSend, API_Features } = require('../utils');

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
exports.getAllTours = async (req, res) => {
  try {
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
  } catch (ex) {
    res.status(404).json({
      status: 'fail',
      message: ex.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const { id } = req;

    // const tour = await TourModel.findOne({ _id: id });
    const tour = await TourModel.findById(id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (ex) {
    res.status(404).json({
      status: 'fail',
      message: ex.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = await new TourModel(req.body);
    // const result = await newTour.save()

    const newTour = await TourModel.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (ex) {
    res.status(400).json({
      status: 'fail',
      message: ex.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  const { id, body } = req;

  try {
    const tour = await TourModel.findByIdAndUpdate(id, body, { new: true });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (ex) {
    res.status(404).json({
      status: 'fail',
      message: ex.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  const { id } = req;

  try {
    await TourModel.findByIdAndRemove(id);

    res.status(204);
  } catch (ex) {
    res.status(404).json({
      status: 'fail',
      message: ex.message,
    });
  }
};

exports.tourStats = async (_req, res) => {
  try {
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
  } catch (ex) {
    res.status(404).json({
      status: 'fail',
      message: ex.message,
    });
  }
};

exports.monthlyPlan = async (req, res) => {
  try {
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
  } catch (ex) {
    res.status(404).json({
      status: 'fail',
      message: ex.message,
    });
  }
};
