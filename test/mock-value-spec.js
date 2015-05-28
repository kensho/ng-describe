angular.module('C', ['A'])
  .service('getFoo', function (foo) {
    // foo is provided by module A
    return function getFoo() {
      return foo;
    };
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'test C without mocking',
  modules: ['C'],
  inject: ['getFoo'],
  tests: function (deps) {
    it('has mock injected value', function () {
      var result = deps.getFoo();
      la(result === 'bar', 'loads original value');
    });
  }
});

ngDescribe({
  name: 'test C with mocking',
  // load C and A
  // need A to mock a value it provides
  modules: ['C', 'A'],
  inject: ['getFoo'],
  mocks: {
    // mock foo from module A
    A: {
      foo: 42
    }
  },
  verbose: false,
  tests: function (deps) {
    it('has mock injected value', function () {
      var result = deps.getFoo();
      la(result === 42, 'we got back mock value', result);
    });
  }
});

ngDescribe({
  name: 'test C with mocking top level',
  modules: ['C'],
  inject: ['getFoo'],
  mocks: {
    // mock getFoo from module C
    C: {
      getFoo: function () {
        return 11;
      }
    }
  },
  verbose: false,
  tests: function (deps) {
    it('has mock injected value', function () {
      var result = deps.getFoo();
      la(result === 11, 'we got back mock value', result);
    });
  }
});

ngDescribe({
  name: 'mocked modules are loaded automatically',
  inject: ['getFoo'],
  mocks: {
    // mock getFoo from module C
    C: {
      getFoo: function () {
        return 11;
      }
    }
  },
  tests: function (deps) {
    it('has mock injected value', function () {
      var result = deps.getFoo();
      la(result === 11, 'we got back mock value', result);
    });
  }
});

ngDescribe({
  name: 'inject just $q',
  inject: ['$q'],
  tests: function (deps) {
    it('has $q', function () {
      la(check.has(deps, '$q'));
    });
  }
});

ngDescribe({
  name: 'mocking with injected services',
  inject: ['getFoo', '$q', '$rootScope'],
  only: false,
  mocks: {
    C: {
      getFoo: function ($q, $rootScope) {
        la(!$rootScope.$$phase, 'there is no need for phase');
        return $q.when(4);
      }
    }
  },
  tests: function (deps) {
    it('has getFoo', function () {
      la(check.fn(deps.getFoo));
    });

    it('injected $q into mock', function (done) {
      deps.getFoo().then(function (result) {
        la(result === 4, 'resolved with correct value');
        la(deps.$rootScope.$$phase === '$digest');
        done();
      });
      deps.$rootScope.$apply();
    });
  }
});

ngDescribe({
  name: 'needed services in mocks are injected automatically',
  inject: ['getFoo', '$rootScope'],
  verbose: false,
  mocks: {
    C: {
      getFoo: function ($q) {
        return $q.when(4);
      }
    }
  },
  tests: function (deps) {
    it('has getFoo', function () {
      la(check.fn(deps.getFoo));
    });

    it('injected $q into mock automatically', function (done) {
      deps.getFoo().then(function (result) {
        la(result === 4, 'resolved with correct value');
        done();
      });
      deps.$rootScope.$apply();
    });
  }
});

ngDescribe({
  name: 'allow non-injected arguments',
  inject: ['getFoo', '$rootScope'],
  verbose: false,
  only: false,
  mocks: {
    C: {
      getFoo: function ($q, value) {
        return $q.when(value);
      }
    }
  },
  tests: function (deps) {
    it('injects $q but leaves "value" parameter free', function (done) {
      deps.getFoo(21).then(function (result) {
        la(result === 21, 'resolved with correct value');
        done();
      });
      deps.$rootScope.$apply();
    });
  }
});

ngDescribe({
  name: 'allow non-injected arguments mixed with injected',
  inject: ['getFoo', '$rootScope', 'mockObject'],
  verbose: false,
  only: false,
  mocks: {
    C: {
      getFoo: function (value, $q) {
        return $q.when(value);
      },
      mockObject: {
        getBar: function ($q, val) {
          return $q.when(val);
        }
      }
    }
  },
  tests: function (deps) {
    it('injects $q but leaves "value" parameter free', function (done) {
      deps.getFoo(21).then(function (result) {
        la(result === 21, 'resolved with correct value');
        done();
      });
      deps.$rootScope.$apply();
    });

    it('test function again', function (done) {
      deps.getFoo(22).then(function (result) {
        la(result === 22);
        done();
      });
      deps.$rootScope.$apply();
    });

    it('has mocked object', function () {
      la(check.has(deps, 'mockObject'));
      la(check.has(deps.mockObject, 'getBar'));
    });

    it('injects $q into method inside mocked object', function (done) {
      deps.mockObject.getBar('bar').then(function (result) {
        la(result === 'bar', 'bar value');
        done();
      });
      deps.$rootScope.$apply();
    });

    it('injects mock object again', function (done) {
      deps.mockObject.getBar('bar2').then(function (result) {
        la(result === 'bar2', 'bar2 value');
        done();
      });
      deps.$rootScope.$apply();
    });
  }
});
