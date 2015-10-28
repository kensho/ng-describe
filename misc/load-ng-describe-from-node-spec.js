describe('json parse', function () {
  it('fails to stringify undefined', function () {
    var a;
    var result = JSON.stringify(a);
    console.assert(typeof result === 'undefined', 'returns undefined');
  });
});

describe('load ngDescribe in synthetic browser', function () {

  var benv = require('benv'), ngDescribeFn, check;

  beforeEach(function setupEnvironment(done) {
    benv.setup(function () {
      console.assert(typeof window === 'object', 'has window');

      check = require('check-more-types');

      benv.expose({
        angular: benv.require('../node_modules/angular/angular.js', 'angular')
      });
      done();
    });
  });

  beforeEach(function loadLa() {
    require('lazy-ass');
  });

  beforeEach(function loadNgDescribe() {
    check = require('check-more-types');
    console.assert(typeof check.fn === 'function', 'has check.or');
    require('../src/ng-describe');
    ngDescribeFn = window.ngDescribe;
  });

  it('dummy test', function () {});

  it('dummy test 2', function () {});

  it('has window', function () {
    console.assert(typeof window === 'object');
  })

  it.skip('has ngDescribe', function () {
    console.assert(typeof ngDescribeFn === 'function',
      'has ngDescribe function');
  });

  afterEach(function destroySyntheticBrowser() {
    benv.teardown(true);
  });
});
