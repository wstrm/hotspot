var config = require('../../config/hotspot.json'),
    IPTUNNEL = require('../../lib/iptunnel.js'),
    iptunnel = new IPTUNNEL(config);

function Routes(router, hotspot, cjdns) {
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

    return res.render('help', {
      err: false,
      conf: hotspot.config
    });

  });

  /* 
   * API
   */

  //PING
  router.get('/api/ping', function(req, res) {
    res.sendStatus(200); 
  });

  //HYPEINFO
  router.get('/api/hypeinfo', function(req, res) {

    res.jsonp({
      ip: cjdns.cjdnsConf.ipv6,
      port: hotspot.config.http.port
    });
  });

  //REGISTER
  router.post('/api/register', function(req, res, next) {
    var userData = req.body;
    var userAddress = req.ip.replace('::ffff:', ''); // Incase of ipv4-mapped ipv6 addresses
   
    console.log(userAddress); 
    console.log('[/register] New registration:', userData);

    // Get the PubKey for the user
    cjdns.NodeStore_nodeForAddr(userAddress, function nodeResult(err, data) {
      if (err) {
        err = new Error(err);
        err.status = 500;
        return next(err);
      } else {
        userData.pubkey = data.result.key;

        // We've got the pubkey, let's create the hash and credentials
        hotspot.createHash(256, function hashResult(err, password) {
          if (err) {
            err = new Error(err);
            err.status = 500;
            return next(err);
          } else {

            // Create credentials
            iptunnel.create(password, userData, function newCred(err, serverCred) {
              console.log(serverCred);

              // Allow connection through IPTunnel
              cjdns.IpTunnel_allowConnection(serverCred.publicKey, serverCred.ip6Prefix, serverCred.ip6Address, function(err, result) {
                if (err || result.error !== 'none') {
                  var err = new Error(err || result.error);
                  err.status = 500;
                  return next(err);
                }
           
                return res.render('register', {
                  cred: cjdns.cjdnsConf.publicKey,
                  err: false,
                  conf: hotspot.config
                });
              });
            });
          }
        });
      }
    });
  });

  //MISC/404
  router.get('*', function(req, res) {

    // Redirect all 404's to home page
    res.redirect('/');
  });
};
module.exports = Routes;
