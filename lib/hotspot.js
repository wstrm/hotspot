var sys = require('sys'),
    exec = require('child_process').exec,
    child;

exports.getMAC = function getMAC(iface, ip, callback) {
  
  var checkResp = setTimeout(function noResp() {
    child.kill('SIGHUP'); // Kill the arping process
    callback('Arping timeout for ' + ip, null);
  }, 5000);
 
  // You'll get a timeout for arping if you're on localhost
  child = exec('arping -f -I ' + iface + ' ' + ip + ' | /bin/egrep -o \[0-9A-F:\]\{17\}', function (err, stdout, stderr) {
    if (err) {
      clearTimeout(checkResp);
      callback(err, null);
    } else {
      clearTimeout(checkResp);
      callback(null, stdout);
    }
  });
}
