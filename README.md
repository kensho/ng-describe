# ng-describe v0.10.2

> Convenient BDD specs for Angular

[![NPM][ng-describe-icon] ][ng-describe-url]
[![Quality][quality-badge] ][quality-url]

[![Build status][ng-describe-ci-image] ][ng-describe-ci-url]
[![Coverage Status][ng-describe-coverage-image] ][ng-describe-coverage-url]
[![Codacy Badge][ng-describe-codacy-image] ][ng-describe-codacy-url]
[![dependencies][ng-describe-dependencies-image] ][ng-describe-dependencies-url]
[![devdependencies][ng-describe-devdependencies-image] ][ng-describe-devdependencies-url]

Tested against angular v1.2, v1.3 and v1.4

[ng-describe-icon]: https://nodei.co/npm/ng-describe.png?downloads=true
[ng-describe-url]: https://npmjs.org/package/ng-describe
[ng-describe-ci-image]: https://travis-ci.org/kensho/ng-describe.png?branch=master
[ng-describe-ci-url]: https://travis-ci.org/kensho/ng-describe
[ng-describe-coverage-image]: https://coveralls.io/repos/kensho/ng-describe/badge.png
[ng-describe-coverage-url]: https://coveralls.io/r/kensho/ng-describe
[ng-describe-dependencies-image]: https://david-dm.org/kensho/ng-describe.png
[ng-describe-dependencies-url]: https://david-dm.org/kensho/ng-describe
[ng-describe-devdependencies-image]: https://david-dm.org/kensho/ng-describe/dev-status.png
[ng-describe-devdependencies-url]: https://david-dm.org/kensho/ng-describe#info=devDependencies
[ng-describe-codacy-image]: https://www.codacy.com/project/badge/25cb5d1410c7497cb057d887d1f3ea23
[ng-describe-codacy-url]: https://www.codacy.com/public/kensho/ng-describe.git

[quality-badge]: http://npm.packagequality.com/badge/ng-describe.png
[quality-url]: http://packagequality.com/#?package=ng-describe



