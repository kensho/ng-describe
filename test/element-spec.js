angular.module('MyFoo', [])
  .directive('myFoo', function () {
    return {
      restrict: 'E',
      replace: true,
      template: '<span>{{ bar }}</span>'
    };
  });
/* global ngDescribe, it, beforeEach */
ngDescribe({
  name: 'MyFoo directive',
  modules: 'MyFoo',
  element: '<my-foo></my-foo>',
  only: false,
  verbose: false,
  tests: function (deps) {
    it('creates myFoo element', function () {
      la(check.object(deps), 'has dependencies');
      la(check.has(deps, 'element'), 'has compiled element');
    });

    it('compiled template', function () {
      la(deps.element.html() === '');
    });

    it('has scope', function () {
      var scope = deps.element.scope();
      la(check.object(scope));
    });

    it('can update DOM using binding', function () {
      var scope = deps.element.scope();
      scope.bar = 'bar';
      scope.$apply();
      la(deps.element.html() === 'bar');
    });
  }
});

ngDescribe({
  name: 'MyFoo directive and order of element vs beforeEach',
  modules: 'MyFoo',
  element: '<my-foo></my-foo>',
  only: false,
  tests: function (deps) {
    beforeEach(function () {
      deps.ranBeforeEach = true;
      la(!check.has(deps, 'element'), 'has no compiled element in before each yet');
    });

    it('creates myFoo element', function () {
      la(check.has(deps, 'element'), 'has compiled element');
      la(deps.ranBeforeEach, 'element created AFTER it ran beforeEach');
    });

    it('creates myFoo element again', function () {
      la(check.has(deps, 'element'), 'has compiled element');
      la(deps.ranBeforeEach, 'element created AFTER it ran beforeEach');
    });
  }
});
