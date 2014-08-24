
var defaultTimeout = 30 * 1000;
var nextFlag = 'next-flag';

function PriorityResource(queues) {
  if (!queues || !queues.length || !queues.map)
    throw new Error('queues required');
  if (!(this instanceof PriorityResource))
    return new PriorityResource(queues);
  var self = this;
  var mustBeEnd = false;
  queues.map(function(queue) {
    if (mustBeEnd)
      throw new Error(queue.name + ' unreachable');
    if (typeof queue !== 'function')
      mustBeEnd = true;
  });
  this._queues = queues;
  this._timeout = defaultTimeout;
  this._timer = null;
}

PriorityResource.prototype.setTimeout = function(delay, timer) {
  this._timeout = delay || defaultTimeout;
  if (typeof timer === 'function')
    this._timer = timer;
};

PriorityResource.prototype.fetch = function() {
  var self = this;
  var args = arguments;
  var queues = arrayClone(this._queues);
  var callback = args[args.length - 1];
  var timer;
  var currentProgress;

  if (typeof callback !== 'function')
    throw new Error('callback required');

  var context = {};
  context.next = next;
  context.done = done;
  return fetch();

  function done(res) {
    clearTimeout(timer);
    callback(null, res);
  }

  function next() {
    if (currentProgress.async)
      fetch();
    return nextFlag;
  }

  function fetch() {
    clearTimeout(timer);
    do {
      var queue = queues.shift();
      if (typeof queue === 'function') {
        currentProgress = queue;
        var ret = queue.apply(context, args);
        if (ret === undefined) {
          currentProgress.async = true;
          timer = setTimeout(function() {
            var err = new Error('priority progress timeout');
            if (typeof self._timer === 'function')
              self._timer(err);
            callback(err);
          }, self._timeout);
        } else if (ret === nextFlag) {
          fetch();
        } else {
          done(ret);
        }
        return;
      } else {
        return done(queue);
      }
    } while (queues.length);

  }
};

function arrayClone(arr) {
  var ret = new Array();
  arr.forEach(function(item) {
    if (item)
      item.async = false;
    ret.push(item);
  });
  return ret;
}

exports.PriorityResource = PriorityResource;
