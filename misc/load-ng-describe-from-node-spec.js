var benv = require('benv');
describe('calc module', function () {
  beforeEach(function setupEnvironment(done) {
    benv.setup(function () {
      benv.expose({
        angular: benv.require('../node_modules/angular/angular.js', 'angular'),
        ngDescribe: benv.require('../dist/ng-describe.js', 'ngDescribe')
      });
      done();
    });
  });

  it('dummy test', function () {});

  afterEach(function destroySyntheticBrowser() {
    benv.teardown(true);
  });
});
