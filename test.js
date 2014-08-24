
var test = require('tape');
var PriorityResource = require('./index').PriorityResource;
var resource;

test('create resource', function(t) {
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
  resource.fetch('ping', function(err, res) {
    t.ok(!err, 'not error');
    t.equal(res, 'pong');
    t.end();
  });
});

test('should upper case', function(t) {
  resource.fetch('beep', function(err, res) {
    t.ok(!err, 'not err');
    t.equal(res, 'BEEP');
    t.end();
  });
});
