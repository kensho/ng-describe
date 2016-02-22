/* global describe, it, afterEach, after, afterAll */
var suite = describe;
// Mocha vs Jasmine
var afterTests = typeof afterAll === 'function' ? afterAll : after;

suite('after each callbacks', function () {
  // just a dummy unit test to figure out how afterEach callbacks run
  var labels = '';
  it('passes', function () {
    labels += 'test';
  });

  afterEach(function one() {
    console.log('one');
    labels += '1';
  });

  afterEach(function one() {
    console.log('two');
    labels += '2';
  });

  afterEach(function one() {
    console.log('three');
    labels += '3';
  });

  // does NOT run in Jasmine?
  afterTests(function checkOrder() {
    la(labels === 'test123', 'invalid order', labels);
    console.log('labels', labels);
    // throw new Error('labels ' + labels);
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
