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
