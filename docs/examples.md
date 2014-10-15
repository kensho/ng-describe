# Examples

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

This could be useful for setting up additional mocks, like `$httpBackend` (this example uses `la` assertion from
[lazy-ass](https://github.com/bahmutov/lazy-ass) library).

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
