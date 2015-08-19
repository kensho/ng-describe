/* global ngDescribe, it, beforeEach, afterEach */
angular.module('BeforeAndAfterA', [])
  .value('foo', 'bar');

ngDescribe({
  name: 'before and after example',
  module: 'BeforeAndAfterA',
  inject: 'foo',
  only: false,
  verbose: false,
  tests: function (deps) {
    var localFoo;

    beforeEach(function () {
      console.log('before localFoo, deps', deps);
      la(deps.foo === 'bar');
      localFoo = deps.foo;
    });

    it('test 1: has correct value foo', function () {
      console.log('inside test 1 localFoo, deps', deps);
      la(localFoo === 'bar');
      la(deps.foo === 'bar', 'dependencies still has foo', deps);
    });

    it('test 2: has correct value foo', function () {
      console.log('inside test 1 localFoo, deps', deps);
      la(localFoo === 'bar');
      la(deps.foo === 'bar', 'dependencies still has foo', deps);
    });

    afterEach(function insideNgDescribeAfterEach() {
      console.log('after localFoo, deps', deps);
      la(localFoo === 'bar', 'localFoo is', localFoo);
      la(deps.foo === 'bar', 'dependencies still has foo', deps);
    });
  }
});
