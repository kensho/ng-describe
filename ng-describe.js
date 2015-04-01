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
    exposeApi: false,
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
    exposeApi: check.bool,
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

  function clone(a) {
    return JSON.parse(JSON.stringify(a));
  }

  function methodNames(reference) {
    la(check.object(reference), 'expected object reference, not', reference);

    return Object.keys(reference).filter(function (key) {
      return check.fn(reference[key]);
    });
  }

  function copyAliases(options) {
    if (options.config && !options.configs) {
      options.configs = options.config;
    }
    if (options.mock && !options.mocks) {
      options.mocks = options.mock;
    }
    if (options.module && !options.modules) {
      options.modules = options.module;
    }
    if (options.test && !options.tests) {
      options.tests = options.test;
    }
    if (options.controller && !options.controllers) {
      options.controllers = options.controller;
    }
    return options;
  }

  function ensureArrays(options) {
    if (check.string(options.modules)) {
      options.modules = [options.modules];
    }
    if (check.string(options.inject)) {
      options.inject = [options.inject];
    }
    if (check.string(options.controllers)) {
      options.controllers = [options.controllers];
    }
    return options;
  }

  function collectInjects(options) {
    la(check.object(options) && check.array(options.controllers),
      'missing controllers', options);

    if (options.controllers.length || options.exposeApi) {
      options.inject.push('$controller');
      options.inject.push('$rootScope');
    }

    if (check.unemptyString(options.element) || options.exposeApi) {
      options.inject.push('$rootScope');
      options.inject.push('$compile');
    }

    // auto inject mocked modules
    options.modules = options.modules.concat(Object.keys(options.mocks));
    // auto inject configured modules
    options.modules = options.modules.concat(Object.keys(options.configs));

    return options;
  }

  function ensureUnique(options) {
    options.inject = uniq(options.inject);
    options.modules = uniq(options.modules);
    options.controllers = uniq(options.controllers);
    return options;
  }

  function decideSuiteFunction(options) {
    var suiteFn = root.describe;
    if (options.only) {
      // run only this describe block using Jasmine or Mocha
      // http://bahmutov.calepin.co/focus-on-specific-jasmine-suite-in-karma.html
      // Jasmine 2.x vs 1.x syntax - fdescribe vs ddescribe
      suiteFn = root.fdescribe || root.ddescribe || root.describe.only;
    }
    if (options.helpful) {
      suiteFn = root.helpDescribe;
    }
    if (options.skip) {
      la(!options.only, 'skip and only are exclusive options', options);
      suiteFn = root.xdescribe || root.describe.skip;
    }
    return suiteFn;
  }

  function decideLogFunction(options) {
    return options.verbose ? angular.bind(console, console.log) : angular.noop;
  }

  function ngDescribe(options) {
    la(check.object(options), 'expected options object, see docs', options);
    la(check.defined(angular), 'missing angular');

    options = copyAliases(options);
    options = defaults(options);
    options = ensureArrays(options);
    options = collectInjects(options);
    options = ensureUnique(options);

    var log = decideLogFunction(options);
    la(check.fn(log), 'could not decide on log function', options);

    var isValidNgDescribe = angular.bind(null, check.schema, ngDescribeSchema);
    la(isValidNgDescribe(options), 'invalid input options', options);

    var suiteFn = decideSuiteFunction(options);
    la(check.fn(suiteFn), 'missing describe function', options);

    // list of services to inject into mock functions
    var mockInjects = [];

    function ngSpecs() {

      var dependencies = {};

      function partiallInjectMethod(owner, mockName, fn, $injector) {
        la(check.unemptyString(mockName), 'expected mock name', mockName);
        la(check.fn(fn), 'expected function for', mockName, 'got', fn);

        var diNames = $injector.annotate(fn);
        log('dinames for', mockName, diNames);
        mockInjects.push.apply(mockInjects, diNames);

        var wrappedFunction = function injectedDependenciesIntoMockFunction() {
          var runtimeArguments = arguments;
          var k = 0;
          var args = diNames.map(function (name) {
            if (check.has(dependencies, name)) {
              // name is injected by dependency injection
              return dependencies[name];
            }
            // argument is runtime
            return runtimeArguments[k++];
          });
          return fn.apply(owner, args);
        };
        return wrappedFunction;
      }

      function partiallyInjectObject(reference, mockName, $injector) {
        la(check.object(reference), 'expected object reference, not', reference);

        methodNames(reference).forEach(function (key) {
          reference[key] = partiallInjectMethod(reference,
            mockName + '.' + key, reference[key], $injector);
        });

        return reference;
      }

      root.beforeEach(function mockModules() {
        log('ngDescribe', options.name);
        log('loading modules', options.modules);

        options.modules.forEach(function loadAngularModules(moduleName) {
          if (options.configs[moduleName]) {
            var m = angular.module(moduleName);
            m.config([moduleName + 'Provider', function (provider) {
              var cloned = clone(options.configs[moduleName]);
              log('setting config', moduleName + 'Provider to', cloned);
              provider.set(cloned);
            }]);
          } else {
            angular.mock.module(moduleName, function ($provide, $injector) {
              var mocks = options.mocks[moduleName];
              if (mocks) {
                log('mocking', Object.keys(mocks));
                Object.keys(mocks).forEach(function (mockName) {
                  var value = mocks[mockName];

                  if (check.fn(value) && !value.injected) {
                    value = partiallInjectMethod(mocks, mockName, value, $injector);
                    value.injected = true; // prevent multiple wrapping
                  } else if (check.object(value) && !value.injected) {
                    value = partiallyInjectObject(value, mockName, $injector);
                    value.injected = true; // prevent multiple wrapping
                  }
                  $provide.value(mockName, value);
                });
              }
            });
          }
        });
      });

      root.beforeEach(angular.mock.inject(function ($injector) {
        log('injecting', options.inject);
        options.inject.forEach(function (dependencyName) {
          dependencies[dependencyName] = $injector.get(dependencyName);
        });

        mockInjects = uniq(mockInjects);
        log('injecting existing dependencies for mocks', mockInjects);
        mockInjects.forEach(function (dependencyName) {
          if ($injector.has(dependencyName)) {
            dependencies[dependencyName] = $injector.get(dependencyName);
          }
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

      function setupElement(elementHtml) {
        la(check.fn(dependencies.$compile), 'missing $compile', dependencies);

        var scope = dependencies.$rootScope.$new();
        angular.extend(scope, angular.copy(options.parentScope));
        log('created element scope with values', options.parentScope);

        var element = angular.element(elementHtml);
        var compiled = dependencies.$compile(element);
        compiled(scope);
        dependencies.$rootScope.$digest();

        dependencies.element = element;
        dependencies.parentScope = scope;
      }

      function exposeApi() {
        return {
          setupElement: setupElement
        };
      }

      var toExpose = options.exposeApi ? exposeApi() : undefined;
      options.tests(dependencies, toExpose);

      // Element setup comes after tests setup by default so that any beforeEach clauses
      // within the tests occur before the element is compiled, i.e. $httpBackend setup.
      if (check.unemptyString(options.element)) {
        log('setting up element', options.element);
        root.beforeEach(function () {
          setupElement(options.element);
        });
        root.afterEach(function () {
          delete dependencies.element;
        });
      }

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
