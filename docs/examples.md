# Examples

Some examples use Jasmine matchers, others use `la` assertion from
[lazy-ass](https://github.com/bahmutov/lazy-ass) library and *done* callback argument
from [Mocha](http://visionmedia.github.io/mocha/) testing framework.

## Test value provided by a module

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

## Test a service

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

## Test controller and scope

We can easily create instances of controller functions and scope objects.
In this example we also inject `$timeout` service to speed up delayed actions
(see [Testing Angular async stuff](http://bahmutov.calepin.co/testing-angular-async-stuff.html)).

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

## Test directive

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

## Test 2 way binding

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

## Mock value provided by a module

Often during testing we need to mock something provided by a module, even if it is 
passed via dependency injection. {%= name %} makes it very simple. List all modules with values 
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

## beforeEach and afterEach

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

## Configure module

If you use a separate module with namesake provider to pass configuration into the modules
(see [Inject valid constants into Angular](http://bahmutov.calepin.co/inject-valid-constants-into-angular.html)),
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

## Helpful failure messages

{%= name %} works inside [helpDescribe function](https://github.com/bahmutov/lazy-ass-helpful#lazy-ass-helpful-bdd),
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
