/* global ngDescribe, it */
ngDescribe({
  name: 'before and after example',
  helpful: true,
  tests: function (deps) {
    it('injects empty object', function () {
      la(check.empty(deps));
    });
  }
});
