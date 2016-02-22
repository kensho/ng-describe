describe('a suite', function () {
  it('has a single test', function () {
    la(true, 'everything is fine')
  });

  function notCovered() {
    console.log('this is a function that is never called');
  }
});
