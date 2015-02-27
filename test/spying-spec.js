angular.module('Tweets', [])
  .service('getTweets', function () {
    return function getTweets(username) {
      console.log('returning # of tweets for', username);
      return 42;
    };
  });

/* global ngDescribe, beforeEach, afterEach, it, sinon */
ngDescribe({
  name: 'spying on actual method',
  modules: 'Tweets',
  inject: 'getTweets',
  verbose: true,
  only: false,
  tests: function (deps) {
    beforeEach(function () {
      la(typeof deps.getTweets === 'function', 'has getTweets function');
      la(typeof sinon === 'object', 'we have sinon');
      la(typeof sinon.spy === 'function', 'we have sinon.spy', sinon);
      sinon.spy(deps, 'getTweets');
    });

    afterEach(function () {
      deps.getTweets.restore();
    });

    it('calls getTweets service', function () {
      var n = deps.getTweets('foo');
      la(n === 42, 'resolved with correct value');
      la(deps.getTweets.called, 'getTweets was called (spied using sinon)');
      la(deps.getTweets.firstCall.calledWith('foo'));
    });
  }
});

ngDescribe({
  name: 'spying on mock methods',
  inject: 'getTweets',
  verbose: true,
  only: false,
  skip: true,
  mocks: {
    Tweets: {
      getTweets: function ($q, value) {
        return $q.when(value);
      }
    }
  },
  tests: function (deps) {
    it('injects $q but leaves "value" parameter free', function (done) {
      deps.getFoo(21).then(function (result) {
        la(result === 21, 'resolved with correct value');
        done();
      });
      deps.$rootScope.$apply();
    });
  }
});

