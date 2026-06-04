const pool = require('../config/database');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const pkg = require('../../package.json');

const healthCheck = async (req, res) => {
  const log = logger.child({ traceId: req.traceId });

  let dbStatus  = 'ok';
  let dbLatency = null;

  try {
    const t0 = Date.now();
    await pool.query('SELECT 1');
    dbLatency = `${Date.now() - t0}ms`;
  } catch (err) {
    dbStatus = 'error';
    log.warn('Health check: DB ping failed', { error: err.message });
  }

  const overall = dbStatus === 'ok' ? 'ok' : 'degraded';

  const payload = {
    status:  overall,
    uptime:  `${process.uptime().toFixed(2)}s`,
    app: {
      name:        pkg.name,
      version:     pkg.version,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    },
    services: {
      database: { status: dbStatus, latency: dbLatency }
    },
    timestamp: new Date().toISOString()
  };

  if (overall === 'ok') return success(res, payload, 'Service is healthy');
  return error(res, 'Service is degraded', 503);
};

module.exports = { healthCheck };
