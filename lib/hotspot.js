var sys = require('sys'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    child;

/*
 * Try to obtain the MAC address from /proc/net/arp
 */
exports.readARPTable = function readARPTable(ipaddr, callback) {
  if(ipaddr !== ('127.0.0.1' || 'localhost' || '0.0.0.0')) {
 
    fs.readFile('/proc/net/arp', function readArpFile(err, arpData) {

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
exports.getMAC = function getMAC(iface, ipaddr, callback) {
 
  exports.readARPTable(ipaddr, function ARPTableResult(err, macaddr) {
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

}
