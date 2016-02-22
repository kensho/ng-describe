module.exports = () => {
  const NM = '../../node_modules/';
  return {
    files: [
      {
        pattern: NM + 'angular/angular.js', instrument: false
      },
      {
        pattern: NM + 'angular-mocks/angular-mocks.js', instrument: false
      },
      {
        pattern: NM + 'dist/ng-describe.js', instrument: false
      }
    ],
    tests: [
      'simple-spec.js',
      'service-spec.js'
    ],
    debug: true
  };
};
/*
'../dist/ng-describe.js',
'../node_modules/lazy-ass-helpful/lazy-ass-helpful-browser.js',
'../node_modules/lazy-ass-helpful/lazy-ass-helpful-bdd.js',
*/
