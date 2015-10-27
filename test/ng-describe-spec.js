/* global ngDescribe, it, la, describe */
ngDescribe({
  name: 'ng-describe test',
  only: false,
  verbose: false,
  tests: function () {
    it('loads and runs', function () {
      la(true, 'everything is fine');
    });

    it('prints angular version', function () {
      la(typeof angular !== 'undefined', 'has angular');
      console.log('angular version', angular.version.full);
    });
  }
});

ngDescribe({
  name: 'ng-describe test 2',
  only: false,
  // to force deps object
  inject: ['$rootScope'],
  tests: function (deps) {
    la(typeof deps === 'object', 'missing injected object');
    it('loads and runs', function () {
      la(true, 'everything is fine');
    });
  }
});

ngDescribe({
  name: 'ng-describe empty modules',
  only: false,
  modules: [],
  inject: ['$rootScope'],
  tests: function (deps) {
    la(typeof deps === 'object', 'missing injected object');
    it('loads and runs', function () {
      la(true, 'everything is fine');
    });
  }
});

angular.module('foo', [])
  .value('bar', 'baz');

describe('value tests', function () {
  ngDescribe({
    name: 'test foo',
    modules: 'foo',
    inject: 'bar',
    tests: function (deps) {
      it('has correct bar', function () {
        la(deps.bar === 'baz');
      });
    }
  });
});
