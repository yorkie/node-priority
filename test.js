
var test = require('tape');
var PriorityResource = require('./index').PriorityResource;
var resource;

test('create simple resourcer', function(t) {
  resource = new PriorityResource([
    function top1(x) {
      if (x === 'ping')
        return 'pong';
      else
        return this.next();
    },
    function top2(y) {
      return y.toUpperCase();
    }
  ]);
  t.end();
});

test('should ping -> pong', function(t) {
  t.plan(2);
  resource.fetch('ping', function(err, res) {
    t.ok(!err, 'not error');
    t.equal(res, 'pong');
    t.end();
  });
});

test('should upper case', function(t) {
  t.plan(2);
  resource.fetch('beep', function(err, res) {
    t.ok(!err, 'not err');
    t.equal(res, 'BEEP');
    t.end();
  });
});

test('create an async resourcer', function(t) {
  resource = new PriorityResource([
    function top1(x) {
      var self = this
      if (x === 'ping')
        setTimeout(function() { self.done('pong'); }, 100);
      else
        return self.next();
    },
    function top2(y) {
      var self = this;
      setTimeout(function() {
        if (y === 'beep')
          self.done(y.toUpperCase());
        else if (y === 'China')
          self.next();
      }, 200);
    },
    'alonely node'
  ]);
  t.end();
});

// XXX: use sinon by exact testing for timer
test('should ping -> 100 -> pong', function(t) {
  t.plan(2);
  resource.fetch('ping', function(err, res) {
    t.ok(!err, 'not err');
    t.equal(res, 'pong');
    t.end();
  });
});

// XXX: use sinon by exact testing for timer
test('should upper case with async', function(t) {
  t.plan(2);
  resource.fetch('beep', function(err, res) {
    t.ok(!err, 'not err');
    t.equal(res, 'BEEP');
    t.end();
  });
});

test('should alongly node :(', function(t) {
  t.plan(2);
  resource.fetch('China', function(err, res) {
    t.ok(!err, 'not err');
    t.equal(res, 'alonely node');
    t.end();
  });
});

test('timeout without timer', function(t) {
  t.plan(1);
  resource.setTimeout(100);
  resource.fetch('USA', function(err, res) {
    t.ok(err);
    t.end();
  });
});

test('timeout with timer', function(t) {
  t.plan(2);
  resource.setTimeout(100, function() {
    t.ok(true, 'successfully timeout in timer');
  });
  resource.fetch('USA', function(err, res) {
    t.ok(err);
    t.end();
  });
})

test('create simple resourcer', function(t) {
  try {
    resource = new PriorityResource([
      function top1(x) {
        if (x === 'ping')
          return 'pong';
        else
          return this.next();
      },
      'must be end',
      function top2(y) {
        return y.toUpperCase();
      }
    ]);
  } catch (err) {
    t.ok(err.toString(), 'Error: top2 unreachable');
    t.end();
  }
});
