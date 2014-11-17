ScopedClient = require '../src'
http         = require 'http'
assert       = require 'assert'
called       = 0

client = ScopedClient.create 'http://10.255.255.1:9999'
client.timeout 100

client.get() (err, resp, body) ->
  called++ if err

process.on 'exit', ->
  assert.equal 1, called
