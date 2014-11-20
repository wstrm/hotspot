var express = require('express'),
    debug = require('debug')('hotspot:routes');
    router = express.Router();

router.post('/', function(req, res) {
  var userData = req.body;
  debug('incoming user registration', userData);

  /* REGISTER HERE */

});

module.exports = router;
