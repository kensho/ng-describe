/* global ngDescribe, it, beforeEach */
ngDescribe({
  name: 'Exposing setupElement',
  modules: 'MyFoo',
  only: false,
  exposeApi: true,
  tests: function (deps, descApi) {
    var elementHtml = '<my-foo></my-foo>';
    beforeEach(function () {
      la(!check.has(deps, 'element'), 'has no compiled element in before each yet');
    });
    beforeEach(function () {
      descApi.setupElement(elementHtml);
    });
    beforeEach(function () {
      la(check.has(deps, 'element'), 'has compiled element after previous beforeEach');
    });

    it('creates myFoo element', function () {
      la(check.has(deps, 'element'), 'has compiled element');
    });
  }
});
