const path = require("path");
const debug = require('debug')('app:startup');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/AppError');
const globalErrController = require('./controllers/errorController');

const app = express();

app.set("view engine", 'pug')
app.set('views', path.join(__dirname, 'views'))

// GLOBAL MIDDLEWARES
// Serving Static files
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP Headers
app.use(helmet())

// Logging in `dev` environment
debug(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000
})

app.use('/api', limiter)

// Body parser: reading data from body into `req.body`
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss());

// Prevent Param pollution
app.use(hpp({
  whitelist: [
    'duration',
    'price',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
  ]
}));


// Test middleware
app.use((req, _res, next) => {
  req.requestTime = new Date().toDateString();
  next();
});

// ROUTES
app.get("/", (req, res) => {
  res.status(200).render('index');
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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









































