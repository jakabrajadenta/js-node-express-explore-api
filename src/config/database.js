const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({
  host:               env.DB_HOST,
  port:               env.DB_PORT,
  database:           env.DB_NAME,
  user:               env.DB_USER,
  password:           env.DB_PASSWORD,
  max:                env.DB_POOL_MAX,
  idleTimeoutMillis:  30000,
  connectionTimeoutMillis: 3000
});

pool.on('connect', () => logger.debug('PostgreSQL: new client connected to pool'));
pool.on('error', (err) => logger.error('PostgreSQL pool error', { error: err.message }));

module.exports = pool;
