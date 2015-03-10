angular.module('H', [])
  .controller('hController', function () {
    this.foo = 'foo';
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'controllerAs syntax',
  module: 'H',
  inject: ['$controller', '$rootScope'],
  tests: function (deps) {
    it('has $controller function', function () {
      la(check.fn(deps.$controller));
    });

    it('can create new controller', function () {
      var scope = deps.$rootScope.$new();
      la(check.object(scope), 'created new scope');
      var ctrl = deps.$controller('hController', {
        $scope: scope
      });
      la(check.object(ctrl), 'got back controller instance', ctrl);

      la(ctrl.foo === 'foo', 'property has been attached to the controller instance', Object.keys(scope));
      la(typeof scope.foo === 'undefined', 'scope does not have the property', Object.keys(scope));
    });
  }
});

ngDescribe({
  name: 'controllerAs in HTML',
  module: 'H',
  element: '<div ng-controller="hController as ctrl">{{ ctrl.foo }}</div>',
  tests: function (deps) {
    it('created controller correctly', function () {
      var compiledHtml = deps.element.html();
      la(compiledHtml === 'foo', 'correctly used controller property', compiledHtml);
    });

    it('changes value', function () {
      var ctrl = deps.element.controller();
      // { foo: 'foo' }
      ctrl.foo = 'bar';
      deps.element.scope().$apply();
      var compiledHtml = deps.element.html();
      la(compiledHtml === 'bar', 'correctly used controller property', compiledHtml);
    });
  }
});
