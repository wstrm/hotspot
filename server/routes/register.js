var express = require('express'),
    hotspot = require('../../lib/hotspot'),
    router = express.Router();

router.post('/', function(req, res) {
  var errorHandler = new hotspot.errorHandler(res);
  var credFactory = new hotspot.credFactory('config/hotspot.json');
  var userData = req.body;
  
  console.log('[/register] New registration:', userData);

  hotspot.createHash(256, function hashResult(err, hash) {
    if (err) {
      return errorHandler(err);
    } else {
      credFactory.create(hash, userData, function newCred(err, userCred, serverCred) {
        res.render('register', { cred: userCred });
      });
    }
  });

  /*cjdns.sendAuth({q: 'ping', args: {}}, function (err, msg) {
    if (err) {
      console.log(err);
      return errorHandler(err);
    }

    console.log(msg);
    //return res.send(msg);
  });*/

});

module.exports = router;
