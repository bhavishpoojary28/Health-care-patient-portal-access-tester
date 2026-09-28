const errorHandler = (err, req, res, next) => {
  console.error('[App Error]:', err.stack || err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    error: `Not Found - ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
};

module.exports = { errorHandler, notFound };
