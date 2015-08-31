// Good intro to unit testing Angular $interval service
// http://www.bradoncode.com/blog/2015/06/15/unit-testing-interval-angularls/
angular.module('IntervalExample', [])
  .service('numbers', function ($interval, $rootScope) {
    return function emitNumbers(delay, n) {
      var k = 0;
      $interval(function () {
        $rootScope.$emit('number', k);
        k += 1;
      }, 100, n);
    };
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'testing $interval',
  module: 'IntervalExample',
  inject: ['numbers', '$rootScope', '$interval'],
  verbose: false,
  only: false,
  tests: function (deps) {
    it('emits 3 numbers', function (done) {
      deps.$rootScope.$on('number', function (event, k) {
        if (k === 2) {
          done();
        }
      });
      // emit 3 numbers with 100ms interval
      deps.numbers(100, 3);
      // advance mock $interval service by 500 ms
      // forcing 3 100ms intervals to fire
      deps.$interval.flush(500);
    });
  }
});

var intervalCalled;

ngDescribe({
  name: 'spying on $interval',
  module: 'IntervalExample',
  inject: ['numbers', '$rootScope'],
  verbose: false,
  only: false,
  mocks: {
    IntervalExample: {
      $interval: function mockInterval(fn, delay, n) {
        var injector = angular.injector(['ng']);
        var $interval = injector.get('$interval');
        intervalCalled = true;
        return $interval(fn, delay, n);
      }
    }
  },
  tests: function (deps) {
    it('emits 3 numbers', function (done) {
      deps.$rootScope.$on('number', function (event, k) {
        if (k === 2) {
          done();
        }
      });
      // emit 3 numbers with 100ms interval
      deps.numbers(100, 3);
      la(intervalCalled, 'the $interval was called somewhere');
    });
  }
});

