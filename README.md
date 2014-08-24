
node-priority
---------------

priority resources dispatcher for nodejs

### Usage
```js
var resource = new PriorityResource([
  function ping_pong(x) {
    if (x === 'ping')
      return 'pong';
    else
      return this.next();
  },
  function upcase_service(y) {
    return y.toUpperCase();
  }
]);

resource.fetch('ping', function(err, res) {
  // will get 'pong'
});
resource.fetch('beep', function(err, res) {
  // will get 'BEEP'
});

```

### Implement an XML/JSON HTTP router(but priority with JSON response)
```js
// define your resourcer
var resourcer = new PriorityResource([
  function getJSON(req) {
    var self = this;
    if (req.accept === 'application/json')
      requestJSON(function(json) { self.done(json); });
    else
      self.next();
  },
  function getXML(req) {
    requestXML(function(xml) { self.done(xml); });
  }
]);

// define router
app.get('/beep', function(req, res) {
  resourcer.fetch(req, function(err, result) {
    if (err)
      res.send(500);
    else
      res.send(200, result);
  });
});
```

### Installation

```bash
$ npm install priority --save
```

### License

MIT
