// Good intro to unit testing Angular $interval service
// http://www.bradoncode.com/blog/2015/06/15/unit-testing-interval-angularls/
angular.module('SpyOnInterval', [])
  .service('numbers', function ($interval, $rootScope) {
    return function emitNumbers(delay, n) {
      var k = 0;
      $interval(function () {
        $rootScope.$emit('number', k);
        k += 1;
      }, 100, n);
    };
  });

/* global ngDescribe, beforeEach, afterEach, it, sinon */
ngDescribe({
  name: 'spying on $interval',
  module: 'SpyOnInterval',
  inject: ['numbers', '$rootScope', '$interval'],
  verbose: true,
  only: true,
  tests: function (deps) {
    it('emits 3 numbers', function (done) {
      deps.$rootScope.$on('number', function (event, k) {
        if (k === 2) {
          console.log('got all numbers');
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

