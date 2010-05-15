# Scoped HTTP Client for Node.js

The idea is to get away from methods like this:

    function(method, path, customHeaders, body, callback) {
      var client = http.createClient(...)
      client.request(method, path, headers)
      ...
    }

I hate functions with lots of optional arguments.  Let's turn that into:

    var client = ScopedClient.create('http://github.com/api/v2/json')
      .headers('content-type', 'application/json')
      .auth('technoweenie:secret')
      .get('users/show', function(req, resp) {
        ...
      })