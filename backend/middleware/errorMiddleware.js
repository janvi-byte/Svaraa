export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, _next) {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  console.error(error);
  res.status(statusCode).json({
    message: error.message || 'Internal server error',
  });
}
