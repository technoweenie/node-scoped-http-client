var ScopedClient = require('../lib')
  ,       assert = require('assert')
  ,       client

client = ScopedClient.create('http://user:pass@foo.com/bar/baz?a=1&b[]=2&c[d]=3')
assert.equal('http:',     client.options.protocol)
assert.equal('foo.com',   client.options.hostname)
assert.equal('/bar/baz',  client.options.pathname)
assert.equal('user:pass', client.options.auth)
assert.equal(1,           client.options.query.a)
assert.deepEqual([2],     client.options.query.b)
assert.deepEqual({d:3},   client.options.query.c)

assert.equal('http://user:pass@foo.com/bar/baz?a=1&b%5B%5D=2&c%5Bd%5D=3', client.url())

delete client.options.query.b
delete client.options.query.c
client.hash('boom').auth('user', 'monkey').protocol('https')
assert.equal('https://user:monkey@foo.com/bar/baz?a=1#boom', client.url())

client.path('qux').auth('user:pw').hash()
assert.equal('https://user:pw@foo.com/bar/baz/qux?a=1', client.url())

client.query('a').query('b', 2).query({c: 3}).path('/boom')
assert.equal('https://user:pw@foo.com/boom?b=2&c=3', client.url())

client.auth().query('b').query('c')
assert.equal('https://foo.com/boom', client.url())