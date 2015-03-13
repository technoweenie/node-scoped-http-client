ScopedClient = require('../src')
http         = require('http')
https        = require('https')
assert       = require('assert')
called       = 0
httpAgent    = new http.Agent()
httpsAgent   = new https.Agent()
httpAgentCalled  = false
httpsAgentCalled = false

# Add a spy to the httpAgent
oldHttpFunction = httpAgent.createConnection
httpAgent.createConnection = (args...) ->
  httpAgentCalled = true
  oldHttpFunction.apply(httpAgent, args)

ScopedClient.create('http://localhost', httpAgent: httpAgent, httpsAgent: httpsAgent).get() () ->
  # We should have called the provided http Agent
  assert.equal(true, httpAgentCalled)
  called += 1

# Add a spy to the httpsAgent
oldHttpsFunction = httpsAgent.createConnection
httpsAgent.createConnection = (args...) ->
  httpsAgentCalled = true
  oldHttpsFunction.apply(httpsAgent, args)

ScopedClient.create('https://localhost', httpAgent: httpAgent, httpsAgent: httpsAgent).get() () ->
  # We should have called the provided https Agent
  assert.equal(true, httpsAgentCalled)
  called += 1

process.on 'exit', ->
  assert.equal 2, called
