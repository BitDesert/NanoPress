const node = new Ipfs({
  repo: 'ipfs-' + Math.random()
})

node.once('ready', () => {
  console.log('Online status: ', node.isOnline() ? 'online' : 'offline')
  document.getElementById("status").innerHTML = (node.isOnline() ? 'online' : 'offline')
})

node.on('error', error => {
  console.error('IPFS ERROR', error.message)
})

function search(account) {
  var searchaddress = document.getElementById('searchaddress').value

  searchaccount(searchaddress);
}

function searchaccount(account) {

  $.ajax({
      url: "https://nanovault.io/api/node-api",
      type: 'POST',
      contentType : 'application/json',
      data: JSON.stringify({
        account: account,
        action: 'account_history',
        raw: true,
        count: 25
      })
    })
    .done(function (data) {

      for(hist in data.history){
        parseBlock(data.history[hist])
      }

    });

}

function getBytes32FromIpfsHash(ipfsListing) {
  return bs58.decode(ipfsListing).slice(2).toString('hex')
}

function getIpfsHashFromBytes32(bytes32Hex) {
  const hashHex = "1220" + bytes32Hex
  const hashBytes = node.types.Buffer.from(hashHex, 'hex');
  const hashStr = bs58.encode(hashBytes)
  return hashStr
}

function parseBlock(block){
  if(block.type != 'change') return

  var publicKey = keyFromAccount(block.representative);

  var ipfshash = getIpfsHashFromBytes32(publicKey);

  console.log('Change', block.representative, publicKey, ipfshash);

  getIpfsFile(ipfshash);
}

function getIpfsFile(hash) {

  console.log('Get file with hash', hash)

  node.files.cat(hash, function (err, data) {
    if (err) {
      return console.error('Error - ipfs files', err)
    }

    console.log('Got file for', hash)

    console.log(data.toString())

    $('#posts').append('<div class="col-md-12"><div class="card mb-4 box-shadow"><div class="card-body"><p class="card-text">'+data.toString()+'</p></div></div></div>');
  })
}

function store () {
  var toStore = document.getElementById('source').value

  node.files.add(node.types.Buffer.from(toStore), (err, res) => {
    if (err || !res) {
      return console.error('ipfs add error', err, res)
    }

    res.forEach((file) => {
      if (file && file.hash) {
        console.log('successfully stored', file.hash)

        var hashbytes = getBytes32FromIpfsHash(file.hash);
        console.log('bytes', hashbytes)

        var newrep = accountFromKey(hashbytes);
        console.log('account', newrep)

        alert('Now change your rep to: ' + newrep);
      }
    })
  })
}