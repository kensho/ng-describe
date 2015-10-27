/* global ngDescribe, it */
ngDescribe({
  name: 'dependency inject shortcut',
  only: false,
  skip: true,
  // note that tests callback lists injected values
  tests: function ($filter) {
    it('has lowercase filter', function () {
      var lowercase = $filter('lowercase');
      la(typeof lowercase === 'function', 'it is a function');
    });
  }
});
