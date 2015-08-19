/* global ngDescribe, it, beforeEach, afterEach */
angular.module('BeforeAndAfterA', [])
  .value('foo', 'bar');

ngDescribe({
  name: 'before and after example',
  module: 'BeforeAndAfterA',
  inject: 'foo',
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
      la(localFoo === 'bar', 'localFoo', localFoo);
      la(deps.foo === 'bar', 'dependencies still has foo', deps);
    });
  }
});
