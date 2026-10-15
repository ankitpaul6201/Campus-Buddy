/**
 * Centralized Application Error Handling Middleware
 */

function errorHandler(err, req, res, next) {
  const correlationId = req.correlationId || 'none';
  let statusCode = err.statusCode || res.statusCode || 500;
  if (statusCode < 400) statusCode = 500;

  let message = err.message || 'Internal Server Error';

  // Handle Mongoose / MongoDB Specific Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account or record with this ${field} already exists.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource ID: ${err.value}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please sign in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // Safe structured error response
  res.status(statusCode).json({
    success: false,
    error: message,
    correlationId,
    timestamp: new Date().toISOString()
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
    correlationId: req.correlationId || 'none'
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
