const errorHandler = (error, req, res, next) => {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Firebase Admin errors
  if (error.code?.startsWith('auth/')) {
    statusCode = 401;
    switch (error.code) {
      case 'auth/id-token-expired':
        message = 'Authentication token has expired';
        break;
      case 'auth/invalid-id-token':
        message = 'Invalid authentication token';
        break;
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      default:
        message = 'Authentication error';
    }
  }

  // Firestore errors
  if (error.code?.includes('firestore')) {
    statusCode = 500;
    message = 'Database operation failed';
    if (process.env.NODE_ENV === 'development') {
      details = error.message;
    }
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = error.details || error.message;
  }

  // MongoDB/Database errors
  if (error.name === 'MongoError' || error.name === 'CastError') {
    statusCode = 400;
    message = 'Database query error';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Rate limiting errors
  if (error.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request entity too large';
  }

  // Custom application errors
  if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Prepare error response
  const errorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = details || error.message;
    errorResponse.stack = error.stack;
  }

  // Add request ID if available
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /health',
      'POST /api/auth/login',
      'GET /api/campaigns',
      'POST /api/campaigns',
      'GET /api/users',
      'GET /api/analytics'
    ]
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
}; 