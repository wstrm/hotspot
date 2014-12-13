var sys = require('sys'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    CJDNS = require('./cjdns'),
    config = require('../config/cjdns.json'),
    crypto = require('crypto'),
    child;

/*
 * Try to obtain the MAC address from arp table (/proc/net/arp etc.)
 */
exports.readARPTable = function readARPTable(ipaddr, arptable, callback) {
  if(ipaddr !== ('127.0.0.1' || 'localhost' || '0.0.0.0')) {
 
    fs.readFile(arptable, function readArpFile(err, arpData) {

      if(err) {
        return callback('[readMACARPTable] ' + err);
      } else {
        var arpTable = String(arpData).split('\n'); // Split into an array

        for(var client = 1, len = arpTable.length; client < len; client++) { // Starting at 1 because of the table header
          if(arpTable[client].indexOf(ipaddr) === 0) {
            var macaddr = arpTable[client].substring(41, 58);
            return callback(null, macaddr);
          }
        }
        return callback('[readARPTable] Error: Unable to find ' + ipaddr + ' in ARP table');
      }
    });
  } else {
    return callback('[readARPTable] Error: Trying to obtain local MAC Address');
  }
};

/*
 * Try to obtain the MAC address with arping
 */
exports.readARPing = function readARPing(iface, ipaddr, callback) {
  
  // You'll get a timeout for arping if you're on localhost
  if(ipaddr !== ('127.0.0.1' || 'localhost' || '0.0.0.0')) {
    var checkResp = setTimeout(function noResp() {
      child.kill('SIGHUP'); // Kill the arping process
      callback('[readARPing] Warning: Arping timeout for ' + ip, null);
    }, 5000);

    child = exec('arping -f -I ' + iface + ' ' + ipaddr + ' | /bin/egrep -o \[0-9A-F:\]\{17\}', function (err, stdout, stderr) {
      if (err) {
        clearTimeout(checkResp);
        return callback(err, null);
      } else {
        clearTimeout(checkResp);
        return callback(null, stdout);
      }
    });
  } else {
    return callback('[readARPPing] Error: Trying to obtain local MAC Address');
  }
};

/*
 * getMAC controller
 */
exports.getMAC = function getMAC(iface, ipaddr, arptable, callback) {
 
  exports.readARPTable(ipaddr, arptable, function ARPTableResult(err, macaddr) {
    if(err) {
      console.error(err);

      // Obtain with arping, as a last resort
      exports.readARPing(iface, ipaddr, function ARPingResult(err, macaddr) {
        if(err) {
          return callback(err);
        } else {
          return callback(null, macaddr);
        }
      });
    } else {
      return callback(null, macaddr);
    }
  });

};

exports.createHash = function createHash(bytes, callback) {
  var md5sum = crypto.createHash('md5');
  crypto.randomBytes(bytes, function(err, buffer) {
    if (err) {
      return callback(err, null);
    } else {
      md5sum.update(buffer);
      return callback(null, md5sum.digest('hex'));
    }
  });
};

exports.errorHandler = function errorHandler(res) {
  this.res = res
  
  return function errorHandler(err, msg) {
    this.res.render('error', {
      title: 'HTSIT Hotspot',
      err: err,
      msg: msg || 'Something went wrong'
    });
  };
};

/*
 * @params config     The users config file
 * @params hash       The hash to use for the password
 * @params user       User specified data (name, mac etc.)
 * @params pubkey     The hotspots CJDNS public key
 */
exports.createCred = function createCred(hash, user, callback) {
  var password = hash;

  /* 
   * This is the format we'll create
   * "01:02:03:04:05:06": {
   *    "name": "<Full name>",
   *    "email": "<Email>",
   *    "phone": "<Phone number>",
   *    "password":"<Password>",
   *    "publicKey":"<pubKey>"
   * }
   */
  var serverCred = JSON.parse('{"' + user.macaddress + '": {\n"name":"' + user.fullname + '", \n"email":"' + user.email + '", \n"phone":"' + user.phone + '",\n"password":"' + password + '",\n"publicKey":"' + user.pubkey + '"\n}\n}');

  /* 
   * This is the format we'll create
   * {
   *    "name": "<Full name>",
   *    "email": "<Email>",
   *    "phone": "<Phone number>",
   *    "password":"<Password>",
   * }
   */
  var userCred = '{\n\t"maintainer": "' + user.fullname + '", \n\t"maintainer-email": "' + user.email + '", \n\t"maintainer-phone": "' + user.phone + '",\n\t"password": "' + password + '"\n}';
  
  return callback(null, userCred, serverCred);
};
