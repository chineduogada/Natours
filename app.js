const debug = require('debug')('app:startup');
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const globalErrController = require('./controllers/errorController');

// MIDDLEWARES
const app = express();

debug(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

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

// UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  const err = new AppError(
    `no such 'route: ${req.originalUrl}' on this server`,
    404
  );

  next(err);
});

// GLOBAL ERROR HANDLER
app.use(globalErrController);

module.exports = app;
