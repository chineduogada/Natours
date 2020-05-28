const debug = require('debug')('app:startup');
const { sendRes: JSend } = require('./utils');
const express = require('express');
const app = express();
const fs = require('fs');
const morgan = require('morgan');

// MIDDLEWARES

app.use(morgan('dev'));

app.use(express.json());

app.use((req, res, next) => {
  debug('Hello from the middleware.');

  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toDateString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// ROUTE HANDLERS

const getAllTours = (req, res) => {
  debug(req.requestTime);

  JSend.success(res, 200, tours, 'tours');
};
const getTour = (req, res) => {
  const tourId = req.params.id * 1;
  const tour = tours.find(({ id }) => id === tourId);
  if (!tour) {
    return JSend.error(res, 404, 'invalid ID');
  }

  JSend.success(res, 200, tour, 'tour');
};
const createTour = (req, res) => {
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
const updateTour = (req, res) => {
  const tourId = req.params.id * 1;
  const tour = tours.find(({ id }) => id === tourId);
  if (!tour) {
    return JSend.error(res, 404, 'invalid ID');
  }

  JSend.success(res, 200, '<Updated tour here>', 'tour');
};
const deleteTour = (req, res) => {
  const tourId = req.params.id * 1;
  const tour = tours.find(({ id }) => id === tourId);
  if (!tour) {
    return JSend.error(res, 404, 'invalid ID');
  }

  JSend.success(res, 204);
};

const getAllUsers = (_req, res) => {
  JSend.error(res, 500, 'This route is not yet defined!');
};
const getUser = (_req, res) => {
  JSend.error(res, 500, 'This route is not yet defined!');
};
const createUser = (_req, res) => {
  JSend.error(res, 500, 'This route is not yet defined!');
};
const updateUser = (_req, res) => {
  JSend.error(res, 500, 'This route is not yet defined!');
};
const deleteUser = (_req, res) => {
  JSend.error(res, 500, 'This route is not yet defined!');
};

// ROUTES

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// STARTS the SERVER

const port = process.env.PORT || 8000;
app.listen(port, '127.0.0.1', () => debug(`Listening on port ${port}...`));
