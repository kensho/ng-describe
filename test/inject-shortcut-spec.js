/* global ngDescribe, it */
ngDescribe({
  name: 'inject shortcut',
  tests: function ($q, $timeout, $rootScope) {
    it('has $q service', function (done) {
      $q.when(42)
        .then(function (value) {
          la(value === 42);
        })
        .finally(done);
      $rootScope.$apply();
    });

    it('can delay', function (done) {
      $timeout(done, 10);
      $timeout.flush();
    });
  }
});

ngDescribe({
  name: 'inject without shortcut',
  inject: ['$q', '$timeout'],
  tests: function (deps) {
    it('has $q service', function (done) {
      deps.$q.when(42)
        .then(function (value) {
          la(value === 42);
        })
        .finally(done);
      deps.$rootScope.$apply();
    });

    it('can delay', function (done) {
      deps.$timeout(done, 10);
      deps.$timeout.flush();
    });
  }
});

angular.module('shortcutA', [])
  .constant('constA', 'aaa');
ngDescribe({
  name: 'dependency inject shortcut 1',
  module: 'shortcutA',
  only: false,
  skip: false,
  verbose: false,
  tests: function (constA) {
    it('has constant a', function () {
      la(constA === 'aaa', 'constant a has correct value', constA);
    });
  }
});

ngDescribe({
  name: 'dependency inject shortcut - filter',
  only: false,
  skip: false,
  verbose: false,
  // note that tests callback lists injected values
  tests: function ($filter) {

    it('has injected $filter', function () {
      la(typeof $filter === 'function');
    });

    it('has lowercase filter', function () {
      var lowercase = $filter('lowercase');
      la(typeof lowercase === 'function', 'it is a function');
    });
  }
});
