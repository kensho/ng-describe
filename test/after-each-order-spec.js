/* global describe, it, afterEach */
describe('after each callbacks', function () {
  // just a dummy unit test to figure out how afterEach callbacks run
  it('passes', function () {});

  afterEach(function one() {
    console.log('one');
  });

  afterEach(function one() {
    console.log('two');
  });

  afterEach(function one() {
    console.log('three');
  });
  /*
    result

    Jasmine:
      'three'
      'two'
      'one'

    Mocha:
      'one'
      'two'
      'three'
  */
});
