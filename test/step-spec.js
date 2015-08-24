/* global ngDescribe, it */
ngDescribe({
  inject: ['$q'],
  tests: function (deps) {
    it('has a step method when rootscope not injected', function () {
      la(check.fn(deps.step), 'has step method', deps);
    });
    it('step method triggers digest when rootscope not injected', function (done) {
      deps.$q.when(42).then(function (value) {
        la(value === 42);
        done();
      });
      deps.step();
    });
  }
});
