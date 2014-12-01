var hotspot = require('../lib/hotspot.js'),
    net = require('netroute');
    assert = require('assert');

describe('hotspot', function() {
  describe('.getMAC(iface, ip, callback)', function() {
    it('should return callback with MAC', function(done) {
      
      var netInfo = net.getInfo().IPv4[0];
      hotspot.getMAC(netInfo.interface, netInfo.gateway, function resp(err, mac) {
        assert.equal(err, null);
        assert.equal(typeof mac, 'string');
        done();
      });
    });
  });
});
