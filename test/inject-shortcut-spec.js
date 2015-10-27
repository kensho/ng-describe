/* global ngDescribe, it */
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
