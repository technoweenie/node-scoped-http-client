var ScopedClient = require('../lib')
  ,       assert = require('assert')
  ,       called = false
  ,       client

client = ScopedClient.create('http://user:pass@foo.com:81/bar/baz?a=1&b[]=2&c[d]=3')
assert.equal('http:',     client.options.protocol)
assert.equal('foo.com',   client.options.hostname)
assert.equal('/bar/baz',  client.options.pathname)
assert.equal(81,          client.options.port)
assert.equal('user:pass', client.options.auth)
assert.equal(1,           client.options.query.a)
assert.deepEqual([2],     client.options.query.b)
assert.deepEqual({d:3},   client.options.query.c)

assert.equal('http://user:pass@foo.com:81/bar/baz?a=1&b%5B%5D=2&c%5Bd%5D=3', client.url())

delete client.options.query.b
delete client.options.query.c
client.hash('boom').auth('user', 'monkey').protocol('https')
assert.equal('https://user:monkey@foo.com:81/bar/baz?a=1#boom', client.url())

client.path('qux').auth('user:pw').port(82).hash()
assert.equal('https://user:pw@foo.com:82/bar/baz/qux?a=1', client.url())

client.query('a').host('bar.com').port(443).query('b', 2).query({c: 3}).path('/boom')
assert.equal('https://user:pw@bar.com/boom?b=2&c=3', client.url())

client.auth().host('foo.com').query('b').query('c')
assert.equal('https://foo.com/boom', client.url())

client.scope('api', function(scope) {
  called = true
  assert.equal('https://foo.com/boom/api', scope.url())
})
assert.equal('https://foo.com/boom', client.url())
assert.ok(called)

called = false
client.scope('http://', function(scope) {
  called = true
  assert.equal('http://foo.com/boom', scope.url())
})
assert.ok(called)

called = false
client.scope('https://bar.com', function(scope) {
  called = true
  assert.equal('https://bar.com/boom', scope.url())
})
assert.ok(called)

called = false
client.scope('/help', {protocol: 'http:'}, function(scope) {
  called = true
  assert.equal('http://foo.com/help', scope.url())
})
assert.ok(called)
assert.equal('https://foo.com/boom', client.url())