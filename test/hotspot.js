var HOTSPOT = require('../lib/hotspot.js'),
    net = require('netroute'),
    assert = require('assert');

describe('hotspot', function() {

  var hotspot = new HOTSPOT(require('../config/hotspot.json'));

  describe('.getMAC(iface, ip, callback)', function() {
    it('should return callback with MAC', function(done) {
      
      // Will only work if you're connected to a network
      var netInfo = net.getInfo().IPv4[0] || net.getInfo().IPv6[0];
      hotspot.getMAC(netInfo.interface, '0.0.0.0', './test/assets/arp', function resp(err, mac) {
        assert.equal(err, null);
        assert.equal(typeof mac, 'string');
        done();
      });
    });
  });

  /*
  describe('.credFactory(config)', function() {
    it('should parse the config file', function(done) {

      var credFactory = new hotspot.credFactory('test/assets/hotspot-0.json');
      var config = credFactory.config;

      assert.equal(config.hotspot.maintainer, 'John Doe');
      assert.equal(config.hotspot.email, 'john@doe');
      assert.equal(config.hotspot.phone, '074-111104110');

      done();
    });

    describe('.create(hash, user, callback)', function() {
      it('should return callback with user and server credentials (type 0)', function(done) {
        var credFactory = new hotspot.credFactory('test/assets/hotspot-0.json');
        var userData = {
          fullname: 'John Doe',
          email: 'john@doe',
          phone: '074-111104110',
          macaddress: '01:23:45:67:89:ab'
        };

        credFactory.create('123asdzxcqwe456', userData, function(err, userCred, serverCred) {

          assert.equal(err, null);
          assert.equal(typeof userCred, 'string');
          assert.equal(serverCred['01:23:45:67:89:ab'].name, 'John Doe');

          userCred = JSON.parse(userCred);
          assert.equal(userCred.maintainer, 'John Doe');

          done();
        });
      });
      
      it('should return callback with user and server credentials (type 1)', function(done) {
        var credFactory = new hotspot.credFactory('test/assets/hotspot-1.json');
        var userData = {
          fullname: 'John Doe',
          email: 'john@doe',
          phone: '074-111104110',
          macaddress: '01:23:45:67:89:ab'
        };

        credFactory.create('123asdzxcqwe456', userData, function(err, userCred, serverCred) {

          assert.equal(err, null);
          assert.equal(typeof userCred, 'string');
          assert.equal(serverCred.name, 'John Doe');

          userCred = JSON.parse(userCred);
          assert.equal(userCred['01:23:45:67:89:ab'].maintainer, 'John Doe');

          done();
        });
      });
    });
  });
  */
  describe('.createHash(bytes, callback)', function() {
    it('should return callback with md5 hash', function(done) {

      hotspot.createHash(50, function(err, hash) {
        assert.equal(err, null);
        assert.equal(typeof hash, 'string');
        assert.equal(hash.length, 32);
        done();
      });
    });
  });

  // Becayse Travis doesnt run cjdns 
  /*
  describe('.cjdnsFactory(config)', function() {
    it('should parse the config file and connect to cjdnsadmin', function(done) {
      var cjdnsFactory = new hotspot.cjdnsFactory('test/assets/cjdns.json');
      var cjdns = cjdnsFactory.cjdns;

      cjdns.send({ q: 'ping' }, function(err, msg) {
        if (msg && msg.q === 'pong') {
          done();
        } else {
          throw msg;
        }
      });
    });

    describe('.getNode(ipaddr, callback)', function() {
      it('should find node by ip address and return callback with node info', function(done) {
        var cjdnsFactory = new hotspot.cjdnsFactory('test/assets/cjdns.json');

        cjdnsFactory.getNode('fc99:02f4:7795:c86c:36bd:63ae:cf49:d459', function(err, node) {
          if (err) {
            throw err;
          } else {
            console.log(node);
            done();
          }
        });
      });
    });
  });
  */
});
