require('dotenv').config();

const express = require('express');
const env     = require('./config/env');
const logger  = require('./utils/logger');
const { error: errorResponse } = require('./utils/response');

const traceIdMiddleware      = require('./middlewares/traceId.middleware');
const requestLoggerMiddleware = require('./middlewares/requestLogger.middleware');
const errorHandlerMiddleware  = require('./middlewares/errorHandler.middleware');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(traceIdMiddleware);
app.use(requestLoggerMiddleware);

app.use('/', routes);

// 404 – route not found
app.use((req, res) => {
  errorResponse(res, `Cannot ${req.method} ${req.originalUrl}`, 404);
});

// Global error handler (must be last, 4-arg signature)
app.use(errorHandlerMiddleware);

const server = app.listen(env.PORT, () => {
  logger.info('Server started', {
    port: env.PORT,
    env:  env.NODE_ENV,
    node: process.version
  });
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

module.exports = app;
