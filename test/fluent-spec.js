/* global ngDescribe, it */
ngDescribe({
  name: 'fluent spec 1',
  tests: function (deps) {
    it('has test 1', function () {
      la(check.object(deps));
    });
  }
})({
  name: 'fluent spec 2',
  tests: function (deps) {
    it('has test 2', function () {
      la(check.object(deps));
    });
  }
});
