var express = require('express'),
    CJDNS = require('../../lib/cjdns'),
    config = require('../../config/cjdns.json'),
    cjdns = new CJDNS(config),
    fs = require('fs'),
    formidable = require('formidable'),
    JSONminify = require('node-json-minify'),
    crypto = require('crypto'),
    router = express.Router();

router.post('/', function(req, res) {
  var form = new formidable.IncomingForm(),
      userConf,
      userData;

  function createHash(bytes, callback) {
    var md5sum = crypto.createHash('md5');
    crypto.randomBytes(bytes, function(err, buffer) {
        if (err) {
          return callback(err, null);
        } else {
          md5sum.update(buffer);
          return callback(null, md5sum.digest('hex'));
        }
    });
  }
  function readUserConf(file, callback) {
    console.log('READING FILE');
    fs.readFile(file.path, 'utf-8', function(err, data) {
      console.log(data);
      try {
        callback(null, JSON.parse(JSONminify(data)));
      } catch(err) {
        console.error(err);
        return callback('Unable to parse JSON', null);
      }
    });
  }

  function errorHandler(err, msg) {
    return res.render('error', {
      title: 'HTSIT Hotspot',
      err: err,
      msg: msg || 'Something went wrong'
    });
  }

  /*
   * @params config     The users config file
   * @params hash       The hash to use for the password
   * @params user       User specified data (name, mac etc.)
   * @params pubkey     The hotspots CJDNS public key
   */
  function createUserConf(config, hash, user, pubkey, callback) {
    console.log('GOT HERE');
    var password = hash,
        newConf = config;
  
    /* 
     * This is format we'll create
     * "01:02:03:04:05:06": {
     *    "name": "<Full name>",
     *    "email": "<Email>",
     *    "phone": "<Phone number>",
     *    "password":"<Password>",
     *    "publicKey":"<pubKey>"
     * }
     */
    var ethCred = JSON.parse('{"' + user.macaddress + '":{"name":"' + user.fullname + '", "email":"' + user.email + '", "phone":"' + user.phone + '","password":"' + password + '","publicKey":"' + pubkey + '"}}');

    console.log(ethCred);
    return callback(null, newConf);
  }

  form.parse(req, function(err, fields, files) {
    userData = fields;
    console.log(files);
  });

  form.on('progress', function(bytesReceived, bytesExpected) {
    console.log('[Register] Received', bytesReceived, '/', bytesExpected);
  });

  form.on('file', function(name, file) {
    console.log('[Register] File', file.name, 'received');
    
    readUserConf(file, function userConf(err, config) {
      console.log('GOT CONF', config);
      if (err) {
        return errorHandler(err);
      } else {
        createHash(256, function hashResult(err, hash) {
          console.log('GOT HASH', hash);
          if (err) {
            return errorHandler(err);
          } else {
            console.log(config);
            var pubkey = '123123123123';
            createUserConf(config, hash, userData, pubkey, function newConf(err, config) {
              console.log(err, config);
              return res.send(config);
            });
          }
        });
      }
    });
  });

  form.on('end', function() {
  });

  cjdns.sendAuth({q: 'ping', args: {}}, function (err, msg) {
    if (err) {
      console.log(err);
      return errorHandler(err);
    }

    console.log(msg);
    //return res.send(msg);
  });

});

module.exports = router;
