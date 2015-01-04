/*
 * @params config     The hotspot config
 */
var IPTUNNEL = function IPTUNNEL(config) {
  this.config = config;
};

/*
 * @params hash       The hash to use for the password
 * @params user       User specified data (name, mac etc.)
 */
IPTUNNEL.prototype.create = function createCred(hash, user, callback) {
  var config = this.config;
  var password = hash;

  var serverCred = {
    publicKey: user.pubkey,
    ip6Address: '1111:1111:1111:1111::4', // How do I generate this address for each client?
    ip6Prefix: 0,
    name: user.fullname,
    email: user.email,
    phone: user.phone
  };

  return callback(null, serverCred);
};

module.exports = IPTUNNEL;
