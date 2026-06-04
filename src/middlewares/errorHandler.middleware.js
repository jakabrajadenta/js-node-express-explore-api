const logger = require('../utils/logger');
const { error: errorResponse } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const log = logger.child({ traceId: req.traceId });

  log.error('Unhandled error', { message: err.message, stack: err.stack });

  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode < 500 ? err.message : 'Internal server error';

  errorResponse(res, message, statusCode);
};
