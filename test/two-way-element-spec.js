// directive with two way binding into parent scope
angular.module('IsolateFoo', [])
  .directive('aFoo', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        bar: '='
      },
      template: '<span>{{ bar }}</span>'
    };
  });
/* global ngDescribe, it */
ngDescribe({
  name: 'directive with 2 way binding',
  modules: 'IsolateFoo',
  element: '<a-foo bar="x"></a-foo>',
  parentScope: {
    x: 'initial'
  },
  only: false,
  verbose: false,
  tests: function (deps) {
    it('creates element', function () {
      la(check.object(deps), 'has dependencies');
      la(check.has(deps, 'element'), 'has compiled element');
    });

    it('compiled template', function () {
      var html = deps.element.html();
      la(html === 'initial', html);
    });

    it('has scope', function () {
      var scope = deps.element.scope();
      la(check.object(scope));
    });

    it('updates parent scope on changed isolate scope', function () {
      var scope = deps.element.isolateScope();
      scope.bar = 'k';
      deps.$rootScope.$apply();
      la(deps.parentScope.x === 'k', 'parent scope has been updated');
    });

    it('has initial scope value', function () {
      var scope = deps.element.isolateScope();
      la(check.has(scope, 'bar'), 'has bar in root scope');
      la(scope.bar === 'initial', 'initial value');
    });

    it('has initial scope object in dependencies', function () {
      la(check.has(deps, 'parentScope'));
      la(check.object(deps.parentScope));
    });

    it('has initial values in scope', function () {
      la(deps.parentScope.x === 'initial');
    });

    it('is not the same as element scope', function () {
      la(deps.parentScope !== deps.element.isolateScope());
    });

    it('updates value from parent to element scope', function () {
      var scope = deps.element.isolateScope();
      deps.parentScope.x = 'newX';
      deps.$rootScope.$apply();
      la(scope.bar === 'newX');
    });

    it('can update DOM using binding', function () {
      deps.parentScope.x = 'zoo';
      deps.$rootScope.$apply();

      var html = deps.element.html();
      la(html === 'zoo', 'html', html);
    });
  }
});
