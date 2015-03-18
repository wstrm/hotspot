"use strict";
var HTTP_TIMEOUT = 1000;

function checkCon (address, callback) {
  var http = new XMLHttpRequest();
  var count = 0;

  function initCon() {

    var httpTimeout = setTimeout(function() {
      return callback('Failed to connect to address (' + count + ')');
    }, HTTP_TIMEOUT);

    try { 
      http.open('GET', address + '/api/ping', true);

      http.addEventListener('load', function () {
        if (http.responseText && http.status === 200) {
          clearInterval(conInt);
          clearTimeout(httpTimeout);
          return callback(null, http.responseText);
        }
      });

      http.send();
    } catch (err) {
      callback('Failed to connect to address (' + count + ')');
      return clearTimeout(httpTimeout);
    }
  
    count++;
  }
  
  var conInt = setInterval(initCon, 5000);
  initCon();
}

function hypeInfo(info) {
  var address = ('https:' == document.location.protocol ? 'https://' : 'http://') + '[' + info.ip + ']:' + info.port;
  var manPubKey = document.getElementById('man-pubkey');
  var conStatus = document.getElementById('con-status');
  var conErr = document.getElementById('con-error');
  var regForm = document.getElementById('register');

  checkCon(address, function (err) {
    conStatus.innerHTML = 'Trying to connect to CJDNS...';
    manPubKey.style.display = 'none';

    if (err) {
      console.error(err);
      
      conErr.innerHTML = err;
    } else {
      console.info('Successfully fetched IP address');
      
      regForm.action = address + '/api/register';
      regForm.style.display = 'block';
      conStatus.style.display = 'none';
    }
  });
}
