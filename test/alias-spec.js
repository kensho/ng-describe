/* global ngDescribe, it */
angular.module('moduleA', []);

// aliases
// module -> modules
// test -> tests
ngDescribe({
  name: 'aliases',
  module: 'moduleA',
  only: false,
  verbose: false,
  inject: [],
  test: function (deps) {
    it('it working', function () {
      la(check.object(deps));
    });
  }
});
