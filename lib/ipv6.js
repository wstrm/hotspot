var start = '2a03:b0c0:2:d0::1c0:f000',
    end = '2a03:b0c0:2:d0::1c0:f00f'

/* NOT DONE */
function commonPrefix(start, end, callback) {
  const blockLen = 8;
  const bitLen = 4;

  for (var block = 0; block < blockLen; block++) {
    for (var bit = 0; bit < bitLen; bit++) {

      if (start[block].charAt(bit) !== end[block].charAt(bit)) {
        callback((parseInt('0x' + end[block]) - parseInt('0x' + start[block])) + 1);
      }         
    }
  }
}

function expandAddress(address, callback) {
  var finalAddress = [];
  var addressArray = address.split(':');
  var addressLen = addressArray.length;

  // We want those redudant 0's
  for (var block = 0; addressLen > block; block++) {
    var currentBlock = addressArray[block];
    var blockLen = currentBlock.length;
    
    // If we got an empty block, fill up the array with the missing ones
    if (currentBlock === '') {
      var numMissing = 8 - addressLen;
      
      // Splice array with '0000' for every missing block
      for (var i = 0; i < numMissing; i++) {
        addressArray.splice(block, 0, '0000');
      }
      
      addressLen = addressArray.length; // Update address length
    }

    // Add missing 0's
    while (blockLen < 4) {
      currentBlock += '0';
      blockLen = currentBlock.length;
    }

    finalAddress.push(currentBlock);
  }

  return callback(finalAddress);
}

function validAddress(address) {
  return address.length === 8;
}

function controller(start, end, callback) {

  // Expand and validate the addresses
  for (var arg = 0; arg < 2; arg++) {
    
    expandAddress(arguments[arg], function resultAddress (address) {
      if (validAddress(address)) {
        if (arg === 0) { // Start address
          start = address;
        } else { // End address
          end = address;
        }
      } else {
        return callback('Invalid IPv6 address');
      }
    });
  }

  commonPrefix(start, end, function resultPrefix (prefix) {
    return callback(null, prefix);
  });
  
}

controller(start, end, function result(err, range) {
  if (err) {
    throw new Error(err);
  }
  
  console.log(range);
});
