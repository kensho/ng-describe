// a couple of examples of unit testing TodoApp
// from the angularjs.org website
angular.module('TodoApp', [])
  .controller('TodoController', function ($scope) {
    $scope.todos = ['do this', 'do that'];
  });

/* global describe, ngDescribe, beforeEach, inject, it */
describe('todos app', function () {
  beforeEach(angular.mock.module('TodoApp'));
  var $controller;
  var $rootScope;

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
  }));

  it('creates a controller', function () {
    var scope = $rootScope.$new();
    $controller('TodoController', {
      $scope: scope
    });
    la(scope.todos.length === 2, 'has 2 todo items');
  });
});

ngDescribe({
  name: 'todos app using ng-describe',
  modules: 'TodoApp',
  controller: 'TodoController',
  tests: function (deps) {
    it('creates a controller', function () {
      la(deps.TodoController.todos.length === 2);
    });
  }
});
