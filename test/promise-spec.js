angular.module('ServiceModule', [])
    .factory('s1', function ($q) {
      var S1 = function () {
        this.deferred = $q.defer();
      };

      S1.prototype.resolveWith = function (value) {
        this.deferred.resolve(value);
      };

      S1.prototype.getPromise = function () {
        return this.deferred.promise;
      };
      return new S1();
    })
    .factory('ParentService', function (s1) {
      var ParentService = function () {
      };

      ParentService.prototype.resolveService = function () {
        s1.getPromise().then(function (done) {
          done();
        });
      };

      return ParentService;
    });

/* global ngDescribe, it, xit */
ngDescribe({
  name: 'promises resolve across tests',
  modules: 'ServiceModule',
  tests: function ($rootScope, s1, ParentService) {
    it('it can resolve promise once', function (done) {
      var parent = new ParentService();
      parent.resolveService();
      s1.resolveWith(done);
      $rootScope.$apply();
    });

    // If both tests are run, it fails, either of them individually will pass
    xit('it can resolve promise twice', function (done) {
      var parent = new ParentService();
      parent.resolveService();
      s1.resolveWith(done);
      $rootScope.$apply();
    });
  }
});
