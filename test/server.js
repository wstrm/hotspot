var hotspot = require('../lib/hotspot.js'),
    net = require('netroute'),
    assert = require('assert');

describe('hotspot', function() {
  describe('.getMAC(iface, ip, callback)', function() {
    it('should return callback with MAC', function(done) {
      
      // Will only work if you're connected to a network
      var netInfo = net.getInfo().IPv4[0] || net.getInfo().IPv6[0];
      hotspot.getMAC(netInfo.interface, netInfo.gateway, './test/assets/arp', function resp(err, mac) {
        assert.equal(err, null);
        assert.equal(typeof mac, 'string');
        done();
      });
    });
  });
});
