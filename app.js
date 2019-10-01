var express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');
    var { logger } = require('./utility/logger');
    require('dotenv').config();

var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
var app = express();

app.use(cors());

// Normal express config defaults
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'vtuber', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
  app.use(errorhandler());
}

mongoose.connect(process.env.MONGODB_URI);

require('./models');
require('./config/passport');

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  logger.logVtuberApi.error(`url: ${req.originalUrl} Not Found`);
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);
    logger.logVtuberApi.error(err.stack);
    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  logger.logVtuberApi.error(err.message);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 3000, function(){
  logger.logVtuberApi.info(`Listening on port ${server.address().port}`);
  console.log(`Listening on port ${server.address().port}`);
});
