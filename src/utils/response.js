const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    traceId: res.locals.traceId,
    success: true,
    message,
    data: data ?? null,
    timestamp: new Date().toISOString()
  });
};

const error = (res, message, statusCode = 500, details = null) => {
  const body = {
    traceId: res.locals.traceId,
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  if (details !== null) body.details = details;
  return res.status(statusCode).json(body);
};

module.exports = { success, error };
