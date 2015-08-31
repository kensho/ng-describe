# Examples

Some examples use Jasmine matchers, others use `la` assertion from
[lazy-ass](https://github.com/bahmutov/lazy-ass) library and *done* callback argument
from [Mocha](http://visionmedia.github.io/mocha/) testing framework.

Also, note that the dependencies object is filled **only** inside the unit test callbacks `it` and
setup helpers `beforeEach` and `afterEach`

```js
ngDescribe({
  inject: 'foo',
  tests: function (deps) {
    // deps is an empty object here
    beforeEach(function () {
      // deps object has 'foo'
    });
    // deps is an empty object here
    it(function () {
      // deps object has 'foo'
    });
    // deps is an empty object here
    afterEach(function () {
      // deps object has 'foo'
    });
  }
});
```

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

## Test a filter

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

## Test controllerAs syntax

If you use `controllerAs` syntax without any components (see [Binding to ...][binding] post or
[Separate ...][separate]), then you can still test it quickly

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
[separate]: http://glebbahmutov.com/blog/separate-model-from-view-in-angular/

## Test controller instance in custom directive

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

**Note** if you use `beforeEach` block with `element`, the `beforeEach` runs *before* the element
is created. This gives you a chance to setup mocks before running the element and possibly making calls.
If you really want to control when an element is created use `exposeApi` option 
(see [Secondary options](#secondary-options)).

## Mocking

### Mock value provided by a module

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

Remember when making mocks, it is always `module name : provider name : mocked property name`

```js
mocks: {
  'module name': {
    'mocked provider name': {
      'mocked value name'
    }
  }
}
```

Note: the mocked values are injected using `$provider.constant` call to be able to override both
values and constants

```js
angular.module('A10', [])
  .constant('foo', 'bar');
ngDescribe({
  modules: 'A10',
  mock: {
    A10: {
      foo: 42
    }
  },
  inject: 'foo',
  tests: function (deps) {
    it('has correct constant foo', function () {
      expect(deps.foo).toEqual(42);
    });
  }
});
```

You can even mock part of the module itself and use mock value in other parts via injection

```js
angular.module('LargeModule', [])
  .constant('foo', 'foo')
  .service('getFoo', function (foo) {
    return function getFoo() {
      return foo;
    };
  });
ngDescribe({
  name: 'mocking part of the module itself',
  modules: 'LargeModule',
  inject: 'getFoo',
  mock: {
    LargeModule: {
      foo: 'bar'
    }
  },
  tests: function (deps) {
    it('service injects mock value', function () {
      la(deps.getFoo() === 'bar', 'returns mock value');
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

### Mock $http.get

Often we need some dummy response from `$http.get` method. We can use mock `httpBackend` 
or mock the `$http` object. For example to always return mock value when making any GET request,
we can use

```js
mocks: {
  ng: {
    $http: {
      get: function ($q, url) {
        // inspect url if needed
        return $q.when({
          data: {
            life: 42
          }
        });
      }
    }
  }
}
```

`$http` service returns a promise that resolves with a *response* object. The actual result to send
is placed into the `data` property, as I show here.

### Mock http responses

You can use a shortcut to define mock HTTP responses via `$httpBackend` module. For example,
you can define static responses.

```js
ngDescribe({
  http: {
    get: {
      '/some/url': 42,
      '/some/other/url': [500, 'something went wrong']
    },
    post: {
      // you can use custom functions too
      '/some/post/url': function (method, url, data, headers) {
        return [200, 'ok'];
      }
    }
  }
});
```
All HTTP methods are supported (`get`, `post`, `delete`, `put`, etc.).

You can also get a function that would return a config object.

```js
var mockGetApi = {
  '/some/url': 42
};
mockGetApi['/some/other/url'] = [500, 'not ok'];
ngDescribe({
  http: {
    get: mockGetApi
  }
});
```

You can use `deps.http.flush()` to move the http responses along.

You can return the entire http mock object from a function, or combine objects with functions.

```js
function constructMockApi() {
  return {
    get: function () {
      return { '/my/url': 42 };
    },
    post: {
      '/my/other/url': [200, 'nice']
    }
  };
}
ngDescribe({
  http: constructMockApi,
  test: function (deps) {
    ...
  } 
});
```

You can use exact query arguments too

```js
http: {
  get: {
    '/foo/bar?search=value': 42,
    '/foo/bar?search=value&something=else': 'foo'
  }
}
// $http.get('/foo/bar?search=value') will resolve with value 42
// $http.get('/foo/bar?search=value&something=else') will resolve with value 'foo'
```

or you can build the query string automatically by passing `params` property in the request config
objet

```js
http: {
  get: {
    '/foo/bar?search=value&something=else': 'foo'
  }
}
// inside the unit test
var config = {
  params: {
    search: 'value',
    something: 'else'
  }
};
$http.get('/foo/bar', config).then(function (response) {
  // response.data = 'foo'
});
```

**note** the `http` mocks are defined using `$httpBack.when(method, ...)` calls, 
which are looser than `$httpBackend.expect(method, ...)`, 
see [ngMock/$httpBackend](https://docs.angularjs.org/api/ngMock/service/$httpBackend).

## Spying

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

### Spy on injected function

You can inject a function, but use a [Sinon spy](http://sinonjs.org/docs/#spies) instead
of the injected function to get additional information. For example, to spy on the `$filter uppercase`,
we can use the following code.

```js
ngDescribe({
  name: 'spying on a filter',
  inject: '$filter',
  tests: function (deps) {
    /*
      to spy on a injected filter, need to grab the actual filter function
      and then create a spy
    */
    // _uppercase = angular uppercase $filter
    // uppercase = spy on the _uppercase
    var _uppercase, uppercase;
    beforeEach(function () {
      _uppercase = deps.$filter('uppercase');
      uppercase = sinon.spy(_uppercase);
    });
    it('converts string to uppercase', function () {
      var result = uppercase('foo');
      la(result === 'FOO', 'converted string to uppercase', result);
      la(uppercase.calledOnce, 'uppercase was called once');
      la(uppercase.calledWith('foo'));
    });
  }
});
```

### Spy on 3rd party service injected some place else

Let us say you need to verify that the `$interval` service injected in the module under test
was called. It is a little verbose to verify from the unit test. We must mock the `$interval`
with our function and then call the actual `$interval` from the module `ng` to provide the
same functionality.

Source code we are trying to unit test

```js
angular.module('IntervalExample', [])
  .service('numbers', function ($interval, $rootScope) {
    return function emitNumbers(delay, n) {
      var k = 0;
      $interval(function () {
        $rootScope.$emit('number', k);
        k += 1;
      }, 100, n);
    };
  });
```

In the unit test we will mock `$interval` service for module `IntervalExample`

```js
// unit test start
var intervalCalled;
ngDescribe({
  name: 'spying on $interval',
  module: 'IntervalExample',
  inject: ['numbers', '$rootScope'],
  verbose: false,
  only: false,
  mocks: {
    IntervalExample: {
      $interval: function mockInterval(fn, delay, n) {
        var injector = angular.injector(['ng']);
        var $interval = injector.get('$interval');
        intervalCalled = true;
        return $interval(fn, delay, n);
      }
    }
  },
  tests: function (deps) {
    // unit test goes here
  }
});
```

A unit test just calls the `numbers` function and then checks the variable `intervalCalled`

```js
it('emits 3 numbers', function (done) {
  deps.$rootScope.$on('number', function (event, k) {
    if (k === 2) {
      done();
    }
  });
  // emit 3 numbers with 100ms interval
  deps.numbers(100, 3);
  la(intervalCalled, 'the $interval was called somewhere');
});
```

You can see the unit test in file [test/spying-on-interval-spec.js](test/spying-on-interval-spec.js).

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

## Configure module

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
