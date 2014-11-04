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

    it('injected $q into mock', function (done) {
      deps.getFoo().then(function (result) {
        la(result === 4, 'resolved with correct value');
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
