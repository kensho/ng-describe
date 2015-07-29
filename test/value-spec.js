angular.module('A', [])
  .value('foo', 'bar');

/* global ngDescribe, it */
ngDescribe({
  name: 'test value',
  modules: 'A',
  inject: 'foo',
  tests: function (deps) {
    // deps object has every injected dependency as a property
    it('has correct value foo', function () {
      la(deps.foo === 'bar');
    });
  }
});

ngDescribe({
  name: 'inject same module multiple times',
  modules: ['A', 'A', 'A'],
  inject: 'foo',
  tests: function (deps) {
    it('has correct value foo', function () {
      la(deps.foo === 'bar');
    });
  }
});

ngDescribe({
  name: 'verbose spec',
  modules: ['A'],
  inject: 'foo',
  verbose: true,
  tests: function (deps) {
    it('has correct value foo', function () {
      la(deps.foo === 'bar');
    });
  }
});

ngDescribe({
  name: 'skip specs',
  skip: true,
  tests: function () {
    it('this is skipped', function () {
      la(false, 'all tests here should have been skipped');
    });
  }
});

ngDescribe({
  name: 'skip specs with message',
  skip: 'this is spec is not working, will skip it',
  tests: function () {
    it('this is skipped', function () {
      la(false, 'all tests here should have been skipped');
    });
  }
});

ngDescribe({
  name: 'mock value',
  modules: 'A',
  inject: 'foo',
  mock: {
    A: {
      foo: 42
    }
  },
  only: false,
  verbose: false,
  tests: function (deps) {
    it('has mocked value foo', function () {
      la(deps.foo === 42, 'mocked foo value', deps.foo);
    });
  }
});
