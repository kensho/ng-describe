# API

{%= name %} provides a single function `ngDescribe` that takes an options object.

```js
ngDescribe({
  // your options
});
```

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
