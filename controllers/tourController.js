const Joi = require('joi');
const debug = require('debug')('app:startup');
const { sendRes: JSend } = require('../utils');

// MODEL
const TourModel = require('./../models/tourModel');

// CONTROLLERS
exports.getAllTours = (req, res) => {
  debug(req.requestTime);

  JSend.success(res, 201, '<get all tours here>', 'tour');
};

exports.getTour = (req, res) => {
  JSend.success(res, 201, '<get tour here>', 'tour');
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

exports.updateTour = (req, res) => {
  JSend.success(res, 200, '<Updated tour here>', 'tour');
};

exports.deleteTour = (req, res) => {
  JSend.success(res, 204);
};
