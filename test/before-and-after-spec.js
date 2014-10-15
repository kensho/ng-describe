/* global ngDescribe, it, beforeEach, afterEach */
ngDescribe({
  name: 'before and after example',
  modules: ['A'],
  inject: ['foo'],
  tests: function (deps) {
    var localFoo;

    beforeEach(function () {
      la(deps.foo === 'bar');
      localFoo = deps.foo;
    });

    it('has correct value foo', function () {
      la(localFoo === 'bar');
    });

    afterEach(function () {
      la(localFoo === 'bar');
      la(deps.foo === 'bar');
    });
  }
});
