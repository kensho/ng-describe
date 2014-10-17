/* global helpDescribe, ngDescribe, it */
helpDescribe('ngDescribe inside helpful', function () {
  ngDescribe({
    name: 'example',
    tests: function () {
      it('gives helpful error message', function () {
        var foo = 2, bar = 3;
        la(foo + bar === 5); // change expected value to see error
      });
    }
  });
});

