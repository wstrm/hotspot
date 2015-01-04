function checkCon (address, callback) {
  var http = new XMLHttpRequest();
  this.count = 0;

  var conInt = setInterval(function() {

    try { 
      http.open('GET', address + '/api/ping', false);
      http.send();

      if (http.responseText) {
        clearInterval(conInt);
        return callback(null, http.responseText);
      }
    } catch (err) {
      callback('Failed to connect to address (' + this.count + ')');
    }
  
    this.count++;
  }, 1000);
}

function hypeInfo(info) {
  var address = 'http://[' + info.ip + ']:' + info.port;
  var conStatus = document.getElementById('con-status');
  var conErr = document.getElementById('con-error');
  var regForm = document.getElementById('register');

  checkCon(address, function (err) {
    if (err) {
      conErr.innerHTML = err; 
    } else {
      regForm.action = address + '/api/register';
      regForm.style.display = 'block';
      conStatus.style.display = 'none';
    }
  });
}
