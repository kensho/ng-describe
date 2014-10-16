angular.module('apiCaller', [])
  .service('getIt', function ($http) {
    return function () {
      return $http.get('/my/url');
    };
  });

/* global ngDescribe, it, beforeEach, afterEach */
ngDescribe({
  name: 'http mock backend example',
  modules: ['apiCaller'],
  inject: ['getIt', '$httpBackend'],
  only: false,
  tests: function (deps) {
    beforeEach(function () {
      deps.$httpBackend.expectGET('/my/url').respond(200, 42);
    });

    it('returns result from server', function (done) {
      deps.getIt().then(function (response) {
        la(response && response.status === 200);
        la(response.data === 42);
        done();
      });
      deps.$httpBackend.flush();
    });

    afterEach(function () {
      deps.$httpBackend.verifyNoOutstandingRequest();
      deps.$httpBackend.verifyNoOutstandingExpectation();
    });
  }
});

ngDescribe({
  name: 'several before and after blocks',
  modules: 'apiCaller',
  inject: 'getIt',
  tests: function (deps) {
    beforeEach(function before1() {
      la(check.object(deps));
      la(check.has(deps, 'getIt'));
    });

    beforeEach(function before2() {
      la(check.object(deps));
      la(check.has(deps, 'getIt'));
    });

    it('test 1', function () {
      la(check.object(deps));
      la(check.has(deps, 'getIt'));
    });

    it('test 2', function () {
      la(check.object(deps));
      la(check.has(deps, 'getIt'));
    });

    afterEach(function after1() {
      la(check.object(deps));
      la(check.has(deps, 'getIt'));
    });

    afterEach(function after2() {
      la(check.object(deps));
      la(check.has(deps, 'getIt'));
    });
  }
});
