function getPubKey (ip) {
  var http = new XMLHttpRequest();

  http.open('GET', '/api/pubkey&' + ip, false);
  http.send(null);

  return http.responseText;
}

function checkCon (ip, callback) {
  var http = new XMLHttpRequest();
  
  var conInt = setInterval(function() {
 
    http.open('GET', 'http://' + ip + '/api/ping', false);
    http.send(null);

    if (http.responseText) {
      clearInterval(conInt);
      return callback();
    }
  
  }, 1000);
}

checkCon('[fc74:73e8:3913:f15b:d463:2fe7:db69:381e]:3535', function () {
  console.log('Found connection!');
});
