/* global describe, ngDescribe, it, beforeEach, afterEach */
describe('issue 90 - plain BDD', function () {
  describe('1', function () {
    it('works', function () {
      console.log('1.1');
    });
    it('works', function () {
      console.log('1.2');
    });
  });

  describe('2', function () {
    afterEach(function () {
      console.log('After');
    });
    beforeEach(function () {
      console.log('Before');
    });
    it('works', function () {
      console.log('2.1');
    });
    it('works', function () {
      console.log('2.2');
    });
  });

  describe('3', function () {
    it('works', function () {
      console.log('3.1');
    });
    it('works', function () {
      console.log('3.2');
    });
  });
});

describe('issue 90 - inside ngDescribe', function () {
  ngDescribe({
    name: 'issue 90',
    tests: function () {
      describe('1', function () {
        it('works', function () {
          console.log('1.1');
        });
        it('works', function () {
          console.log('1.2');
        });
      });

      describe('2', function () {
        afterEach(function () {
          console.log('After');
        });
        beforeEach(function () {
          console.log('Before');
        });
        it('works', function () {
          console.log('2.1');
        });
        it('works', function () {
          console.log('2.2');
        });
      });

      describe('3', function () {
        it('works', function () {
          console.log('3.1');
        });
        it('works', function () {
          console.log('3.2');
        });
      });
    }
  });
});
