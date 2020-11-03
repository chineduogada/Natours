const AppError = require('../utils/AppError');

const sendResDev = (err, req, res) => {
  // Api
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered website
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendResProd = (err, req, res) => {
  // Api
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error('UNEXPECTED, PROGRAMMING or UNCAUGHT ERROR', err, err.stack);

    return res.status(500).json({
      status: 'error',
      message: 'something went very wrong!',
    });
  }

  // Rendered website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  console.error('UNEXPECTED, PROGRAMMING or UNCAUGHT ERROR', err, err.stack);

  return res.status(500).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  });
};

const handleCastError = (err) => {
  const { path, value, kind } = err;
  const message = `this is due to a wrong input format! '${path}: "${value}"'. type is suppose to be '${kind}'`;

  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. And ');
  const message = `invalid data input!: ${errors}`;

  return new AppError(message, 400);
};

const handleDuplicationKeyError = (err) => {
  const regex = /\{.+\}/;
  const keyValueErr = `${err.errmsg.match(regex)[0]}`
    .replace(/[\{\}]/g, '')
    .trim();

  const message = `duplication of input value!: '${keyValueErr}'`;

  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token! please log in again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('token has expired! please log in again.', 401);
};

const globalErrController = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || '500';

  if (process.env.NODE_ENV === 'development') {
    sendResDev(err, req, res);
  } else {
    let error = { ...err, message: err.message, stack: err.stack };

    if (error.code === 11000) {
      error = handleDuplicationKeyError(error);
    }
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }

    sendResProd(error, req, res);
  }

  next();
};

module.exports = globalErrController;

