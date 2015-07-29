/* global ngDescribe, it */
ngDescribe({
  name: 'built-in filter',
  inject: '$filter',
  tests: function (deps) {
    it('converts string to lowercase', function () {
      var lowercase = deps.$filter('lowercase');
      la(lowercase('Foo') === 'foo');
    });

    it('passes numbers unchanged', function () {
      var lowercase = deps.$filter('lowercase');
      la(lowercase(42) === 42);
    });
  }
});
