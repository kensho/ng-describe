angular.module('D', [])
  .controller('dController', function ($scope) {
    $scope.foo = 'foo';
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'test controller',
  modules: 'D',
  inject: '$controller',
  tests: function (deps) {
    it('has $controller function', function () {
      la(check.fn(deps.$controller));
    });
  }
});
