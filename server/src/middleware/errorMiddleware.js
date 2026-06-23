const { sendError } = require('../utils/responseHandler');

function notFound(req, res, next) {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  if (res.headersSent) {
    return next(error);
  }

  return sendError(res, message, statusCode, error.details || null);
}

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = {
  notFound,
  errorHandler,
  AppError
};

