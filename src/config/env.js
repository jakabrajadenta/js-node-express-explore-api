module.exports = {
  NODE_ENV:    process.env.NODE_ENV    || 'development',
  PORT:        parseInt(process.env.PORT, 10)        || 3000,
  LOG_LEVEL:   process.env.LOG_LEVEL   || 'info',
  DB_HOST:     process.env.DB_HOST     || 'localhost',
  DB_PORT:     parseInt(process.env.DB_PORT, 10)     || 5432,
  DB_NAME:     process.env.DB_NAME     || 'go_explore',
  DB_USER:     process.env.DB_USER     || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX, 10) || 10
};
