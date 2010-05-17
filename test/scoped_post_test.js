var ScopedClient = require('../lib')
  ,         http = require('http')
  ,          sys = require('sys')
  ,       assert = require('assert')
  ,       called = 0
  ,       client

var server = http.createServer(function(req, res) {
  var body = ''
  req.addListener('data', function(chunk) {
    body += chunk
  })
  req.addListener('end', function() {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(req.method + ' hello: ' + body)
  })
})
server.listen(9999)

client = ScopedClient.create('http://localhost:9999')
client.post(function(req) {
  called++
  req.write('boo', 'ascii')
  req.write('ya',  'ascii')
})(function(resp, body) {
  called++
  assert.equal(200,          resp.statusCode)
  assert.equal('text/plain', resp.headers['content-type'])
  assert.equal('POST hello: booya',      body)

  client.post(function(req) {
    req.addListener('response', function(resp) {
      resp.addListener('end', function() {
        // opportunity to stream response differently
        called++
        server.close()
      })
    })
  })()
})

process.addListener('exit', function() {
  assert.equal(3, called)
})