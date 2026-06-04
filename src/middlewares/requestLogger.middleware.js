const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const startAt = Date.now();
  const log = logger.child({ traceId: req.traceId });

  log.info(`--> ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.on('finish', () => {
    const ms = Date.now() - startAt;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    log[level](`<-- ${req.method} ${req.originalUrl} ${res.statusCode} (${ms}ms)`);
  });

  next();
};
