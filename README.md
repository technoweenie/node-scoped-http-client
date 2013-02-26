# Scoped HTTP Client for Node.js

[Node.js's HTTP client][client] is great, but a little too low level for 
common purposes.  It's common practice for [some libraries][example] to
extract this out so it's a bit nicer to work with.

[client]:  http://nodejs.org/api.html#http-client-177
[example]: http://github.com/technoweenie/nori/blob/2b4b367350e5d2aed982e8af869401ab5612378c/lib/index.js#L72-76

```javascript
function(method, path, customHeaders, body, callback) {
  var client = http.createClient(url)
  client.request(method, path, headers)
  // ...
}
```

I hate functions with lots of optional arguments.  Let's turn that into:

```javascript
var scopedClient = require('./lib')
  , util         = require('util')

var client = scopedClient.create('https://api.github.com')
  .header('accept', 'application/json')
  .path('user/show/technoweenie')
  .get()(function(err, resp, body) {
    util.puts(body)
  })
```

You can scope a client to make requests with certain parameters without
affecting the main client instance:

```javascript
client.path('https://api.github.com') // reset path
client.scope('users/technoweenie', function(cli) {
  // cli's path is "https://api.github.com/users/technoweenie"
  cli.get()(function(err, resp, body) {
    util.puts(body)
  })
})

// client's path is back to just "https://api.github.com"
```

You can use `.post()`, `.put()`, `.del()`, and `.head()`.

```javascript
client.query({login:'technoweenie',token:'...'})
  .scope('users/technoweenie', function(cli) {
    var data = JSON.stringify({location: 'SF'})

    // posting data!
    cli.post(data)(function(err, resp, body) {
      util.puts(body)
    })
  })
```

Sometimes you want to stream the request body to the server.  The request 
is a standard [http.clientRequest][request].

```javascript
client.post(function (req) {
  req.write("...")
  req.write("...")
})(function(err, resp, body) {
  // ...
})
```

And other times, you want to stream the response from the server.  Simply 
listen for the request's response event yourself and omit the response 
callback.

```javascript
client.get(function (err, req) {
  // do your own thing
  req.addListener('response', function (resp) {
    resp.addListener('data', function (chunk) {
      util.puts("CHUNK: " + chunk)
    })
  })
})()
```

[request]: http://nodejs.org/api.html#http-clientrequest-182

Basic HTTP authentication is supported:

```javascript
client.get(function (err, req) {
  // we'll keep this conversation secret...
  req.auth('technoweenie', '...')
})
```

## Development

Run this in the main directory to compile coffeescript to javascript as you go:

    $ coffee -wc -o lib --no-wrap src/**/*.coffee
