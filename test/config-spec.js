angular.module('G', ['GConfig'])
  .service('foo', function (GConfig) {
    return function foo() {
      return GConfig.bar;
    };
  });

// config module has provider with same name
angular.module('GConfig', [])
  .provider('GConfig', function () {
    var config = {};
    return {
      set: function (settings) {
        config = settings;
      },
      $get: function () {
        return config;
      }
    };
  });

/* global ngDescribe, it */
ngDescribe({
  name: 'config modules',
  modules: 'G',
  inject: 'foo',
  configs: {
    GConfig: {
      bar: 'boo!'
    }
  },
  tests: function (deps) {
    it('has foo service', function () {
      la(check.fn(deps.foo), 'foo is in dependencies');
    });

    it('foo has configured bar value', function () {
      var bar = deps.foo();
      la(bar === 'boo!');
    });
  }
});

