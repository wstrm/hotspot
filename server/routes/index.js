var express = require('express'),
    router = express.Router(),
    hotspot = require('../../lib/hotspot.js');

router.get('/', function(req, res) {

  hotspot.getMAC('wifi0', req.ip, function(err, mac) {
    if (err) {
      console.error(err);
      res.render('index', {
        title: 'HTSIT Hotspot',
        err: true,
        ip: req.ip,
        mac: ''
      });
    } else {
      res.render('index', {
        title: 'HTSIT Hotspot',
        err: false,
        ip: req.ip,
        mac: mac 
      });
    }
  });
 
});

module.exports = router;
