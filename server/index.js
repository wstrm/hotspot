var express = require('express'),
    app = express(),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser');
    path = require('path'),
    env = app.get('env');
    config = require(path.join(__dirname, '../config/hotspot.json')),
    HOTSPOT = require(path.join(__dirname, '../lib/hotspot.js')),
    hotspot = new HOTSPOT(config),
    CJDNS = require('cjdnsadmin'),
    cjdns = new CJDNS(path.join(__dirname, '../config/cjdns.json'));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  
  next();
});

/* Configuration */
app.enable('trust proxy');

/* View engines */
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');

/* Static */
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(favicon());

/* Routes */
var routes = require(path.join(__dirname, './routes/index'))(app, hotspot, cjdns);

/* Error handlers */
// Catch 404
app.use(function(req, res, next) {
  var err = new Error('Not found');
  err.status = 404;
  next(err);
});

if (env === 'development') {

  // Dev error handler
  app.use(function(err, req, res, next) {
    return res.render('error', {
      title: config.hotspot.title,
      err: err,
      msg: err.message || 'Something went wrong',
      conf: config
    });
  });
} else {

  // Prod error handler
  app.use(function(err, req, res, next) {
    console.error(err); // Log to stderr instead
    
    return res.render('error', {
      title: config.hotspot.title,
      err: '',
      msg: err.message || 'If this problem persists, please contact the maintainer',
      conf: config
    });
  });
}

module.exports = app;
