(function setupNgDescribe(root) {
  var check = root.check;

  // probably loaded under Node

  if (typeof la === 'undefined') {
    // lazy assertions from bahmutov/lazy-ass
    la = require('lazy-ass');
  }
  if (typeof check === 'undefined') {
    // check predicates from kensho/check-more-types
    /* global require */
    check = require('check-more-types');
  }
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
    http: {},
    // secondary options
    only: false,
    verbose: false,
    skip: false,
    parentScope: {}
  };

  function defaults(opts) {
    opts = opts || {};
    return root.angular.extend(root.angular.copy(_defaults), opts);
  }

  la(check.fn(check.or), 'cannot find check.or method', check);

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
    // TODO allow object OR function
    // http: check.object,
    // secondary options
    only: check.bool,
    verbose: check.bool,
    skip: check.or(check.bool, check.unemptyString),
    parentScope: check.object
  };

  function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
  }

  function isDefined(a) {
    return typeof a !== 'undefined';
  }

  function clone(a) {
    return isDefined(a) ? JSON.parse(JSON.stringify(a)) : undefined;
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

    if (check.not.empty(options.http) || check.fn(options.http)) {
      options.inject.push('$httpBackend');
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

  // returns original BDD callbacks provided by the testing framework
  // except for the main 'describe' function
  // describe can be replaced with skip / only version
  function bddCallbacks(options) {
    // Allow finding test framework OUTSIDE the angular environment
    // useful when loading angular + ngDescribe in synthetic Node browser
    // attached to window object,
    // but running Mocha / Jasmine in Node (global) context
    var globalOrWindow = options.root || root;
    function decideSuiteFunction(options) {
      var suiteFn = globalOrWindow.describe;
      if (options.only) {
        // run only this describe block using Jasmine or Mocha
        // http://bahmutov.calepin.co/focus-on-specific-jasmine-suite-in-karma.html
        // Jasmine 2.x vs 1.x syntax - fdescribe vs ddescribe
        suiteFn = globalOrWindow.fdescribe || globalOrWindow.ddescribe || globalOrWindow.describe.only;
      }
      if (options.helpful) {
        suiteFn = globalOrWindow.helpDescribe;
      }
      if (options.skip) {
        la(!options.only, 'skip and only are exclusive options', options);
        suiteFn = globalOrWindow.xdescribe || globalOrWindow.describe.skip;
      }
      return suiteFn;
    }

    return {
      describe: decideSuiteFunction(options),
      beforeEach: globalOrWindow.beforeEach,
      afterEach: globalOrWindow.afterEach,
      it: globalOrWindow.it
    };
  }

  function decideLogFunction(options) {
    return options.verbose ? root.angular.bind(console, console.log) : root.angular.noop;
  }

  function ngDescribe(options) {
    la(check.object(options), 'expected options object, see docs', options);
    la(check.defined(root.angular), 'missing angular');

    var explicitInjectCopy = clone(options.inject);

    options = copyAliases(options);
    options = defaults(options);
    options = ensureArrays(options);
    options = collectInjects(options);
    options = ensureUnique(options);

    function hasImplicitInjects() {
      if (explicitInjectCopy) {
        return false;
      }
      if (options.exposeApi) {
        return false;
      }
      var depsTests = /^function\s+[a-zA-Z0-9]*\s*\((deps|dependencies)\)/;
      var testCode = options.tests.toString();
      return !depsTests.test(testCode);
    }

    var log = decideLogFunction(options);
    la(check.fn(log), 'could not decide on log function', options);

    var isValidNgDescribe = root.angular.bind(null, check.schema, ngDescribeSchema);
    la(isValidNgDescribe(options), 'invalid input options', options);

    var bdd = bddCallbacks(options);
    la(check.fn(bdd.describe), 'missing describe function in', bdd, 'options', options);

    // list of services to inject into mock functions
    var mockInjects = [];

    var aliasedDependencies = {
      '$httpBackend': 'http'
    };

    function ngSpecs() {

      var dependencies = {};
      // individual functions that should run after each unit test
      // to clean up everything setup.
      var cleanupCallbacks = [];

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

      bdd.beforeEach(function checkEnvironment() {
        la(check.object(root.angular), 'angular is undefined');
        la(check.has(root.angular, 'mock'), 'angular.mock is undefined');
        la(check.fn(root.angular.mock.module),
          'missing angular mock module fn, is running inside jasmine or mocha?');
      });

      bdd.beforeEach(function mockModules() {
        log('ngDescribe', options.name);
        log('loading modules', options.modules);

        options.modules.forEach(function loadAngularModules(moduleName) {
          if (options.configs[moduleName]) {
            var m = root.angular.module(moduleName);
            m.config([moduleName + 'Provider', function (provider) {
              var cloned = clone(options.configs[moduleName]);
              log('setting config', moduleName + 'Provider to', cloned);
              provider.set(cloned);
            }]);
          } else {
            root.angular.mock.module(moduleName, function ($provide, $injector) {
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
                  // should we inject a value or a constant?
                  $provide.constant(mockName, value);
                });
              }
            });
          }
        });
      });

      function injectDependencies($injector) {
        var implicit = hasImplicitInjects();
        if (implicit) {
          options.inject = $injector.annotate(options.tests);
          log('implicit injects', options.inject);
        }

        if(options.inject.indexOf('$rootScope') === -1) {
          options.inject.push('$rootScope');
        }

        log('injecting', options.inject);

        options.inject.forEach(function (dependencyName, k) {
          var injectedUnderName = aliasedDependencies[dependencyName] || dependencyName;
          la(check.unemptyString(injectedUnderName),
            'could not rename dependency', dependencyName);
          var value = $injector.get(dependencyName);
          if (implicit) {
            dependencies[String(k)] = value;
          } else {
            dependencies[injectedUnderName] = dependencies[dependencyName] = value;
          }
        });

        mockInjects = uniq(mockInjects);
        log('injecting existing dependencies for mocks', mockInjects);
        mockInjects.forEach(function (dependencyName) {
          if ($injector.has(dependencyName)) {
            dependencies[dependencyName] = $injector.get(dependencyName);
          }
        });
      }

      function setupControllers(controllerNames) {
        if (check.unemptyString(controllerNames)) {
          controllerNames = [controllerNames];
        }
        log('setting up controllers', controllerNames);
        la(check.arrayOfStrings(controllerNames),
          'expected list of controller names', controllerNames);

        controllerNames.forEach(function (controllerName) {
          la(check.fn(dependencies.$controller), 'need $controller service', dependencies);
          la(check.object(dependencies.$rootScope), 'need $rootScope service', dependencies);
          var scope = dependencies.$rootScope.$new();
          dependencies.$controller(controllerName, {
            $scope: scope
          });
          dependencies[controllerName] = scope;

          // need to clean up anything created when setupControllers was called
          bdd.afterEach(function () {
            log('deleting controller name', controllerName, 'from dependencies',
              Object.keys(dependencies));
            delete dependencies[controllerName];
          });
        });
      }

      function isResponseCode(x) {
        return check.number(x) && x >= 200 && x < 550;
      }

      function isResponsePair(x) {
        return check.array(x) &&
          x.length === 2 &&
          isResponseCode(x[0]);
      }

      function setupMethodHttpResponses(methodName) {
        la(check.unemptyString(methodName), 'expected method name', methodName);
        var mockConfig = options.http[methodName];

        if (check.fn(mockConfig)) {
          mockConfig = mockConfig();
        }

        la(check.object(mockConfig),
          'expected mock config for http method', methodName, mockConfig);
        var method = methodName.toUpperCase();

        Object.keys(mockConfig).forEach(function (url) {
          log('mocking', method, 'response for url', url);

          var value = mockConfig[url];
          if (check.fn(value)) {
            return dependencies.http.when(method, url).respond(function () {
              var result = value.apply(null, arguments);
              if (isResponsePair(result)) {
                return result;
              }
              return [200, result];
            });
          }
          if (check.number(value) && isResponseCode(value)) {
            return dependencies.http.when(method, url).respond(value);
          }
          if (isResponsePair(value)) {
            return dependencies.http.when(method, url).respond(value[0], value[1]);
          }

          if (Array.isArray(value) && value.length >= 3) {
            return dependencies.http.when(method, url).respond(function (method, url, data, headers) {
              var compiledHeaders = value[2] ? root.angular.extend(headers, value[2]) : headers;

              return [value[0], value[1], compiledHeaders, value[3] || ''];
            });
          }
          return dependencies.http.when(method, url).respond(200, value);
        });
      }

      function setupHttpResponses() {
        if (check.not.has(options, 'http')) {
          return;
        }
        if (check.empty(options.http)) {
          return;
        }

        la(check.object(options.http), 'expected mock http object', options.http);

        log('setting up mock http responses', options.http);
        la(check.has(dependencies, 'http'), 'expected to inject http', dependencies);

        function hasMockResponses(methodName) {
          return check.has(options.http, methodName);
        }

        var validMethods = ['get', 'head', 'post', 'put', 'delete', 'jsonp', 'patch'];
        validMethods
          .filter(hasMockResponses)
          .forEach(setupMethodHttpResponses);
      }

      function setupDigestCycleShortcut() {
        dependencies.step = function step() {
          if (dependencies.http && check.fn(dependencies.http.flush)) {
            dependencies.http.flush();
          }
          if (dependencies.$rootScope) {
            dependencies.$rootScope.$digest();
          }
          if (dependencies.$timeout) {
            dependencies.$timeout.flush();
          }
        };
      }

      // treat http option a little differently
      function loadDynamicHttp() {
        if (check.fn(options.http)) {
          options.http = options.http();
        }
      }

      bdd.beforeEach(loadDynamicHttp);
      bdd.beforeEach(function injectDeps() {
        // defer using angular.mock
        root.angular.mock.inject(injectDependencies);
      });
      bdd.beforeEach(setupDigestCycleShortcut);
      bdd.beforeEach(setupHttpResponses);

      function setupElement(elementHtml) {
        la(check.fn(dependencies.$compile), 'missing $compile', dependencies);

        var scope = dependencies.$rootScope.$new();
        root.angular.extend(scope, root.angular.copy(options.parentScope));
        log('created element scope with values', options.parentScope);

        var element = root.angular.element(elementHtml);
        var compiled = dependencies.$compile(element);
        compiled(scope);
        dependencies.$rootScope.$digest();

        dependencies.element = element;
        dependencies.parentScope = scope;
      }

      function runTestCallbackExposeArguments() {
        var testsCode = options.tests.toString();
        var returnArguments = testsCode.replace(/\}\s*$/, '\nreturn arguments;\n}');
        /* jshint -W061 */
        var testCallback = eval('(' + returnArguments + ')');
        dependencies = testCallback.apply(null, new Array(testCallback.length));
        la(check.object(dependencies), 'have not received arguments');
      }

      function exposeApi() {
        return {
          setupElement: setupElement,
          setupControllers: setupControllers
        };
      }

      var toExpose = options.exposeApi ? exposeApi() : undefined;

      // call the user-supplied test function to register the actual unit tests
      if (hasImplicitInjects()) {
        runTestCallbackExposeArguments();
      } else {
        options.tests(dependencies, toExpose);
      }

      // Element setup comes after tests setup by default so that any beforeEach clauses
      // within the tests occur before the element is compiled, i.e. $httpBackend setup.
      if (check.unemptyString(options.element)) {
        log('setting up element', options.element);
        bdd.beforeEach(function () {
          setupElement(options.element);
        });
        cleanupCallbacks.push(function cleanupElement() {
          log('deleting created element');
          delete dependencies.element;
        });
      }

      if (check.has(options, 'controllers') &&
        check.unempty(options.controllers)) {

        bdd.beforeEach(function () {
          setupControllers(options.controllers);
        });
      }

      function deleteDependencies() {
        la(check.object(dependencies), 'missing dependencies object', dependencies);

        log('deleting dependencies injected by ngDescribe from', Object.keys(dependencies));
        log('before cleaning up, these names were injected', options.inject);

        var implicit = hasImplicitInjects();
        if (implicit) {
          log('removing implicit dependencies');
          options.inject.forEach(function deleteImplicitDependency(name, k) {
            delete dependencies[String(k)];
          });
          return;
        }

        options.inject.forEach(function deleteInjectedDependency(dependencyName, k) {
          la(check.unemptyString(dependencyName), 'missing dependency name', dependencyName);
          var name = aliasedDependencies[dependencyName] || dependencyName;
          log('deleting injected name', dependencyName, 'alias', name, 'index', k);

          la(check.has(dependencies, name),
            'cannot find injected dependency', name, '(or alias)', dependencyName,
            'in', dependencies);
          la(check.has(dependencies, dependencyName),
            'cannot find injected dependency', dependencyName);

          log('deleting property', name, 'from dependencies', Object.keys(dependencies));
          delete dependencies[name];
          delete dependencies[dependencyName];
          log('remaining dependencies object', Object.keys(dependencies));
        });
      }
      cleanupCallbacks.push(deleteDependencies);

      function cleanUp(callbacks) {
        la(check.array(callbacks), 'expected list of callbacks', callbacks);
        log('inside cleanup afterEach', callbacks.length, 'callbacks');

        callbacks.forEach(function (fn) {
          la(check.fn(fn), 'expected function to cleanup, got', fn);
          bdd.afterEach(fn);
        });
      }

      log('cleanupCallbacks', cleanupCallbacks.length);
      cleanUp(cleanupCallbacks);
    }

    bdd.describe(options.name, ngSpecs);

    return ngDescribe;
  }

  root.ngDescribe = ngDescribe;

}(typeof window === 'object' ? window : this));
