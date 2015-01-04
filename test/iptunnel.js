var IPTUNNEL = require('../lib/iptunnel.js'),
    assert = require('assert');

describe('iptunnel', function() {

  var iptunnel = new IPTUNNEL(require('../config/hotspot.json'));

  describe('.create(hash, user, callback)', function() {
    it('should take hash and user specified data and return callback with credentials for user and server', function(done) {
    
      iptunnel.create('asdfghqwertyuiopzxcvbn1234', {
        fullname: 'John Doe',
        email: 'john@doe',
        phone: '555-555 555',
        pubkey: '4th2o54gaiszurhqp2iuhriu4h3gaeruhgaliuhrga.k'
      }, function(err, user, server) {
        assert.ifError(err);
        assert.equal(typeof user, 'string');
        assert.equal(server.name, 'John Doe');

        done();
      });
    });
  });
});
