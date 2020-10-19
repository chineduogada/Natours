const debug = require('debug')('app:startup');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const globalErrController = require('./controllers/errorController');

// GLOBAL MIDDLEWARES
const app = express();

// Logging in `dev` environment
debug(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Add Rate Limiter
const limiter = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000
})

app.use('/api', limiter)

// Body parser: make `req.body` available
app.use(express.json());

// Serve Static Content
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, _res, next) => {
  req.requestTime = new Date().toDateString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// UNHANDLED ROUTES
app.all('*', (req, _res, next) => {
  const err = new AppError(
    `no such 'route: ${req.originalUrl}' with the 'method: ${req.method}' on this server`,
    404
  );

  next(err);
});

// GLOBAL ERROR HANDLER
app.use(globalErrController);

module.exports = app;








