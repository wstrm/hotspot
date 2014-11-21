var express = require('express'),
    router = express.Router();

var sys = require('sys'),
    exec = require('child_process').exec,
    child;

function getMAC(iface, ip, callback) {
  child = exec('arping -f -I ' + iface + ' ' + ip + ' | /bin/egrep -o \[0-9A-F:\]\{17\}', function (err, stdout, stderr) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, stdout);
    }
  });
}


router.get('/', function(req, res) {

  getMAC('wifi0', req.ip, function(err, mac) {
    if (err) {
      res.render('index', {
        title: 'HTSIT Hotspot',
        ip: req.ip,
        mac: ''
      });
    } else {
      res.render('index', {
        title: 'HTSIT Hotspot',
        ip: req.ip,
        mac: mac 
      });
    }
  });
 
});

module.exports = router;
