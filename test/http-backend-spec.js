angular.module('apiGetCaller', [])
  .service('getIt', function getItService($http) {
    return function getIt() {
      return $http.get('/my/url');
    };
  })
  .service('getStatus', function getStatus($http) {
    return function getStatus() {
      return $http.get('/my/status/url');
    };
  })
  .service('failToGetIt', function failToGetItService($http) {
    return function failIt() {
      return $http.get('/my/bad/url');
    };
  })
  .service('customGetIt', function customGetItService($http) {
    return function customGetIt() {
      return $http.get('/my/custom/url');
    };
  });

angular.module('apiPostCaller', [])
  .service('postIt', function ($http) {
    return function postIt() {
      return $http.post('/my/url', 42);
    };
  });

/* global ngDescribe, it, beforeEach, afterEach */
ngDescribe({
  name: 'http response shortcuts GET',
  modules: 'apiGetCaller',
  inject: ['getIt', 'getStatus', 'failToGetIt', 'customGetIt'],
  only: false,
  verbose: false,
  http: {
    get: {
      '/my/url': 42, // status 200, data 42
      '/my/status/url': [201, 'foo'], // status 201, data "foo"
      '/my/bad/url': 500,
      '/my/custom/url': function (method, url) {
        la(method === 'GET', 'invalid method', method);
        la(url === '/my/custom/url', 'invalid url', url);
        return [200, 21];
      }
    }
  },
  tests: function (deps) {
    it('has flush method', function () {
      la(check.has(deps, 'http'), 'has deps.http object');
      la(check.fn(deps.http.flush), 'has http.flush method');
    });

    it('returns result from server', function (done) {
      deps.getIt().then(function (response) {
        la(response && response.status === 200, 'expected success response', response);
        la(response.data === 42, 'expected data', response.data);
        done();
      });
      deps.http.flush();
    });

    it('returns status and data from server', function (done) {
      deps.getStatus().then(function (response) {
        la(response && response.status === 201, 'expected 201', response);
        la(response.data === 'foo', 'expected data', response.data);
        done();
      });
      deps.http.flush();
    });

    it('returns server error', function (done) {
      deps.failToGetIt().catch(function (response) {
        la(response && response.status === 500, 'expected error response', response);
        la(check.not.has(response, 'data'), 'expected no data', response);
        done();
      });
      deps.http.flush();
    });

    it('runs a function to respond', function (done) {
      deps.customGetIt().then(function (response) {
        la(response && response.status === 200, 'expected error response', response);
        la(response.data === 21, 'expected 21 in the data', response);
        done();
      });
      deps.http.flush();
    });
  }
});

ngDescribe({
  name: 'http response shortcuts POST',
  modules: 'apiPostCaller',
  inject: ['postIt'],
  only: false,
  verbose: false,
  http: {
    post: {
      '/my/url': 84 // return 84 on post
    }
  },
  tests: function (deps) {
    it('calls mock post', function (done) {
      deps.postIt().then(function (response) {
        la(response && response.status === 200, 'expected success response', response);
        la(response.data === 84, 'expected data', response.data);
        done();
      });
      deps.http.flush();
    });
  }
});

ngDescribe({
  name: 'dynamic GET response',
  modules: 'apiGetCaller',
  inject: ['getIt'],
  only: false,
  verbose: false,
  http: {
    get: function constructGetApi() {
      var mockApi = {};
      mockApi['/my/url'] = 42;
      return mockApi;
    }
  },
  tests: function (deps) {
    it('gets the value', function (done) {
      deps.getIt().then(function (response) {
        la(response &&
          response.status === 200 &&
          response.data === 42, 'wrong response', response);
        done();
      });
      deps.http.flush();
    });
  }
});

ngDescribe({
  name: 'dynamic http mock response',
  modules: 'apiGetCaller',
  inject: ['getIt'],
  only: false,
  verbose: false,
  http: function constructMockApi() {
    return {
      get: function () {
        return {'/my/url': 42};
      },
      post: {
        '/my/other/url': [200, 'nice']
      }
    };
  },
  tests: function (deps) {
    it('gets the value', function (done) {
      deps.getIt().then(function (response) {
        la(response &&
          response.status === 200 &&
          response.data === 42, 'wrong response', response);
        done();
      });
      deps.http.flush();
    });

    it('can use .step shortcut', function (done) {
      deps.getIt().finally(done);
      deps.step();
    });
  }
});

ngDescribe({
  name: 'http mock backend example using $httpBackend',
  modules: ['apiGetCaller'],
  inject: ['getIt', '$httpBackend', '$rootScope'],
  only: false,
  tests: function (deps) {
    beforeEach(function () {
      la(check.has(deps, '$httpBackend'), 'expected httpBackend', deps);
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
      la(deps.$rootScope, 'has root scope');
      // why is this an issue only in Jasmine?
      la(!deps.$rootScope.$$phase, 'not in digest cycle', deps.$rootScope.$$phase);
      deps.$httpBackend.verifyNoOutstandingRequest();
      deps.$httpBackend.verifyNoOutstandingExpectation();
    });
  }
});

ngDescribe({
  name: 'several before and after blocks',
  modules: 'apiGetCaller',
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
