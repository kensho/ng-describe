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

You if have a single module to inject, you can just use a string name without Array notation

```js
ngDescribe({
  name: 'single module',
  modules: 'A'
});
```

**verbose** - flag to print debug messages during execution

**only** - run this set of tests and skip the rest. Equivalent to 
[ddescribe or describe.only](http://bahmutov.calepin.co/focus-on-specific-jasmine-suite-in-karma.html).
