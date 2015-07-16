/* global ngDescribe, it */
ngDescribe({
  inject: ['$q', '$rootScope'],
  tests: function (deps) {
    it('injects $q', function () {
      la(typeof deps.$q !== 'undefined', '$q is', typeof deps.$q);
    });

    it('can be resolved', function (done) {
      deps.$q.when(42).then(function (value) {
        la(value === 42);
        done();
      });
      // move promises along
      deps.$rootScope.$digest();
    });

    it('has a digest cycle shortcut method', function (done) {
      deps.$q.when(42).then(function (value) {
        la(value === 42);
        done();
      });
      la(check.fn(deps.step), 'has step method', deps);
      deps.step();
    });
  }
});
