var ScopedClient = require('../lib')
  ,         http = require('http')
  ,       assert = require('assert')
  ,       called = false
  ,       client

var server = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.end('hello')
})
server.listen(9999)

client = ScopedClient.create('http://localhost:9999')
client.get()(function(resp, body) {
  called = true
  assert.equal(200,          resp.statusCode)
  assert.equal('text/plain', resp.headers['content-type'])
  assert.equal('hello',      body)
  server.close()
})

process.addListener('exit', function() {
  assert.ok(called)
})