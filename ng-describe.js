(function setupNgDescribe(root) {
  // check - kensho/check-more-types
  // la - bahmutov/lazy-ass
  la(check.object(root), 'missing root');

  var _defaults = {
    // primary options
    name: 'default tests',
    modules: [],
    configs: {},
    inject: [],
    tests: function () {},
    mocks: {},
    helpful: false,
    controllers: [],
    element: '',
    // secondary options
    only: false,
    verbose: false,
    skip: false,
    parentScope: {}
  };

  function defaults(opts) {
    opts = opts || {};
    return angular.extend(angular.copy(_defaults), opts);
  }

  var ngDescribeSchema = {
    // primary options
    name: check.unemptyString,
    modules: check.arrayOfStrings,
    configs: check.object,
    inject: check.arrayOfStrings,
    tests: check.fn,
    mocks: check.object,
    helpful: check.bool,
    controllers: check.arrayOfStrings,
    element: check.string,
    // secondary options
    only: check.bool,
    verbose: check.bool,
    skip: check.bool,
    parentScope: check.object
  };

  function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
  }

  function ngDescribe(options) {
    la(check.defined(angular), 'missing angular');
    options = defaults(options);

    if (check.string(options.modules)) {
      options.modules = [options.modules];
    }
    if (check.string(options.inject)) {
      options.inject = [options.inject];
    }
    if (check.string(options.controllers)) {
      options.controllers = [options.controllers];
    }

    if (options.controllers.length) {
      options.inject.push('$controller');
      options.inject.push('$rootScope');
    }

    if (check.unemptyString(options.element)) {
      options.inject.push('$rootScope');
      options.inject.push('$compile');
    }

    // auto inject mocked modules
    options.modules = options.modules.concat(Object.keys(options.mocks));
    // auto inject configured modules
    options.modules = options.modules.concat(Object.keys(options.configs));

    options.modules = uniq(options.modules);
    options.inject = uniq(options.inject);
    options.controllers = uniq(options.controllers);

    var log = options.verbose ? console.log : angular.noop;

    var isValidNgDescribe = angular.bind(null, check.schema, ngDescribeSchema);
    la(isValidNgDescribe(options), 'invalid input options', options);

    var suiteFn = root.describe;
    if (options.only) {
      // run only this describe block using Jasmine or Mocha
      // http://bahmutov.calepin.co/focus-on-specific-jasmine-suite-in-karma.html
      suiteFn = root.ddescribe || root.describe.only;
    }
    if (options.helpful) {
      suiteFn = root.helpDescribe;
    }
    if (options.skip) {
      la(!options.only, 'skip and only are exclusive options', options);
      suiteFn = root.xdescribe || root.describe.skip;
    }
    la(check.fn(suiteFn), 'missing describe function', options);

    function ngSpecs() {

      root.beforeEach(function mockModules() {
        log('loading modules', options.modules);

        options.modules.forEach(function loadAngularModules(moduleName) {
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

      root.beforeEach(function setupControllers() {
        log('setting up controllers', options.controllers);
        options.controllers.forEach(function (controllerName) {
          la(check.fn(dependencies.$controller), 'need $controller service', dependencies);
          la(check.object(dependencies.$rootScope), 'need $rootScope service', dependencies);
          var scope = dependencies.$rootScope.$new();
          dependencies.$controller(controllerName, {
            $scope: scope
          });
          dependencies[controllerName] = scope;
        });
      });

      if (check.unemptyString(options.element)) {
        log('setting up element', options.element);
        root.beforeEach(function setupElement() {
          la(check.fn(dependencies.$compile), 'missing $compile', dependencies);

          var scope = dependencies.$rootScope.$new();
          angular.extend(scope, options.parentScope);
          log('created element scope with values', options.parentScope);

          var element = angular.element(options.element);
          var compiled = dependencies.$compile(element);
          compiled(scope);
          dependencies.$rootScope.$digest();

          dependencies.element = element;
          dependencies.parentScope = scope;
        });
      }

      options.tests(dependencies);

      root.afterEach(function () {
        options.inject.forEach(function (dependencyName) {
          delete dependencies[dependencyName];
        });
      });
    }

    suiteFn(options.name, ngSpecs);
  }

  root.ngDescribe = ngDescribe;

}(this));
