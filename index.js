var _ = require('underscore');
_.mixin( require('underscore.deferred') );
var inflection = require('inflection');
var Twit = require('twit');
var T = new Twit(require('./config.js'));
var wordfilter = require('wordfilter');

var threshold = 4;


Array.prototype.pick = function() {
  return this[Math.floor(Math.random()*this.length)];
};

Array.prototype.pickRemove = function() {
  var index = Math.floor(Math.random()*this.length);
  return this.splice(index,1)[0];
};

function generate() {
  var dfd = new _.Deferred();
  T.get('lists/statuses', {
    list_id: '93527328',
    count: 200
  }, function(err, reply) {
      if (err) {
        console.log('error:', err);
      }
      else {
        console.log(reply.length);
        reply = _.chain(reply)
                 .map(function(el) { return _.pick(el, 'text', 'retweet_count', 'favorite_count', 'id_str');})
                 .filter(function(el) {
                   return el.retweet_count + el.favorite_count > threshold;
                 })
                 .value();
        console.log('reply:', reply);
        var ids = _.pluck(reply, 'id_str');
        _.each(ids, function(id) {
          T.post('statuses/retweet/' + id, {}, function(err, resp) {
            if (err) {
              console.log('error!', err);
            }
            if (resp) {
              console.log('yay we RTed a thing');
            }
          });
        });
      }
    });
  return dfd.promise();
}

// Tweet every 5 minutes
setInterval(function () {
  try {
    generate();
  }
  catch (e) {
    console.log(e);
  }
}, 1000 * 60 * 5);

// Tweet once on initialization
generate();
