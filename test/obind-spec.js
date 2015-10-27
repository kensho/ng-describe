angular.module('identity', [])
  .value('I', function (x) {
    return x;
  });

/* global ngDescribe, it */
// test same value multiple times by chaining calls
ngDescribe({
  name: 'test identity',
  module: 'identity',
  inject: 'I',
  tests: function (deps) {
    it('returns passed value', function () {
      la(deps.I('foo') === 'foo');
      console.log('test 1');
    });
  }
})({
  name: 'test identity 2',
  module: 'identity',
  inject: 'I',
  tests: function (deps) {
    it('returns passed value', function () {
      la(deps.I('bar') === 'bar');
      console.log('test 2');
    });
  }
})({
  name: 'test identity 3',
  module: 'identity',
  inject: 'I',
  tests: function (deps) {
    it('returns passed value', function () {
      la(deps.I(42) === 42);
      console.log('test 3');
    });
  }
});

// remove duplicate boilerplate using 'obind'
/* global obind */
var describeIdentity = obind(ngDescribe, {
  name: 'test identity 3',
  module: 'identity',
  inject: 'I'
});
// same tests
describeIdentity({
  tests: function (deps) {
    it('returns passed value', function () {
      la(deps.I('foo') === 'foo');
      console.log('test 1');
    });
  }
});
describeIdentity({
  tests: function (deps) {
    it('returns passed value', function () {
      la(deps.I('bar') === 'bar');
      console.log('test 2');
    });
  }
});
describeIdentity({
  tests: function (deps) {
    it('returns passed value', function () {
      la(deps.I(42) === 42);
      console.log('test 3');
    });
  }
});
