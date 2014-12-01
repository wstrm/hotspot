var express = require('express'),
    router = express.Router();

router.get('/', function(req, res) {

  res.render('help', { title: 'HTSIT Hotspot' });

});

module.exports = router;
