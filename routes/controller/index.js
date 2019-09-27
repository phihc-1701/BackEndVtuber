var router = require('express').Router();

router.use('/user', require('./user.controller'));
 
module.exports = router;