angular.module('A10', [])
  .constant('foo', 'bar');

/* global ngDescribe, it */
ngDescribe({
  name: 'injecting and testing constants',
  modules: 'A10',
  inject: 'foo',
  only: false,
  tests: function (deps) {
    it('has correct constant foo', function () {
      la(deps.foo === 'bar');
    });
  }
});

ngDescribe({
  name: 'mocking constants',
  modules: 'A10',
  mock: {
    A10: {
      foo: 42
    }
  },
  inject: 'foo',
  only: false,
  verbose: false,
  tests: function (deps) {
    it('has correct constant foo', function () {
      la(deps.foo === 42, 'has mocked constant', deps.foo);
    });
  }
});
