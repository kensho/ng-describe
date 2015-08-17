/* global helpDescribe, ngDescribe, it */
helpDescribe('ngDescribe inside helpful', function () {
  ngDescribe({
    name: 'example',
    tests: function () {
      'use strict';

      it('gives helpful error message', function () {
        var foo = 2;
        var bar = 3;
        la(foo + bar === 5); // change expected value to see error
      });
    }
  });
});

