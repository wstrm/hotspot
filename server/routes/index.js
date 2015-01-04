var config = require('../../config/hotspot.json'),
    HOTSPOT = require('../../lib/hotspot.js'),
    IPTUNNEL = require('../../lib/iptunnel.js'),
    hotspot = new HOTSPOT(config),
    iptunnel = new IPTUNNEL(config);

function Routes(router) {
  /*
   * HOME
   */
  router.get('/', function(req, res) {
   
    res.render('index', {
      err: false,
      conf: hotspot.config,
    });

    // Removing all MAC based auth
    /*
    hotspot.getMAC('wifi0', req.ip, '/proc/net/arp', function(err, mac) {
      if (err) {
        console.error(err);
        res.render('index', {
          err: true,
          conf: hotspot.config,
          ip: req.ip,
          mac: ''
        });
      } else {
        res.render('index', {
          err: false,
          conf: hotspot.config,
          ip: req.ip,
          mac: mac 
        });
      }
    });
    */

  });

  /*
   * IPTUNNEL
   */
  router.get('/iptunnel', function(req, res) {
    res.render('iptunnel', {
      err: false,
      conf: hotspot.config,
    });
  });

  /*
   * HELP
   */
  router.get('/help', function(req, res) {

    //res.render('help', { title: 'HTSIT Hotspot' });

  });

  /* 
   * API
   */

  //PING
  router.get('/api/ping', function(req, res) {
    res.sendStatus(200);
  });

  //REGISTER
  router.post('/register', function(req, res) {
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
};
module.exports = Routes;
