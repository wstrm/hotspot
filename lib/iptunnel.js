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
  var serverCred, userCred;


  userCred = 'serverPubKeyHere';

  serverCred = {
    publicKey: user.pubkey,
    ip6Address: 'addressHere', // How do I generate this address for each client?
    ip6Prefix: 0,
    name: user.fullname,
    email: user.email,
    phone: user.phone
  };

  return callback(null, userCred, serverCred);
};

module.exports = IPTUNNEL;
