var ScopedClient = require('../lib')
  ,         http = require('http')
  ,          sys = require('sys')
  ,       assert = require('assert')
  ,       called = 0
  ,         curr = null
  ,           ua = null
  ,       client

var server = http.createServer(function(req, res) {
  var body = ''
  req.addListener('data', function(chunk) {
    body += chunk
  })
  req.addListener('end', function() {
    curr         = req.method
    ua           = req.headers['user-agent']
    var respBody = curr + ' hello: ' + body + ' ' + ua
    res.writeHead(200, {'content-type': 'text/plain', 
      'content-length': respBody.length})
    if(curr != 'HEAD')
      res.write(respBody)
    res.end()
  })
})
server.listen(9999)
server.addListener('listening', function() {
  client = ScopedClient.create('http://localhost:9999')
    .headers({'user-agent':'bob'})
  client.del()(function(err, resp, body) {
    called++
    assert.equal('DELETE', curr)
    assert.equal('bob', ua)
    assert.equal("DELETE hello:  bob", body)
    client.header('user-agent', 'fred').put('yea')(function(err, resp, body) {
      called++
      assert.equal('PUT', curr)
      assert.equal('fred', ua)
      assert.equal("PUT hello: yea fred", body)
      client.userAgent('jim').head()(function(err, resp, body) {
        called++
        assert.equal('jim', ua)
        assert.equal('HEAD', curr)
        server.close()
      })
    })
  })
})

process.addListener('exit', function() {
  assert.equal(3, called)
})