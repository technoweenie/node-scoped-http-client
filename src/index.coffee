http  = require 'http'
https = require 'https'
url   = require 'url'
qs    = require 'querystring'

class ScopedClient
  # Those properties are in @options but they are either not passed to the
  # request as options or some processing is made on them. They will not be
  # added to the request's option param.
  @nonPassThroughOptions = ['headers', 'hostname', 'encoding', 'auth', 'port',
    'protocol', 'agent', 'query', 'host', 'path', 'pathname', 'slashes', 'hash']

  constructor: (url, options) ->
    @options = @buildOptions url, options
    @passthroughOptions = reduce(extend({}, @options), ScopedClient.nonPassThroughOptions)

  request: (method, reqBody, callback) ->
    if typeof(reqBody) == 'function'
      callback = reqBody
      reqBody  = null

    try
      headers      = extend {}, @options.headers
      sendingData  = reqBody and reqBody.length > 0
      headers.Host = @options.host

      if reqBody?
        headers['Content-Length'] = Buffer.byteLength(reqBody, @options.encoding)

      if @options.auth
        headers['Authorization'] = 'Basic ' + new Buffer(@options.auth).toString('base64');

      port = @options.port ||
        ScopedClient.defaultPort[@options.protocol] || 80

      requestOptions = {
        port:    port
        host:    @options.hostname
        method:  method
        path:    @fullPath()
        headers: headers
        agent:   @options.agent
      }

      # Extends the previous request options with all remaining options
      extend requestOptions, @passthroughOptions

      req = (if @options.protocol == 'https:' then https else http).request(requestOptions)

      if @options.timeout
        req.setTimeout @options.timeout, () ->
          req.abort()

      if callback
        req.on 'error', callback
      req.write reqBody, @options.encoding if sendingData
      callback null, req if callback
    catch err
      callback err, req if callback

    (callback) =>
      if callback
        req.on 'response', (res) =>
          res.setEncoding @options.encoding
          body = ''
          res.on 'data', (chunk) ->
            body += chunk

          res.on 'end', ->
            callback null, res, body
        req.on 'error', (error) ->
          callback error, null, null

      req.end()
      @

  # Adds the query string to the path.
  fullPath: (p) ->
    search = qs.stringify @options.query
    full   = this.join p
    full  += "?#{search}" if search.length > 0
    full

  scope: (url, options, callback) ->
    override = @buildOptions url, options
    scoped   = new ScopedClient(@options)
      .protocol(override.protocol)
      .host(override.hostname)
      .path(override.pathname)

    if typeof(url) == 'function'
      callback = url
    else if typeof(options) == 'function'
      callback = options
    callback scoped if callback
    scoped

  join: (suffix) ->
    p = @options.pathname || '/'
    if suffix and suffix.length > 0
      if p is '/' then url.resolve p, suffix
      else url.resolve p + '/', suffix
    else
      p

  path: (p) ->
    self = clone(@)
    self.options.pathname = self.join p
    self

  query: (key, value) ->
    self = clone(@)
    self.options.query ||= {}
    if typeof(key) == 'string'
      if value
        self.options.query[key] = value
      else
        delete self.options.query[key]
    else
      extend self.options.query, key
    self

  host: (h) ->
    self = clone(@)
    self.options.hostname = h if h and h.length > 0
    self

  port: (p) ->
    self = clone(@)
    if p and (typeof(p) == 'number' || p.length > 0)
      self.options.port = p
    self

  protocol: (p) ->
    self = clone(@)
    self.options.protocol = p if p && p.length > 0
    self
  encoding: (e = 'utf-8') ->
    self = clone(@)
    self.options.encoding = e
    self

  timeout: (time) ->
    self = clone(@)
    self.options.timeout = time
    self

  auth: (user, pass) ->
    self = clone(@)
    if !user
      self.options.auth = null
    else if !pass and user.match(/:/)
      self.options.auth = user
    else
      self.options.auth = "#{user}:#{pass}"
    self

  header: (name, value) ->
    self = clone(@)
    self.options.headers[name] = value
    self

  headers: (h) ->
    self = clone(@)
    extend self.options.headers, h
    self

  buildOptions: ->
    options = {}
    i       = 0
    while arguments[i]
      ty = typeof arguments[i]
      if ty == 'string'
        options.url = arguments[i]
      else if ty != 'function'
        extend options, arguments[i]
      i += 1

    if options.url
      extend options, url.parse(options.url, true)
      delete options.url
      delete options.href
      delete options.search
    options.headers ||= {}
    options.encoding ?= 'utf-8'
    options

ScopedClient.methods = ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD"]
ScopedClient.methods.forEach (method) ->
  ScopedClient.prototype[method.toLowerCase()] = (body, callback) ->
    @request method, body, callback
ScopedClient.prototype.del = ScopedClient.prototype['delete']

ScopedClient.defaultPort = {'http:':80, 'https:':443, http:80, https:443}

extend = (a, b) ->
  Object.keys(b).forEach (prop) ->
    a[prop] = b[prop]
  a

# Removes keys specified in second parameter from first parameter
reduce = (a, b) ->
  for propName in b
    delete a[propName]
  a

clone = (obj) ->
  extend = (a, b) ->
    Object.keys(b).forEach (prop) ->
      if b[prop] instanceof Object
        return a[prop] = clone(b[prop])
      a[prop] = b[prop]
    a
  extend(new obj.constructor(), obj)

exports.create = (url, options) ->
  new ScopedClient url, options
