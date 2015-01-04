var express = require('express'),
    hotspot = express(),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser');
    path = require('path'),
    env = hotspot.get('env');

/* View engines */
hotspot.set('views', path.join(__dirname, '../views'));
hotspot.set('view engine', 'jade');

/* Static */
hotspot.use(express.static(path.join(__dirname, '../public')));
hotspot.use(bodyParser.json());
hotspot.use(bodyParser.urlencoded({ extended: false }));
//hotspot.use(favicon());

/* Configuration */
hotspot.enable('trust proxy');

/* Routes */
var routes = require('./routes/index')(hotspot);
//hotspot.use('config', routes);

/* Error handlers */
// Catch 404
hotspot.use(function(req, res, next) {
  var err = new Error('Not found');
  err.status = 404;
  next(err);
});

if (env === 'development') {

  // Dev error handler
  hotspot.use(function(err, req, res, next) {
    return res.status(err.status || 500, { 
      message: err.message,
      error: err 
    }).end();
  });
} else {

  // Prod error handler
  hotspot.use(function(err, req, res, next) {
    return res.status(err.status || 500, {
      message: err.message,
      error: {} // Do not leak stacktraces
    }).end();
  });
}

module.exports = hotspot;
