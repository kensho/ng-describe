angular.module('Remote', [])
  .service('greeting', function () {
    return function greeting() {
      // console.log('returning hello');
      return 'Hello';
    };
  })
  .service('username', function ($http) {
    return function username() {
      // console.log('calling server for username');
      return $http.get('/user/name');
    };
  });
angular.module('GreetUser', ['Remote'])
  .service('helloUser', function (greeting, username) {
    return function hello() {
      return username()
        .then(function (name) {
          return greeting() + ' ' + name + '!';
        });
    };
  });

/* global ngDescribe, it */
ngDescribe({
  module: 'GreetUser',
  inject: ['helloUser', '$rootScope'],
  skip: true,
  tests: function (deps) {
    it('makes http request', function (done) {
      deps.helloUser()
        .then(function (value) {
          la(value === 42);
        })
        .finally(done);
      deps.$rootScope.$apply();
    });
  }
})({
  module: 'GreetUser',
  inject: ['helloUser', '$rootScope'],
  only: false,
  verbose: false,
  mock: {
    Remote: {
      username: function ($q) {
        return $q.when('Test');
      }
    }
  },
  tests: function (deps) {
    it('does not make http requests', function (done) {
      deps.helloUser()
        .then(function (value) {
          la(value === 'Hello Test!');
        })
        .finally(done);
      deps.$rootScope.$apply();
    });
  }
});