* [Intro](#intro)
* [Install](#install)
* [API](#api)
  * [Primary options](#primary-options)
  * [Secondary options](#secondary-options)
* [Examples](#examples)
  * [Test value provided by a module](#test-value-provided-by-a-module)
  * [Test a filter](#test-a-filter)
  * [Test a service](#test-a-service)
  * [Test controller and scope](#test-controller-and-scope)
  * [Test directive](#test-directive)
  * [Test controllerAs syntax](#test-controlleras-syntax)
  * [Test controller instance in custom directive](#test-controller-instance-in-custom-directive)
  * [Test 2 way binding](#test-2-way-binding)
  * [Mock value provided by a module](#mock-value-provided-by-a-module)
  * [Angular services inside mocks](#angular-services-inside-mocks)
  * [beforeEach and afterEach](#beforeeach-and-aftereach)
  * [Spy on injected methods](#spy-on-injected-methods)
  * [Spy on mocked service](#spy-on-mocked-service)
  * [Configure module](#configure-module)
  * [Helpful failure messages](#helpful-failure-messages)
* [License](#license)


## Intro

Unit testing and mocking AngularJs requires a lot of boilerplate code:
```js
describe('typical test', function () {
    var $rootScope, foo;
    beforeEach(function () {
        angular.mock.module('A');
        // other modules
    });
    beforeEach(inject(function (_$rootScope_, _foo_) {
        $rootScope = _$rootScope_;
        foo = _foo_;
    }));
    it('finally a test', function () {
        expect(foo).toEqual('bar');
    });
});
```

ng-describe makes testing simple modules a breeze. 
Just list which modules you would like to load, which values / services / etc.
you would like to inject and then start testing. Same test as above using ng-describe
is much shorter and clearer:
```js
ngDescribe({
    modules: 'A',
    inject: ['$rootScope', 'foo'],
    tests: function (deps) {
        it('finally a test', function () {
            expect(deps.foo).toEqual('bar');
        });
    });
});
```
ng-describe can inject dependencies, mock modules, set configs, create controllers, scopes, and
even html fragments. For more details, continue reading.


## Install

`npm install ng-describe --save-dev`

Load ng-describe.js after angular, [lazy-ass](https://github.com/bahmutov/lazy-ass), 
[check-types](https://github.com/philbooth/check-types.js), 
[check-more-types](https://github.com/kensho/check-more-types) but before your code, for example in Karma conf file

    npm install lazy-ass check-types check-more-types angular angular-mocks --save-dev

    // karma.conf.js
    files: [
        'node_modules/check-types/src/check-types.js',
        'node_modules/check-more-types/check-more-types.js',
        'node_modules/lazy-ass/index.js',
        'node_modules/angular/angular.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'node_modules/ng-describe/ng-describe.js',
        '<your source.js>',
        '<your specs.js>'
    ],


## API

ng-describe provides a single function `ngDescribe` that takes an options object.

```js
ngDescribe({
  // your options
});
```

You do not have to specify every option, there are reasonable defaults.

### Primary options

**name** - a string name for the spec, similar to BDD `describe(name, ...)`

**modules** - list of modules to inject

```js
angular.module('A', []);
angular.module('B', []);
ngDescribe({
  name: 'modules example',
  modules: ['A', 'B']
});
```

You if have a single module to inject, you can just use a string name without Array notation

```js
ngDescribe({
  name: 'single module',
  modules: 'A'
});
```

**inject** - list of dependencies to inject into unit tests. A single dependency can be just a string
without Array notation. All dependencies will be exposed as properties of the `deps` argument to the
tests callback

```js
angular.module('A', []).value('foo', 42);
ngDescribe({
  name: 'inject example',
  modules: 'A',
  inject: ['foo', '$timeout'],
  tests: function (deps) {
    it('has foo', function () {
      expect(deps.foo).toEqual(42);
    });
    it('has timeout service', function () {
      expect(typeof deps.$timeout).toEqual('function');
    });
  }
});
```

**tests** - callback function that contains actual specs. This of this as `describe` equivalent with
all necessary Angular dependencies taken care of.

```js
ngDescribe({
  inject: ['$q', '$rootScope'],
  tests: function (deps) {
    it('injects $q', function () {
      expect(typeof deps.$q).toEqual('function');
    });
    it('can be resolved', function () {
      deps.$q.when(42).then(function (value) {
        expect(value).toEqual(42);
      });
      // move promises along
      deps.$rootScope.$digest();
    });
  }
});
```

**mocks** - top level mocks to be substituted into the tests. 
The mocks override *any* injected dependencies among modules.

```js
ngDescribe({
  mocks: {
    // each module to mock by name
    moduleName1: {
      // each dependency from moduleName1 to mock
      dependencyName1: mockValue1,
      dependencyName2: mockValue2
      // the rest of moduleName1 is unchanged
    },
    moduleName2: {
      // dependencies to mock in moduleName2
    }
  }
});
```

For more information see examples below.

**controllers** - list of controllers by name that be injected. Each controller
is created with a new `$rootScope` instance.

**NOTE: For each created controller, its SCOPE instance will be in the dependencies object.**

```js
angular.module('D', [])
  .controller('dController', function ($scope) {
    $scope.foo = 'foo';
  });
ngDescribe({
  modules: 'D',
  controllers: 'dController',
  tests: function (deps) {
    it('is a scope for controller', function () {
      expect(typeof deps.dController).toEqual('object');
      // deps.dController is the $scope object injected into dController
      expect(deps.dController.foo).toEqual('foo');
    });
  }
});
```

**element** - HTML fragment string for testing custom directives and DOM updates.

```js
ngDescribe({
  element: '<my-foo bar="baz"></my-foo>'
});
```

The compiled `angular.element` will be injected into dependencies object under `element` property.
See examples below for more information. The compilation will create a new scope object too.

**parentScope** - when creating HTML fragment, copies properties from this object into the
scope. The returned dependencies object will have `deps.parentScope` that is the new scope.

```js
// myFoo directive uses isolate scope for example
ngDescribe({
  element: '<my-foo bar="baz"></my-foo>',
  parentScope: {
    baz: 42
  },
  tests: function (deps) {
    it('baz -> bar', function () {
      deps.parentScope.baz = 100;
      deps.$rootScope.$apply();
      expect(deps.element.isolateScope().bar).toEqual(100);
    });
  }
});
```

See "2 way binding" example below.

**configs** - object with modules that have provider that can be used to inject
run time settings. 
See *Update 1* in 
[Inject valid constants into Angular](http://bahmutov.calepin.co/inject-valid-constants-into-angular.html)
blog post and examples below.

### Secondary options

**verbose** - flag to print debug messages during execution

**only** - flag to run this set of tests and skip the rest. Equivalent to 
[ddescribe or describe.only](http://bahmutov.calepin.co/focus-on-specific-jasmine-suite-in-karma.html).

```js
ngDescribe({
  name: 'run this module only',
  only: true
});
```

**skip** - flag to skip this group of specs. Equivalent to `xdescribe` or `describe.skip`.

**exposeApi** - instead of creating element right away, expose element factory so that you can create
an element *after* running a `beforeEach` block. Useful for setting up mock backend before creating
an element.

```js
ngDescribe({
  exposeApi: true,
  inject: '$httpBackend',
  // no element option
  tests: function (deps, describeApi) {
    beforeEach(function () {
      deps.$httpBackend
        .expectGET('/api/foo/bar').respond(500);
    });
    beforeEach(function () {
      // now create an element ourselves
      describeApi.setupElement('<study-flags />');
    });
    it('created an element', function () {
      la(check.has(deps.element));
    });
  });
});
```


## Examples

Some examples use Jasmine matchers, others use `la` assertion from
[lazy-ass](https://github.com/bahmutov/lazy-ass) library and *done* callback argument
from [Mocha](http://visionmedia.github.io/mocha/) testing framework.

### Test value provided by a module

```js
// A.js
angular.module('A', [])
  .value('foo', 'bar');
// A-spec.js
ngDescribe({
  name: 'test value',
  modules: 'A',
  inject: 'foo',
  tests: function (deps) {
    // deps object has every injected dependency as a property
    it('has correct value foo', function () {
      expect(deps.foo).toEqual('bar');
    });
  }
});
```

### Test a filter

We can easily test a built-in or custom filter function

```js
ngDescribe({
  name: 'built-in filter',
  inject: '$filter',
  tests: function (deps) {
    it('can convert to lowercase', function () {
      var lowercase = deps.$filter('lowercase');
      la(lowercase('Foo') === 'foo');
    });
  }
});
```

### Test a service

We can inject a service to test using the same approach. You can even use multiple specs inside `tests` callback.

```js
// B.js
angular.module('B', ['A'])
  .service('addFoo', function (foo) {
    return function (str) {
      return str + foo;
    };
  });
// B-spec.js
ngDescribe({
  name: 'service tests',
  modules: 'B',
  inject: 'addFoo',
  tests: function (deps) {
    it('is a function', function () {
      expect(typeof deps.addFoo).toEqual('function');
    });
    it('appends value of foo to any string', function () {
      var result = deps.addFoo('x');
      expect(result).toEqual('xbar');
    });
  }
});
```

### Test controller and scope

We can easily create instances of controller functions and scope objects.
In this example we also inject `$timeout` service to speed up delayed actions
(see [Testing Angular async stuff](http://glebbahmutov.com/blog/testing-angular-async-stuff/)).

```js
angular.module('S', [])
  .controller('sample', function ($timeout, $scope) {
    $scope.foo = 'foo';
    $scope.update = function () {
      $timeout(function () {
        $scope.foo = 'bar';
      }, 1000);
    };
  });
ngDescribe({
  name: 'timeout in controller',
  modules: 'S',
  // inject $timeout so we can flush the timeout queue
  inject: ['$timeout'],
  controllers: 'sample',
  tests: function (deps) {
    // deps.sample = $scope object injected into sample controller
    it('has initial values', function () {
      la(deps.sample.foo === 'foo');
    });
    it('updates after timeout', function () {
      deps.sample.update();
      deps.$timeout.flush();
      la(deps.sample.foo === 'bar');
    });
  }
});
```

### Test directive

```js
angular.module('MyFoo', [])
  .directive('myFoo', function () {
    return {
      restrict: 'E',
      replace: true,
      template: '<span>{{ bar }}</span>'
    };
  });
ngDescribe({
  name: 'MyFoo directive',
  modules: 'MyFoo',
  element: '<my-foo></my-foo>',
  tests: function (deps) {
    it('can update DOM using binding', function () {
      la(check.has(deps, 'element'), 'has compiled element');
      var scope = deps.element.scope();
      scope.bar = 'bar';
      scope.$apply();
      la(deps.element.html() === 'bar');
    });
  }
});
```

### Test controllerAs syntax

If you use `controllerAs` syntax without any components (see [Binding to ...][binding] post),
then you can still test it quickly

```js
angular.module('H', [])
  .controller('hController', function () {
    // notice we attach properties to the instance, not to the $scope
    this.foo = 'foo';
  });
  ngDescribe({
    module: 'H',
    element: '<div ng-controller="hController as ctrl">{{ ctrl.foo }}</div>',
    tests: function (deps) {
      it('created controller correctly', function () {
        var compiledHtml = deps.element.html();
        // 'foo'
      });
      it('changes value', function () {
        var ctrl = deps.element.controller();
        // { foo: 'foo' }
        ctrl.foo = 'bar';
        deps.element.scope().$apply();
        var compiledHtml = deps.element.html();
        // 'bar'
      });
    }
  });
```

[binding]: http://blog.thoughtram.io/angularjs/2015/01/02/exploring-angular-1.3-bindToController.html

### Test controller instance in custom directive

If you add methods to the controller inside custom directive, use `controllerAs` syntax to
expose the controller instance.

```js
angular.module('C', [])
  .directive('cDirective', function () {
    return {
      controllerAs: 'ctrl', // puts controller instance onto scope as ctrl
      controller: function ($scope) {
        $scope.foo = 'foo';
        this.foo = function getFoo() {
          return $scope.foo;
        };
      }
    };
  });
ngDescribe({
  name: 'controller for directive instance',
  modules: 'C',
  element: '<c-directive></c-directive>',
  tests: function (deps) {
    it('has controller', function () {
      var scope = deps.element.scope(); // grabs scope
      var controller = scope.ctrl; // grabs controller instance
      la(typeof controller.foo === 'function');
      la(controller.foo() === 'foo');
      scope.foo = 'bar';
      la(controller.foo() === 'bar');
    });
  }
});
```

### Test 2 way binding

If a directive implements isolate scope, we can configure parent scope separately.

```js
angular.module('IsolateFoo', [])
  .directive('aFoo', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        bar: '='
      },
      template: '<span>{{ bar }}</span>'
    };
  });
```

We can use `element` together with `parentScope` property to set initial values.

```js
ngDescribe({
  modules: 'IsolateFoo',
  element: '<a-foo bar="x"></a-foo>',
  parentScope: {
    x: 'initial'
  },
  tests: function (deps) {
    it('has correct initial value', function () {
      var scope = deps.element.isolateScope();
      expect(scope.bar).toEqual('initial');
    });
  }
});
```

We can change parent's values to observe propagation into the directive

```js
// same setup
it('updates isolate scope', function () {
  deps.parentScope.x = 42;
  deps.$rootScope.$apply();
  var scope = deps.element.isolateScope();
  expect(scope.bar).toEqual(42);
});
```

### Mock value provided by a module

Often during testing we need to mock something provided by a module, even if it is 
passed via dependency injection. ng-describe makes it very simple. List all modules with values 
to be mocked in `mocks` object property.

```js
// C.js
angular.module('C', ['A'])
  .service('getFoo', function (foo) {
    // foo is provided by module A
    return function getFoo() {
      return foo;
    };
  });
// C-spec.js
ngDescribe({
  name: 'test C with mocking top level',
  modules: ['C'],
  inject: ['getFoo'],
  mocks: {
    // replace C.getFoo with mock function that returns 11
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
```

### Angular services inside mocks

You can use other injected dependencies inside mocked functions, using
injected values and free parameters.

```js
ngDescribe({
  inject: ['getFoo', '$rootScope'],
  mocks: {
    C: {
      // use angular $q service in the mock function
      // argument "value" remains free
      getFoo: function ($q, value) {
        return $q.when(value);
      }
    }
  },
  tests: function (deps) {
    it('injected $q into mock', function (done) {
      deps.getFoo('foo').then(function (result) {
        expect(result).toEqual('foo');
        done();
      });
      deps.$rootScope.$apply(); // resolve promise
    });
  }
});
```

### beforeEach and afterEach

You can use multiple `beforeEach` and `afterEach` inside `tests` function.

```js
ngDescribe({
  name: 'before and after example',
  modules: ['A'],
  inject: ['foo'],
  tests: function (deps) {
    var localFoo;
    beforeEach(function () {
      // dependencies are already injected
      la(deps.foo === 'bar');
      localFoo = deps.foo;
    });
    it('has correct value foo', function () {
      la(localFoo === 'bar');
    });
    afterEach(function () {
      la(localFoo === 'bar');
      // dependencies are still available
      la(deps.foo === 'bar');
    });
  }
});
```

This could be useful for setting up additional mocks, like `$httpBackend`.

```js
angular.module('apiCaller', [])
  .service('getIt', function ($http) {
    return function () {
      return $http.get('/my/url');
    };
  });
ngDescribe({
  name: 'http mock backend example',
  modules: ['apiCaller'],
  inject: ['getIt', '$httpBackend'],
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
```

**Note** if you use `beforeEach` block with `element`, the `beforeEach` runs *before* the element
is created. This gives you a chance to setup mocks before running the element and possibly making calls.
If you really want to control when an element is created use `exposeApi` option 
(see [Secondary options](#secondary-options)).

### Spy on injected methods

One can quickly spy on injected services (or other methods) using [sinon.js](http://sinonjs.org/) 
similarly to [spying on the regular JavaScript methods](http://glebbahmutov.com/blog/spying-on-methods/).

* Include a browser-compatible combined [sinon.js build](http://sinonjs.org/releases/sinon-1.12.1.js) 
into the list of loaded Karma files.
* Setup spy in the `beforeEach` function. Since every injected service is a method on the `deps`
object, the setup is a single command.
* Restore the original method in `afterEach` function.

```js
// source code
angular.module('Tweets', [])
  .service('getTweets', function () {
    return function getTweets(username) {
      console.log('returning # of tweets for', username);
      return 42;
    };
  });
```

```js
// spec
ngDescribe({
  name: 'spying on Tweets getTweets service',
  modules: 'Tweets',
  inject: 'getTweets',
  tests: function (deps) {
    beforeEach(function () {
      sinon.spy(deps, 'getTweets');
    });
    afterEach(function () {
      deps.getTweets.restore();
    });
    it('calls getTweets service', function () {
      var n = deps.getTweets('foo');
      la(n === 42, 'resolved with correct value');
      la(deps.getTweets.called, 'getTweets was called (spied using sinon)');
      la(deps.getTweets.firstCall.calledWith('foo'));
    });
  }
});
```

### Spy on mocked service

If we mock an injected service, we can still spy on it, just like as if we were spying on the
regular service. For example, let us take the same method as above and mock it.

```js
angular.module('Tweets', [])
  .service('getTweets', function () {
    return function getTweets(username) {
      return 42;
    };
  });
```

The mock will return a different number.

```js
ngDescribe({
  name: 'spying on mock methods',
  inject: 'getTweets',
  mocks: {
    Tweets: {
      getTweets: function (username) {
        return 1000;
      }
    }
  },
  tests: function (deps) {
    beforeEach(function () {
      sinon.spy(deps, 'getTweets');
    });
    afterEach(function () {
      deps.getTweets.restore();
    });
    it('calls mocked getTweets service', function () {
      var n = deps.getTweets('bar');
      la(n === 1000, 'resolved with correct value from the mock service');
      la(deps.getTweets.called,
        'mock service getTweets was called (spied using sinon)');
      la(deps.getTweets.firstCall.calledWith('bar'),
        'mock service getTweets was called with expected argument');
    });
  }
});
```

### Configure module

If you use a separate module with namesake provider to pass configuration into the modules
(see [Inject valid constants into Angular](http://glebbahmutov.com/blog/inject-valid-constants-into-angular/)),
you can easily configure these modules.

```js
angular.module('App', ['AppConfig'])
  .service('foo', function (AppConfig) {
    return function foo() {
      return GConfig.bar;
    };
  });
// config module has provider with same name
angular.module('AppConfig', [])
  .provider('AppConfig', function () {
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
// spec file
ngDescribe({
  name: 'config module example',
  modules: 'App',
  inject: 'foo',
  configs: {
    // every config module will be loaded automatically
    AppConfig: {
      bar: 'boo!'
    }
  },
  tests: function (deps) {
    it('foo has configured bar value', function () {
      expect(deps.foo()).toEqual('boo!');
    });
  }
});
```

You can configure multiple modules at the same time. Note that during the configuration
Angular is yet to be loaded. Thus you cannot use Angular services inside the configuration blocks.

### Helpful failure messages

ng-describe works inside [helpDescribe function](https://github.com/bahmutov/lazy-ass-helpful#lazy-ass-helpful-bdd),
producing meaningful error messages on failure (if you use [lazy assertions](https://github.com/bahmutov/lazy-ass)).

```js
helpDescribe('ngDescribe inside helpful', function () {
  ngDescribe({
    name: 'example',
    tests: function () {
      it('gives helpful error message', function () {
        var foo = 2, bar = 3;
        la(foo + bar === 4); // wrong on purpose
      });
    }
  });
});
```
when this test fails, it generates meaningful message with all relevant information: the expression
that fails `foo + bar === 4` and runtime values of `foo` and `bar`.

    PhantomJS 1.9.7 (Mac OS X) 
    ட ngDescribe inside helpful 
      ட example 
        ட ✘ gives helpful error message FAILED
      Error: condition [foo + bar === 4] foo: 2 bar: 3
          at lazyAss (/ng-describe/node_modules/lazy-ass/index.js:57)
    PhantomJS 1.9.7 (Mac OS X): Executed 37 of 38 (1 FAILED) (skipped 1) (0.053 secs / 0.002 secs)


## License

Author: Kensho &copy; 2014

* [@kensho](https://twitter.com/kensho)
* [kensho.com](http://kensho.com)

Support: if you find any problems with this library,
[open issue](https://github.com/kensho/ng-describe/issues) on Github


The MIT License (MIT)

Copyright (c) 2014 Kensho

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



