var path = require('path')
  ,  sys = require('sys')
  ,  url = require('url')
  ,   qs = require('querystring')

var ScopedClient = function(url, options) {
  this.options = this.buildOptions(url, options)
}

ScopedClient.prototype.url = function() {
  this.options.search = qs.stringify(this.options.query)
  if(this.options.auth && this.options.auth.length > 0)
    this.options.host = this.options.auth + "@" + this.options.hostname
  else
    this.options.host = this.options.hostname
  if(this.options.query && Object.keys(this.options.query).length == 0)
    delete this.options.query
  var s = url.format(this.options)
  delete this.options.search
  delete this.options.host
  return s
}

ScopedClient.prototype.path = function(p) {
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

ScopedClient.prototype.protocol = function(p) {
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

ScopedClient.prototype.buildOptions = function(u, opts) {
  var options = {}
  if(typeof(u) == 'string') {
    options.url = u
    if(opts) extend(options, opts)
  } else {
    if(u) extend(options, u)
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