// controller that broadcasts an event on init
angular.module('BroadcastController', [])
  .controller('broadcastController', function broadcastController($rootScope) {
    console.log('broadcast controller broadcasts "foo"');
    $rootScope.$broadcast('foo');
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'spy on controller init',
  modules: 'BroadcastController',
  inject: '$rootScope',
  controller: 'broadcastController',
  only: false,
  tests: function (deps) {
    it('has the controller', function () {
      console.log('inside the unit test');
      la(check.has(deps, 'broadcastController'));
    });

    it('detects the broadcast in the controller function', function () {
      // how?
    });
  }
});
