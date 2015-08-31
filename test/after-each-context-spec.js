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
    var context;

    beforeEach(function () {
      la(deps.foo === 'bar');
      localFoo = deps.foo;
      la(this !== undefined, 'beforeEach has no context');
      context = this;
    });

    it('test 1: has correct value foo', function () {
      la(localFoo === 'bar');
      la(deps.foo === 'bar', 'dependencies still has foo', deps);
    });

    it('test 2: has correct value foo', function () {
      la(localFoo === 'bar');
      la(deps.foo === 'bar', 'dependencies still has foo', deps);
    });

    it('test 3: has correct context', function () {
      la(this === context, 'test function has wrong context');
    });

    afterEach(function insideNgDescribeAfterEach() {
      la(localFoo === 'bar', 'localFoo is', localFoo);
      la(deps.foo === 'bar', 'dependencies still has foo', deps);
      // No checking the context using "this"
      // we already hack around Jasmine's reverse afterEach execution
      // no point in fixing "this"
      // la(this === context, 'afterEach has wrong context');
    });
  }
});
