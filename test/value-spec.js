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
