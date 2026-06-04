const { success } = require('../utils/response');

const echo = (req, res) => {
  return success(res, {
    method:  req.method,
    url:     req.originalUrl,
    headers: req.headers,
    query:   req.query,
    params:  req.params,
    body:    req.body
  }, 'Echo response');
};

module.exports = { echo };
