(function setupNgDescribe(root) {
  /* global check, la, angular */
  // check - kensho/check-more-types
  // la - bahmutov/lazy-ass
  la(check.object(root), 'missing root');

  var _defaults = {
    name: 'default tests',
    modules: [],
    configs: {},
    inject: [],
    tests: function () {},
    only: false,
    verbose: false,
    mocks: {}
  };

  function defaults(opts) {
    opts = opts || {};
    return angular.extend(angular.copy(_defaults), opts);
  }

  var ngDescribeSchema = {
    name: check.unemptyString,
    modules: check.arrayOfStrings,
    configs: check.object,
    inject: check.arrayOfStrings,
    tests: check.fn,
    only: check.bool,
    mocks: check.object
  };

  /*
    callback function cb will be called with all dependencies in one object (by name)

    // mock modules A and B
    // inject serviceAdd
    ngDescribe({
      name: 'my suite',
      modules: ['A', 'B'],
      inject: ['serviceAdd'],
      // object of configs following config module pattern
      // see http://bahmutov.calepin.co/inject-valid-constants-into-angular.html
      configs: {},
      only: false, // use ddescribe
      verbose: false, // console.log modules and injected names
      tests: function (deps) {
        // multiple specs here
        it('can add numbers', function () {
          expect(deps.serviceAdd(2, 3)).toBe(5);
        });
      }
    });
  */
  function ngDescribe(options) {
    la(check.defined(angular), 'missing angular');
    options = defaults(options);

    if (check.string(options.modules)) {
      options.modules = [options.modules];
    }
    if (check.string(options.inject)) {
      options.inject = [options.inject];
    }

    var log = options.verbose ? console.log : angular.noop;

    var isValidNgDescribe = angular.bind(null, check.schema, ngDescribeSchema);
    la(isValidNgDescribe(options), 'invalid input options', options);

    var suiteFn = options.only ? root.ddescribe : root.describe;
    la(check.fn(suiteFn), 'missing describe function');

    suiteFn(options.name, function () {
      root.beforeEach(function mockModules() {
        log('loading modules', options.modules);

        options.modules.forEach(function (moduleName) {
          if (options.configs[moduleName]) {
            var m = angular.module(moduleName);
            m.config([moduleName + 'Provider', function (provider) {
              provider.set(options.configs[moduleName]);
            }]);
          } else {
            angular.mock.module(moduleName, function ($provide) {
              var mocks = options.mocks[moduleName];
              if (mocks) {
                log('mocking', Object.keys(mocks));
                Object.keys(mocks).forEach(function (mockName) {
                  $provide.value(mockName, mocks[mockName]);
                });
              }
            });
          }
        });
      });

      var dependencies = {};
      root.beforeEach(angular.mock.inject(function ($injector) {
        log('injecting', options.inject);
        options.inject.forEach(function (dependencyName) {
          dependencies[dependencyName] = $injector.get(dependencyName);
        });
      }));

      options.tests(dependencies);

      root.afterEach(function () {
        options.inject.forEach(function (dependencyName) {
          delete dependencies[dependencyName];
        });
      });
    });
  }

  root.ngDescribe = ngDescribe;

}(this));
