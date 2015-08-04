angular.module('SpyOnMock', [])
  .value('crashes', function crashes() {
    throw new Error('SpyOnMock.crashes!');
  });

/* global ngDescribe, beforeEach, afterEach, it, sinon */
ngDescribe({
  name: 'spying on mock methods',
  module: 'SpyOnMock',
  inject: 'crashes',
  only: false,
  mocks: {
    SpyOnMock: {
      crashes: function noCrash() {
        return 'foo';
      }
    }
  },
  tests: function (deps) {
    beforeEach(function () {
      sinon.spy(deps, 'crashes');
    });

    afterEach(function () {
      deps.crashes.restore();
    });

    it('calls SpyOnMock.crashes instead of true function', function () {
      la(deps.crashes() === 'foo', 'returns mock value');
      la(deps.crashes.called,
        'SpyOnMock.crashes was called instead of true value');
    });
  }
});

