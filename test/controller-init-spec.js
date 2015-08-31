// controller that broadcasts an event on init
angular.module('BroadcastController', [])
  .controller('broadcastController', function broadcastController($rootScope) {
    $rootScope.$broadcast('foo');
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'spy on controller init',
  modules: 'BroadcastController',
  inject: '$rootScope',
  exposeApi: true,
  only: false,
  verbose: false,
  tests: function (deps, describeApi) {
    it('has no controller by default', function () {
      la(check.not.has(deps, 'broadcastController'));
    });

    it('has controller setup method', function () {
      la(check.has(describeApi, 'setupControllers'));
    });

    it('detects the broadcast in the controller function', function () {
      describeApi.setupControllers('broadcastController');
      la(check.has(deps, 'broadcastController'), 'broadcast controller was created');
    });

    it('cleans up created controllers', function () {
      la(check.not.has(deps, 'broadcastController'),
        'should not have broadcast controller in another unit test', deps);
    });

    it('can catch the broadcast in controller init', function (done) {
      var heardFoo;
      deps.$rootScope.$on('foo', function () {
        heardFoo = true;
        done();
      });

      describeApi.setupControllers('broadcastController');
    });
  }
});
