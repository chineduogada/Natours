const debug = require('debug')('app:startup');
const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// MIDDLEWARES
app.use(morgan('dev'));

app.use(express.json());

app.use((_req, _res, next) => {
  debug('Hello from the middleware.');

  next();
});
app.use((req, _res, next) => {
  req.requestTime = new Date().toDateString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
