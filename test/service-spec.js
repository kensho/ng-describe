angular.module('B', ['A'])
  .service('addFoo', function (foo) {
    return function (str) {
      return str + foo;
    };
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'test service',
  modules: 'B',
  inject: 'addFoo',
  tests: function (deps) {
    it('is a function', function () {
      la(typeof deps.addFoo === 'function');
    });

    it('appends value of foo to any string', function () {
      var result = deps.addFoo('x');
      la(result === 'xbar');
    });
  }
});
