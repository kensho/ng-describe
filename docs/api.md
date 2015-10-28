# API

{%= name %} provides a single function `ngDescribe` that takes an options object.

```js
ngDescribe({
  // your options
});
```

You do not have to specify every option, there are reasonable defaults. We also tried to make
the API [user-friendly](http://glebbahmutov.com/blog/user-friendly-api/).

`ngDescribe` returns itself, so you can chain multiple sets of specs easily

```js
ngDescribe({
  name: 'first suite'
  ...
})({
  name: 'second suite'
  ...
});
```

## Primary options

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

If you have a single module to inject, you can just use a string name without Array notation

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

**tests** - callback function that contains actual specs. Think of this as equivalent to `describe` with
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

**Dependencies injection shortcut**

You can list the dependencies to be injected directly in the test callback.

```js
angular.module('shortcut', [])
  .constant('foo', 'bar');
ngDescribe({
  module: 'shortcut',
  tests: function (foo) {
    it('has constant', function () {
      console.assert(foo === 'bar');
    });
  }
});
```

You can inject multiple providers, including built-in services. If the test callback argument
is named `deps` or `dependencies` it will be assumed that you do NOT use the shortcut.

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

**controllers** - list of controllers by name that should be injected. Each controller
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

The compiled `angular.element` will be injected into the dependencies object under `element` property.
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
[Inject valid constants into Angular](http://glebbahmutov.com/blog/inject-valid-constants-into-angular/)
blog post and examples below.

## Secondary options

**verbose** - flag to print debug messages during execution

**only** - flag to run this set of tests and skip the rest. Equivalent to 
[ddescribe or describe.only](http://glebbahmutov.com/blog/focus-on-karma-test/).

```js
ngDescribe({
  name: 'run this module only',
  only: true
});
```

**skip** - flag to skip this group of specs. Equivalent to `xdescribe` or `describe.skip`.
Could be a string message explaining the reason for skipping the spec.

**exposeApi** - expose low-level ngDescribe methods

The `tests` callback will get the second argument, which is an object with the following methods

    {
      setupElement: function (elementHtml),
      setupControllers: function (controllerNames)
    }

You can use `setupElement` to control when to create the element.
For example, instead of creating element right away, expose element factory so that you can create
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

See the spec in [test/expose-spec.js](test/expose-spec.js)

Or you can use `setupControllers` to create controller objects AFTER setting up your spies.

```js
angular.module('BroadcastController', [])
  .controller('broadcastController', function broadcastController($rootScope) {
    $rootScope.$broadcast('foo');
  });
```

We need to listen for the `foo` broadcast inside a unit test before creating the controller.
If we let `ngDescribe` create the "broadcastController" it will be too late. Instead we
can tell the `ngDescribe` to expose the low-level api and then we create the controllers when
we are ready

```js
ngDescribe({
  name: 'spy on controller init',
  modules: 'BroadcastController',
  inject: '$rootScope',
  exposeApi: true,
  tests: function (deps, describeApi) {
    it('can catch the broadcast in controller init', function (done) {
      var heardFoo;
      deps.$rootScope.$on('foo', function () {
        heardFoo = true;
        done();
      });
      describeApi.setupControllers('broadcastController');
    });
  }
});
```

See the spec in [test/controller-init-spec.js](test/controller-init-spec.js)

**http** - shortcut for specifying mock HTTP responses, 
built on top of [$httpBackend](https://docs.angularjs.org/api/ngMock/service/$httpBackend).
Each GET request will be mapped to `$httpBackend.whenGET` for example. You can provide
data, response code + data pair or custom function to return something using custom logic.
If you use `http` property, then the injected dependencies will have `http` object that
you can flush (it is really `$httpBackend` object).

```js
ngDescribe({
  inject: '$http', // for making test calls
  http: {
    get: {
      '/my/url': 42, // status 200, data 42
      '/my/other/url': [202, 42], // status 202, data 42,
      '/my/smart/url': function (method, url, data, headers) {
        return [500, 'something is wrong'];
      } // status 500, data "something is wrong"
    }, 
    post: {
      // same format as GET
    }
  },
  tests: function (deps) {
    it('responds', function (done) {
      deps.$http.get('/my/other/url')
        .then(function (response) {
          // expect
          // response.status = 202
          // response.data = 42
          done();
        });
      deps.http.flush();
    });
  }
});
```
All standard methods should be supported (`get`, `head`, `post`, `put`, `delete`, `jsonp` and `patch`).

Each of the methods can return a function that returns an configuration object, see [mock http](#mock-http).

**step** - shortcut for running the digest cycle and mock http flush

```js
tests: function (deps) {
  it('runs the digest cycle', function (done) {
    $q.when(42).finally(done);
    deps.step();
    // same as deps.$rootScope.$digest();
  });
}
```

Also flushes the mock http backend

```js
http: {}
tests: function (deps) {
  it('returns expected result', function (done) {
    deps.$http.get(...)
      .then(...)
      .finally(done);
    deps.step();
    // same as deps.http.flush();
  });
}
```
