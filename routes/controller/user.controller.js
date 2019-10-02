var router = require('express').Router();
var passport = require('passport');
var auth = require('../auth');
var userService = require('../../services/user.services');
var { logger } = require('../../utility/logger');
var {validationResult} = require('express-validator/check');
var {validate} = require('../../utility/user.validation');

router.get('/getUserById', auth.required, function(req, res, next){
  console.log(req.payload);
  userService.getUserById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: userService.toAuthJSON(user)});
  }).catch(next);
});

router.put('/updateUser', auth.required, function(req, res, next){
  userService.updateUser(req).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: userService.toAuthJSON(user)});
  }).catch(next);
});

router.post('/login', validate.validateLogin(), function(req, res, next){
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      logger.logVtuberApi.info('function login successful');
      user.token = userService.generateJWT(user);
      return res.json({user: userService.toAuthJSON(user)});
    } else {
      return res.status(422).json(info);
    }

    

  })(req, res, next);
});

router.post('/registerUser', validate.validateRegisterUser(), function(req, res, next){
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  userService.registerUser(req.body.user).then(function(user){
    return res.json({user: userService.toAuthJSON(user)});
  }).catch(next);
});

module.exports = router;
