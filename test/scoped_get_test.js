var ScopedClient = require('../lib')
  ,          sys = require('sys')
  ,         http = require('http')
  ,       assert = require('assert')
  ,       called = 0
  ,       client

var server = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.end(req.method + ' ' + req.url + ' -- hello ' + req.headers['accept'])
})
server.listen(9999)

client = ScopedClient.create('http://localhost:9999', {headers: {accept: 'text/plain'}})
client.get()(function(resp, body) {
  called++
  assert.equal(200,          resp.statusCode)
  assert.equal('text/plain', resp.headers['content-type'])
  assert.equal('GET / -- hello text/plain', body)
  client.path('/a').query('b', '1').get()(function(resp, body) {
    called++
    assert.equal(200,          resp.statusCode)
    assert.equal('text/plain', resp.headers['content-type'])
    assert.equal('GET /a?b=1 -- hello text/plain', body)
    server.close()
  })
})

process.addListener('exit', function() {
  assert.equal(2, called)
})