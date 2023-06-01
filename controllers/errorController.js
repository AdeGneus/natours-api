const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError(`${err.message}!. Please log in again`, 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again', 401);

const handleMulterError = (err) =>
  new AppError(`${err.message}. Please upload an image not exceeding 1MB`, 400);

const handleSendGridError = (err) =>
  new AppError(`${err.response.split('.')[0].replace('550 ', '')}`, 400);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // Rendered website
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // 1)  Operational, trusted error: send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // 2) Programming or other unknown error: don't leak error details
    // eslint-disable-next-line no-console
    console.error('ERROR 💥', err);

    // Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
  // Rendered website
  // eslint-disable-next-line no-lonely-if
  if (err.isOperational) {
    // Operational, trusted error: send message to client
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details

  // eslint-disable-next-line no-console
  console.error('ERROR 💥', err);

  // Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    if (err.name === 'MulterError') err = handleMulterError(err);
    if (err.code === 'EMESSAGE') err = handleSendGridError(err);
    sendErrorProd(err, req, res);
  }
};
