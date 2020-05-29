const debug = require('debug')('app:startup');
const { sendRes: JSend } = require('../utils');
const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

exports.getAllTours = (req, res) => {
  debug(req.requestTime);

  JSend.success(res, 200, tours, 'tours');
};

exports.getTour = (req, res) => {
  const tourId = req.params.id * 1;
  const tour = tours.find(({ id }) => id === tourId);
  if (!tour) {
    return JSend.error(res, 404, 'invalid ID');
  }

  JSend.success(res, 200, tour, 'tour');
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      JSend.success(res, 201, newTour, 'tour');
    }
  );
};

exports.updateTour = (req, res) => {
  const tourId = req.params.id * 1;
  const tour = tours.find(({ id }) => id === tourId);
  if (!tour) {
    return JSend.error(res, 404, 'invalid ID');
  }

  JSend.success(res, 200, '<Updated tour here>', 'tour');
};

exports.deleteTour = (req, res) => {
  const tourId = req.params.id * 1;
  const tour = tours.find(({ id }) => id === tourId);
  if (!tour) {
    return JSend.error(res, 404, 'invalid ID');
  }

  JSend.success(res, 204);
};