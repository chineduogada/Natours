const Joi = require('joi');
const debug = require('debug')('app:startup');
const { sendRes: JSend } = require('../utils');

// MODELS
const TourModel = require('./../models/tourModel');

// VALIDATORS
exports.checkBody = (req, res, next) => {
  const schema = {
    name: Joi.string().required(),
    price: Joi.number().required(),
  };

  const body = {
    name: req.body.name,
    price: req.body.price,
  };

  const { error } = Joi.validate(body, schema);

  if (error) {
    return JSend.error(res, 400, error.details[0].message);
  }

  next();
};

// CONTROLLERS
exports.getAllTours = (req, res) => {
  debug(req.requestTime);

  JSend.success(res, 201, '<create all tours here>', 'tour');
};

exports.getTour = (req, res) => {
  JSend.success(res, 201, '<get tour here>', 'tour');
};

exports.createTour = (req, res) => {
  JSend.success(res, 201, '<create tour here>', 'tour');
};

exports.updateTour = (req, res) => {
  JSend.success(res, 200, '<Updated tour here>', 'tour');
};

exports.deleteTour = (req, res) => {
  JSend.success(res, 204);
};
