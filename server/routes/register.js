var express = require('express'),
    hotspot = require('../../lib/hotspot'),
    CJDNS = require('cjdnsadmin'),
    router = express.Router();

var credFactory = new hotspot.credFactory('config/hotspot.json'),
    cjdns = new CJDNS('config/cjdns.json');

router.post('/', function(req, res) {
  var errorHandler = new hotspot.errorHandler(res);
  var userData = req.body;
  
  console.log('[/register] New registration:', userData);

  hotspot.createHash(256, function hashResult(err, hash) {
    if (err) {
      return errorHandler(err);
    } else {
      credFactory.create(hash, userData, function newCred(err, userCred, serverCred) {
        if (err) {
          return errorHandler(err);
        } else {
          cjdns.AuthorizedPasswords_add(serverCred.name, serverCred.password, undefined, undefined, function(err, msg) {
            if (err) {
              return errorHandler(err);
            } else {

              return res.render('register', { cred: userCred });
            }
          });
        }
      });
    }
  });
});

module.exports = router;
