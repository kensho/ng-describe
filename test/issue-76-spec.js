/* global describe, ngDescribe, it */
describe('issue 76 - deps.step and $timeout', function () {
  ngDescribe({
    name: 'step $timeout',
    inject: '$timeout',
    only: false,
    tests: function (deps) {
      it('advances $timeout using flush', function (done) {
        deps.$timeout(done, 10000);
        deps.$timeout.flush();
      });

      it('can flush the timeout using step()', function (done) {
        deps.$timeout(done, 10000);
        deps.step();
      });
    }
  });

  ngDescribe({
    name: 'step $timeout shortcut',
    tests: function ($timeout) {
      it('advances $timeout using flush', function (done) {
        $timeout(done, 10000);
        $timeout.flush();
      });
    }
  });
});
