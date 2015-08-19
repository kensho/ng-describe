/* global describe, it, afterEach */
function singleAfterDescribe(name, cb) {
  // overwrite "it" callback to run both the original
  // unit test AND our own "after-each" function
  // to get over the difference in the execution order
  // between mocha and jasmine of "afterEach" functions

  function cleanup() {
    // this should execute AFTER each "afterEach" function
    // inside singleAfterDescribe block
    console.log('cleanup');
  }

  function tests() {
    var afters = [];
    var _afterEach = window.afterEach;

    window.afterEach = function saveAfterEach(cb) {
      afters.push(cb);
    };

    cb();
    window.afterEach(cleanup);

    window.afterEach = _afterEach;

    afterEach(function singleAfterEachInOrder() {
      afters.forEach(function (fn) {
        fn();
      });
    });
  }

  describe(name, tests);
}

singleAfterDescribe('overwrite it', function cb() {
  console.log('in cb');

  it('is a test', function () {
    console.log('inside a unit test');
  });

  afterEach(function afterEach1() {
    console.log('afterEach1');
  });

  afterEach(function afterEach2() {
    console.log('afterEach2');
  });

  console.log('before cb');
});
