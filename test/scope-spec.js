angular.module('E', [])
  .controller('e1', function ($scope) {
    $scope.foo = 'foo';
  })
  .controller('e2', function ($scope) {
    $scope.meaning = 42;
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'parent and child scopes',
  modules: 'E',
  inject: ['$controller', '$rootScope'],
  tests: function (deps) {
    it('can create child scope from parent scope', function () {
      var parentScope = deps.$rootScope.$new();
      la(check.fn(parentScope.$new));
      var childScope = parentScope.$new();
      la(check.object(childScope));
    });

    it('can create parent and child scopes', function () {
      var parentScope = deps.$rootScope.$new();
      var childScope = parentScope.$new();
      deps.$controller('e1', {
        $scope: childScope
      });
      la(childScope.foo === 'foo', 'child scope has foo');
    });

    it('can see parent scope properties from child scope', function () {
      var parentScope = deps.$rootScope.$new();
      var childScope = parentScope.$new();
      deps.$controller('e1', {
        $scope: childScope
      });
      parentScope.bar = 'bar';
      la(childScope.bar === 'bar');
    });
  }
});

ngDescribe({
  name: 'multiple separate scopes',
  modules: 'E',
  controllers: ['e1', 'e2'],
  tests: function (deps) {
    it('has two scopes', function () {
      la(deps.e1, 'has first');
      la(deps.e2, 'has second');
    });

    it('has separate scopes', function () {
      la(check.not.same(deps.e1, deps.e2));
    });
  }
});
