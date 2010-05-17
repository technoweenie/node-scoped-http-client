var path = require('path')
  ,  sys = require('sys')
  ,  url = require('url')
  ,   qs = require('querystring')

var ScopedClient = function(url, options) {
  this.options = this.buildOptions(url, options)
}

ScopedClient.defaultPort = {'http:':80, 'https:':443, http:80, https:443}

ScopedClient.prototype.url = function() {
  this.options.search = qs.stringify(this.options.query)
  if(this.options.auth && this.options.auth.length > 0)
    this.options.host = this.options.auth + "@"
  else
    this.options.host = ''
  this.options.host += this.options.hostname

  if(this.options.port) {
    var defaultPort = ScopedClient.defaultPort[this.options.protocol].toString()
    if(this.options.port.toString() == defaultPort)
      delete this.options.port
    else
      this.options.host += ':' + this.options.port
  }

  if(this.options.query && Object.keys(this.options.query).length == 0)
    delete this.options.query
  var s = url.format(this.options)
  delete this.options.search
  delete this.options.host
  return s
}

ScopedClient.prototype.scope = function(url, options, callback) {
  var override = this.buildOptions(url, options)
    ,   scoped = new ScopedClient(this.options)
                   .protocol(override.protocol)
                   .host(override.hostname)
                   .path(override.pathname)

  if(typeof(url) == 'function')          callback = url
  else if(typeof(options) == 'function') callback = options
  if(callback) callback(scoped)
  return scoped
}

ScopedClient.prototype.path = function(p) {
  if(p && p.length > 0)
    this.options.pathname = p.match(/^\//) ? p : path.join(this.options.pathname, p)
  return this
}

ScopedClient.prototype.query = function(key, value) {
  if(!this.options.query) this.options.query = {}
  if(typeof(key) == 'string') {
    if(value)
      this.options.query[key] = value
    else
      delete this.options.query[key]
  } else
    extend(this.options.query, key)
  return this
}

ScopedClient.prototype.host = function(h) {
  if(h && h.length > 0)
    this.options.hostname = h
  return this
}

ScopedClient.prototype.port = function(p) {
  if(p && (typeof(p) == 'number' || p.length > 0))
    this.options.port = p
  return this
}

ScopedClient.prototype.protocol = function(p) {
  if(p && p.length > 0)
    this.options.protocol = p
  return this
}

ScopedClient.prototype.auth = function(user, pass) {
  if(!user)
    this.options.auth = null
  else if(!pass && user.match(/:/))
    this.options.auth = user
  else
    this.options.auth = user + ':' + pass
  return this
}

ScopedClient.prototype.hash = function(h) {
  this.options.hash = h
  return this
}

ScopedClient.prototype.buildOptions = function() {
  var options = {}
    ,       i = 0

  while(arguments[i]) {
    var ty = typeof(arguments[i])
    if(ty == 'string') {
      options.url = arguments[i]
    } else if(ty != 'function') {
      extend(options, arguments[i])
    }
    i += 1
  }
  if(options.url) {
    extend(options, url.parse(options.url, true))
    delete options.url
    delete options.href
    delete options.search
  }
  if(!options.headers) options.headers = {}
  return options
}

function extend(a, b) {
  var prop;
  Object.keys(b).forEach(function(prop) {
    a[prop] = b[prop];
  })
  return a;
}

exports.create = function(url, options) {
  return new ScopedClient(url, options)
}