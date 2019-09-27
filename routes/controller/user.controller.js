var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');
var userService = require('../../services/user.services');

router.get('/getUserById', auth.required, function(req, res, next){
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

router.post('/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = userService.generateJWT(user);
      return res.json({user: userService.toAuthJSON(user)});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/registerUser', function(req, res, next){
  userService.registerUser(req.body.user).then(function(user){
    return res.json({user: userService.toAuthJSON(user)});
  }).catch(next);
});

module.exports = router;
