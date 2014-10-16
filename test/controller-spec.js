angular.module('D', [])
  .controller('dController', function ($scope) {
    $scope.foo = 'foo';
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'test controller',
  modules: 'D',
  inject: ['$controller', '$rootScope'],
  tests: function (deps) {
    it('has $controller function', function () {
      la(check.fn(deps.$controller));
    });

    it('can create new controller', function () {
      var scope = deps.$rootScope.$new();
      la(check.object(scope), 'created new scope');
      var ctrl = deps.$controller('dController', {
        $scope: scope
      });
      la(check.object(ctrl), 'got back controller instance', ctrl);
      la(scope.foo === 'foo', 'scope has been updated');
    });
  }
});
