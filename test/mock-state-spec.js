angular.module('Position', [])
  .controller('PositionController', function ($state) {
    this.init = function init() {
      return $state.params.name;
    };
    this.name = this.init();
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'mocking state params',
  modules: 'Position',
  controller: 'PositionController',
  element: '<div ng-controller="PositionController as position"></div>',
  mock: {
    Position: {
      $state: {
        params: {
          name: 'mockName'
        }
      }
    }
  },
  tests: function (deps) {
    it('has params name from $state', function () {
      var ctrl = deps.element.controller();
      la(ctrl.name === 'mockName');
    });
  }
});

