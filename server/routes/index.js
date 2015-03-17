var net         = require('net'),
    iptdConfig  = require('../../config/iptd.json');

function Routes(router, hotspot, cjdns) {
  /*
   * HOME
   */
  router.get('/', function(req, res) {
   
    res.render('index', {
      err: false,
      conf: hotspot.config,
    });
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
    
    tunnelOpts = iptdConfig; 
   
    console.log(userAddress); 
    console.log('[/register] New registration:', userData);

    function registerTunnel (options, regData) {
      regData.password = options.password;
      var data = '';

      var client = net.connect({ host: options.host || 'localhost', port: options.port || 4132 }, function() {
        console.log('Connected to IPTd');
        client.write(JSON.stringify(regData));
      });

      client.on('data', function(buffer) {
        data += buffer;
      });

      client.on('end', function() {
        console.log('Disconnected from IPTd');
        
        try {
          data = JSON.parse(data);
        } catch (err) {
          console.error(err);

          err = new Error('Something went wrong');
          err.status = 500;
          return next(err);
        }

        if (data.error || data.status === 0) {
          var err = new Error(err || 'Something went wrong');
          err.status = 500;
          return next(err);
        }

        if (data.status === 1) {
          console.log('Successfully registered new user to IPTd');

          return res.render('register', {
            cred: data.data.pubkey,
            err: false,
            conf: hotspot.config
          });
        }
      });
    }
    
    regData = {
      misc: {
        name: userData.name,
        phone: userData.phone,
        email: userData.email
      }
    };

    if (userData.pubkey) { // Check for manual entry
      regData.pubkey = userData.pubkey;

      registerTunnel(tunnelOpts, regData);
    } else {
      // Get the PubKey for the user
      cjdns.NodeStore_nodeForAddr(userAddress, function nodeResult(err, data) {
        if (err) {
          err = new Error(err);
          err.status = 500;
          return next(err);
        } else if (data.result && data.result.key) {
          regData.pubkey = data.result.key;

          registerTunnel(tunnelOpts, regData);
        }
      });
    }
  });

  //MISC/404
  router.get('*', function(req, res) {

    // Redirect all 404's to home page
    res.redirect('/');
  });
};
module.exports = Routes;
