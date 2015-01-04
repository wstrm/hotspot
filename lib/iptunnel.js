/*
 * @params config     The hotspot config
 */
var IPTUNNEL = function IPTUNNEL(config) {
  this.config = config;
};

/*
 * @params hash       The hash to use for the password
 * @params user       User specified data (name, mac etc.)
 * @params pubkey     The hotspots CJDNS public key
 */
IPTUNNEL.prototype.create = function createCred(hash, user, callback) {
  var config = this.config;
  var password = hash;
  var serverCred, userCred;

  // server to client
  if (config.cjdns.type === 0) {
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
    serverCred = JSON.parse('{"' + user.macaddress + '": {\n"name":"' + user.fullname + '", \n"email":"' + user.email + '", \n"phone":"' + user.phone + '",\n"password":"' + password + '",\n"publicKey":"' + user.pubkey + '"\n}\n}');

    /* 
     * This is the format we'll create
     * {
     *    "name": "<Full name>",
     *    "email": "<Email>",
     *    "phone": "<Phone number>",
     *    "password":"<Password>",
     * }
     */
    userCred = '{\n\t"maintainer": "' + config.hotspot.maintainer + '", \n\t"maintainer-email": "' + config.hotspot.email + '", \n\t"maintainer-phone": "' + config.hotspot.phone + '",\n\t"password": "' + password + '"\n}';
  
  // client to server
  } else if (config.cjdns.type === 1) {

    userCred = '{"' + user.macaddress + '": \n\t{\n\t\t"maintainer":"' + config.hotspot.maintainer + '", \n\t\t"maintainer-email":"' + config.hotspot.email + '", \n\t\t"maintainer-phone":"' + config.hotspot.phone + '",\n\t\t"password":"' + password + '",\n\t\t"publicKey":"' + user.pubkey + '"\n\t}\n}';

    serverCred = JSON.parse('{\n\t"name": "' + user.fullname + '", \n\t"maintainer-email": "' + user.email + '", \n\t"maintainer-phone": "' + user.phone + '",\n\t"password": "' + password + '"\n}');
   
  } else {
    throw 'Please enter the correct connection type';
  }


  return callback(null, userCred, serverCred);
};

module.exports = IPTUNNEL;
