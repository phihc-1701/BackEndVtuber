var router = require('express').Router();

router.use('/api', require('./controller'));

module.exports = router;
