/* global ngDescribe, it */
ngDescribe({
  name: 'built-in filter',
  inject: ['$filter'],
  tests: function (deps) {
    it('can convert to lowercase', function () {
      var lowercase = deps.$filter('lowercase');
      la(lowercase('Foo') === 'foo');
    });
  }
});
