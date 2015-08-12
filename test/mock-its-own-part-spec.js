angular.module('LargeModule', [])
  .constant('foo', 'foo')
  .service('getFoo', function (foo) {
    return function getFoo() {
      return foo;
    };
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'mocking part of the module itself',
  modules: 'LargeModule',
  inject: 'getFoo',
  mock: {
    LargeModule: {
      foo: 'bar'
    }
  },
  tests: function (deps) {
    it('service injects mock value', function () {
      la(deps.getFoo() === 'bar', 'returns mock value');
    });
  }
});

