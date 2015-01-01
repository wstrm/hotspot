var express = require('express'),
    hotspot = require('../../lib/hotspot'),
    CJDNS = require('cjdnsadmin'),
    router = express.Router();

var credFactory = new hotspot.credFactory('config/hotspot.json'),
    cjdns = new CJDNS('config/cjdns.json');

console.log('test');

router.post('/', function(req, res) {
  var errorHandler = new hotspot.errorHandler(res);
  var userData = req.body;
  var userAddress = req.ip.replace('::ffff:', '');
  
  console.log('[/register] New registration:', userData);

  //console.log(userAddress);

  // Probably need to rethink some stuff.
  /*
  cjdns.NodeStore_nodeForAddr('fc74:73e8:3913:f15b:d463:2fe7:db69:381e', function nodeResult(err, data) {
    if (err) {
      return errorHandler(err);
    } else {
      console.log(data);
    }
  });
  */

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
