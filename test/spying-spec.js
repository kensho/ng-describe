angular.module('Tweets', [])
  .service('getTweets', function () {
    return function getTweets(username) {
      la(username === 'foo', 'unexpected username', username);
      return 42;
    };
  });

/* global ngDescribe, beforeEach, afterEach, it, sinon */
ngDescribe({
  name: 'spying on actual method',
  modules: 'Tweets',
  inject: 'getTweets',
  verbose: false,
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
  verbose: false,
  only: false,
  skip: false,
  mocks: {
    Tweets: {
      getTweets: function (username) {
        la(username === 'bar');
        return 1000;
      }
    }
  },
  tests: function (deps) {
    beforeEach(function () {
      sinon.spy(deps, 'getTweets');
    });

    afterEach(function () {
      deps.getTweets.restore();
    });

    it('calls mocked getTweets service', function () {
      var n = deps.getTweets('bar');
      la(n === 1000, 'resolved with correct value from the mock service');
      la(deps.getTweets.called,
        'mock service getTweets was called (spied using sinon)');
      la(deps.getTweets.firstCall.calledWith('bar'),
        'mock service getTweets was called with expected argument');
    });
  }
});

ngDescribe({
  name: 'spying on a filter',
  inject: '$filter',
  only: false,
  tests: function (deps) {
    /*
      to spy on a injected filter, need to grab the actual filter function
      and then create a spy
    */
    // _uppercase = angular uppercase $filter
    // uppercase = spy on the _uppercase
    var _uppercase;
    var uppercase;

    beforeEach(function () {
      _uppercase = deps.$filter('uppercase');
      la(check.fn(_uppercase));

      uppercase = sinon.spy(_uppercase);
      la(check.fn(uppercase), 'spy on uppercase is a function');
    });

    it('converts string to uppercase', function () {
      var result = uppercase('foo');
      la(result === 'FOO', 'converted string to uppercase', result);
      la(uppercase.calledOnce, 'uppercase was called once');
      la(uppercase.calledWith('foo'));
    });
  }
});

