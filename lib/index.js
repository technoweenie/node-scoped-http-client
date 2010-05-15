var path = require('path')
  ,  sys = require('sys')
  ,  url = require('url')
  ,   qs = require('querystring')

var ScopedClient = function() {
  this.options = {}
  if(typeof(arguments[0]) == 'string') {
    this.options.url = arguments[0]
    if(arguments[1]) extend(this.options, arguments[1])
  } else {
    if(arguments[0]) extend(this.options, arguments[0])
  }
  if(this.options.url) {
    extend(this.options, url.parse(this.options.url, true))
    delete this.options.url
    delete this.options.href
    delete this.options.search
  }
  if(!this.options.headers) this.options.headers = {}
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