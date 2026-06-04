const router = require('express').Router();
const { echo } = require('../controllers/echo.controller');

// Accept any HTTP method and any sub-path
router.all('*', echo);

module.exports = router;
