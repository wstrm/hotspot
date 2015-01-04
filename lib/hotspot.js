var sys = require('sys'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    //CJDNS = require('cjdnsadmin'),
    config = require('../config/cjdns.json'),
    crypto = require('crypto'),
    path = require('path'),
    child;

var HOTSPOT = function(config) {
  this.config = config;
};

/*
 * Try to obtain the MAC address from arp table (/proc/net/arp etc.)
 */
HOTSPOT.prototype.readARPTable = function readARPTable(ipaddr, arptable, callback) {
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
      return callback('[readARPTable] Warning: Unable to find ' + ipaddr + ' in ARP table');
    }
  });
};

/*
 * Try to obtain the MAC address with arping
 */
HOTSPOT.prototype.readARPing = function readARPing(iface, ipaddr, callback) {
  
  // You'll get a timeout for arping if you're on localhost
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
};

/*
 * getMAC controller
 */
HOTSPOT.prototype.getMAC = function getMAC(iface, ipaddr, arptable, callback) {
  var _this = this;

  this.readARPTable(ipaddr, arptable, function ARPTableResult(err, macaddr) {
    if(err) {
      console.warn(err);

      // Obtain with arping, as a last resort
      _this.readARPing(iface, ipaddr, function ARPingResult(err, macaddr) {
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

HOTSPOT.prototype.createHash = function createHash(bytes, callback) {
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

HOTSPOT.prototype.errorHandler = function errorHandler(res) {
  this.res = res
  
  return function errorHandler(err, msg) {
    this.res.render('error', {
      title: 'HTSIT Hotspot',
      err: err,
      msg: msg || 'Something went wrong'
    });
  };
};

module.exports = HOTSPOT;
