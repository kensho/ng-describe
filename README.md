# ng-describe v0.1.3

> Convenient BDD specs for Angular

[![NPM][ng-describe-icon] ][ng-describe-url]

[![Build status][ng-describe-ci-image] ][ng-describe-ci-url]
[![Coverage Status][ng-describe-coverage-image] ][ng-describe-coverage-url]
[![Codacy Badge][ng-describe-codacy-image] ][ng-describe-codacy-url]
[![Code Climate][ng-describe-code-climate-image] ][ng-describe-code-climate-url]
[![dependencies][ng-describe-dependencies-image] ][ng-describe-dependencies-url]
[![devdependencies][ng-describe-devdependencies-image] ][ng-describe-devdependencies-url]

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
[ng-describe-code-climate-image]: https://codeclimate.com/github/kensho/ng-describe/badges/gpa.svg
[ng-describe-code-climate-url]: https://codeclimate.com/github/kensho/ng-describe



Unit testing and mocking AngularJs requires a lot of boilerplate code. ng-describe makes testing
simple modules a breeze. Just list which modules you would like to load, which values / services / etc.
you would like to inject and then start testing.

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


## Examples

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


### Small print

Author: Kensho &copy; 2014

* [@kensho](https://twitter.com/kensho)
* [kensho.com](http://kensho.com)

Support: if you find any problems with this library,
[open issue](https://github.com/kensho/ng-describe/issues) on Github



## MIT License

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



