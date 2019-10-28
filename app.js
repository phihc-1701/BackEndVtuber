var express = require('express'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  cors = require('cors'),
  errorhandler = require('errorhandler'),
  mongoose = require('mongoose');

var { logger } = require('./utility/logger');
require('dotenv').config();

//Check production or develop mode
var isProduction = process.env.NODE_ENV === 'production';

// Create global app object uss express framework
var app = express();

//Enable cross-origin resource sharing (CORS) with various options.
app.use(cors());

//add morgan
app.use(require('morgan')('dev'));

// Parse HTTP request body. See also: body, co-body, and raw-body.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Override HTTP methods using header.
app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

// Establish server-based sessions (development only).
// app.use(session({ secret: 'vtuber', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

// Error handlers
if (!isProduction) {
  app.use(errorhandler());
}

//Connect mongodb
//mongoose.connect(process.env.MONGODB_URI);

//Require models scheme mongoose
require('./models');

//Require passport authentication
require('./config/passport');

//Require route controller api
app.use(require('./routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  logger.api.error(`url: ${req.originalUrl} Not Found`);
  next(err);
});

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    console.log(err.stack);
    logger.api.error(err.stack);
    res.status(err.status || 500);

    res.json({
      'errors': {
        message: err.message,
        error: err
      }
    });
  });
}

// production error handler
// no stack traces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  logger.api.error(err.message);
  res.json({
    'errors': {
      message: err.message,
      error: {}
    }
  });
});

//let's start our server...
let server = app.listen(process.env.PORT || 3000, function () {
  logger.api.info(`Server listening on port ${server.address().port}`);
  console.log(`Server listening on port ${server.address().port}`);
});

// version express 4.x no need require('http')
//var server = require('http').Server(app);
var io = require('socket.io')(server);
//Add services of socket.io
require('./socket.io')(io);



