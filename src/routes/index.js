const router = require('express').Router();

router.use('/health',      require('./health.routes'));
router.use('/echo',        require('./echo.routes'));
router.use('/api/v1/users', require('./users.routes'));

module.exports = router;
