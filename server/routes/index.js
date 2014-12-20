var express = require('express'),
    router = express.Router(),
    hotspot = require('../../lib/hotspot.js');

router.get('/', function(req, res) {

  hotspot.getMAC('wifi0', req.ip, '/proc/net/arp', function(err, mac) {
    if (err) {
      console.error(err);
      res.render('index', {
        err: true,
        ip: req.ip,
        mac: ''
      });
    } else {
      res.render('index', {
        err: false,
        ip: req.ip,
        mac: mac 
      });
    }
  });
 
});

module.exports = router;
