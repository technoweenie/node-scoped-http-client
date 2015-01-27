ScopedClient = require '../src'
Sys          = require 'sys'
http         = require 'http'
assert       = require 'assert'
called       = 0
len          = null

server = http.createServer (req, res) ->
  body = ''
  req.on 'data', (chunk) ->
    body += chunk

  req.on 'end', ->
    len = req.headers['content-length']
    res.writeHead 200, 'Content-Type': 'text/plain'
    res.end "#{req.method} hello: #{body}"

server.listen 9999

server.on 'listening', ->
  client = ScopedClient.create 'http://localhost:9999'
  client.post((err, req) ->
    called++
    req.write 'boo', 'ascii'
    req.write 'ya',  'ascii'
  ) (err, resp, body) ->
    called++
    assert.equal 200,          resp.statusCode
    assert.equal 'text/plain', resp.headers['content-type']
    assert.equal 'POST hello: booya', body

    client.post((err, req) ->
      req.on 'response', (resp) ->
        resp.on 'data', (chunk) ->
          # nop

        resp.on 'end', ->
          # opportunity to stream response differently
          called++
          client.post("word up") (err, resp, body) ->
            called++
            assert.equal '7', len
            server.close()
    )()

process.on 'exit', ->
  assert.equal 4, called
