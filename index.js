
function PriorityRes(queues) {
  if (!queues || !queues.length || !queues.map)
    throw new Error('queues required');
  if (!(this instanceof PriorityRes))
    return new PriorityRes(queues);
  var self = this;
  var mustBeEnd = false;
  queues.map(function(queue) {
    if (mustBeEnd)
      throw new Error(queue.name + ' unreachable');
    if (typeof queue !== 'function')
      mustBeEnd = true;
  });
  this._queues = queues;
  return this;
}

PriorityRes.prototype.fetch = function() {
  var self = this;
  var args = arguments;
  var queues = this.queues;
  var callback = args[args.length - 1];

  if (typeof callback !== 'function')
    throw new Error('callback required');

  var context = {};
  context.skip = fetch;
  context.done = callback;
  return fetch();

  function fetch() {
    do {
      var queue = queues.shift();
      if (typeof queue === 'function') {
        var ret = queue.apply(context, args);
        if (ret !== undefined)
          callback(null, ret);
        return;
      } else {
        callback(null, queue);
        return queue;
      }
    } while (queues.length);
  }
};
