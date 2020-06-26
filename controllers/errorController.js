const AppError = require('../utils/AppError');

const sendResDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendResProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('UNEXPECTED, PROGRAMMING or UNCAUGHT ERROR', err, err.stack);

    res.status(500).json({
      status: 'error',
      message: 'something went very wrong!',
    });
  }
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

const globalErrController = (err, _req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || '500';

  if (process.env.NODE_ENV === 'development') {
    sendResDev(err, res);
  } else {
    let error = { ...err, message: err.message, stack: err.stack };

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.code === 11000) error = handleDuplicationKeyError(error);

    sendResProd(error, res);
  }

  next();
};

module.exports = globalErrController;
