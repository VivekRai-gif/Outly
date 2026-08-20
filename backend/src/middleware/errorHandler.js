/**
 * Centralized error handler middleware for Express
 * Sanitizes error outputs to avoid leaking sensitive internal stack traces or secrets
 */
export const errorHandler = (err, req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Sanitize logged message to strip out sensitive bearer tokens or passwords
  const sanitizedMessage = (err.message || 'Internal Server Error')
    .replace(/(bearer\s+)[a-zA-Z0-9._-]+/gi, '$1[REDACTED_TOKEN]')
    .replace(/(password|secret)=[^&]+/gi, '$1=[REDACTED]');

  console.error(`[Error] ${req.method} ${req.originalUrl} - ${sanitizedMessage}`);
  
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: sanitizedMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found route handler
 */
export const notFound = (req, res, _next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
  });
};
