if (typeof la === 'undefined') {
  require('lazy-ass');
}
if (typeof check === 'undefined') {
  check = require('check-more-types');
}

describe('function args', function () {
  var regex = /^function \((deps|dependencies)\)/;

  describe('anonymous functions', function () {

    var f1 = function (deps) {
      return 42;
    };

    var f2 = function (dependencies) {
      return 42;
    };

    var f3 = function ($deps) {
      return 42;
    };

    var f4 = function (something, nothing) {
      return 42;
    };

    it('detects single argument "deps"', function () {
      var code = f1.toString();
      la(check.string(code), 'has code');
      la(regex.test(code), 'detects deps argument');
    });

    it('detects single argument "dependencies"', function () {
      var code = f2.toString();
      la(check.string(code), 'has code');
      la(regex.test(code), 'detects dependencies argument');
    });

    it('ignores $deps', function () {
      var code = f3.toString();
      la(!regex.test(code), 'ignores $deps');
    });

    it('ignores other names', function () {
      var code = f4.toString();
      la(!regex.test(code), 'ignores other names');
    });
  });
});
