# API

{%= name %} provides a single function `ngDescribe` that takes an options object.

```js
ngDescribe({
  // your options
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
