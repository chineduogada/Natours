// const Joi = require('joi');
const debug = require('debug')('app:startup');
const { sendRes: JSend } = require('../utils');

// MODEL
const TourModel = require('./../models/tourModel');

// MIDDLEWARES
exports.addIdToReq = (req, _res, next, value) => {
  req.id = value;
  next();
};

// CONTROLLERS
exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    const query = TourModel.find(queryObj);

    // const query = await TourModel.find()
    //   .where('difficulty')
    //   .equals('easy')
    //   .where('duration')
    //   .equals(5)
    //   .sort('name');

    // EXECUTE QUERY
    const tours = await query;

    // SEND RESPONSE
    JSend.success(res, 200, tours, 'tours');
  } catch (ex) {
    JSend.error(res, 404, ex.message);
  }
};

exports.getTour = async (req, res) => {
  try {
    const { id } = req;

    // const tour = await TourModel.findOne({ _id: id });
    const tour = await TourModel.findById(id);

    JSend.success(res, 200, tour, 'tour');
  } catch (ex) {
    JSend.error(res, 404, ex.message);
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = await new TourModel(req.body);
    // const result = await newTour.save()

    const newTour = await TourModel.create(req.body);
    JSend.success(res, 201, newTour, 'tour');
  } catch (ex) {
    JSend.error(res, 400, ex.message);
  }
};

exports.updateTour = async (req, res) => {
  const { id, body } = req;

  try {
    const tour = await TourModel.findByIdAndUpdate(id, body, { new: true });
    JSend.success(res, 200, tour, 'tour');
  } catch (ex) {
    JSend.error(res, 404, ex.message);
  }
};

exports.deleteTour = async (req, res) => {
  const { id } = req;

  try {
    const tour = await TourModel.findByIdAndRemove(id);
    JSend.success(res, 204);
  } catch (ex) {
    JSend.error(res, 404, ex.message);
  }
};
