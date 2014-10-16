angular.module('D', [])
  .controller('dController', function ($scope) {
    $scope.foo = 'foo';
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'step by step test controller',
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

ngDescribe({
  name: 'single shot controller test',
  modules: 'D',
  inject: ['$controller', '$rootScope'],
  controllers: 'dController',
  tests: function (deps) {
    it('has dController scope', function () {
      la(check.has(deps, 'dController'));
    });

    it('is an object', function () {
      la(check.object(deps.dController));
    });

    it('has correct properties', function () {
      la(deps.dController.foo === 'foo');
    });
  }
});


