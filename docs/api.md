# API

{%= name %} provides a single function `ngDescribe` that takes an options object.

```js
ngDescribe({
  // your options
});
```

You do not have to specify every option, there are reasonable defaults.

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

## Secondary options

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
