/* global ngDescribe, it */
ngDescribe({
  name: 'mocking http with query params',
  only: false,
  verbose: false,
  inject: '$http',
  http: {
    get: {
      '/my/url': 42,
      '/my/url?query=foo': 'foo',
      '/my/url?query=foo&another=bar': 'bar',
      '/my/url?query=foo&verbose=true': function () {
        return [200, 'foo'];
      },
      '/assume/sucess/status': function () {
        return 'foo';
      }
    }
  },
  tests: function (deps) {
    function assertData(data, response) {
      la(response && response.status === 200, 'expected success response', response);
      la(response.data === data, 'expected data', data, 'got', response.data);
    }

    it('assumes success when returning a non-status response', function (done) {
      deps.$http.get('/assume/sucess/status')
        .then(assertData.bind(null, 'foo'))
        .then(done);
      deps.http.flush();
    });

    it('returns 42', function (done) {
      deps.$http.get('/my/url')
        .then(assertData.bind(null, 42))
        .then(done);
      deps.http.flush();
    });

    it('returns query foo', function (done) {
      deps.$http.get('/my/url?query=foo')
        .then(assertData.bind(null, 'foo'))
        .then(done);
      deps.http.flush();
    });

    it('returns query foo and bar', function (done) {
      deps.$http.get('/my/url?query=foo&another=bar')
        .then(assertData.bind(null, 'bar'))
        .then(done);
      deps.http.flush();
    });

    it('works with low-level method', function (done) {
      deps.$http({
        method: 'GET',
        url: '/my/url'
      }).then(assertData.bind(null, 42))
        .then(done);
      deps.http.flush();
    });

    it('works with low-level method and serializes query params', function (done) {
      deps.$http({
        method: 'GET',
        url: '/my/url',
        params: {
          query: 'foo'
        }
      }).then(assertData.bind(null, 'foo'))
        .then(done);
      deps.http.flush();
    });

    it('serializes query params', function (done) {
      deps.$http({
        method: 'GET',
        url: '/my/url',
        params: {
          query: 'foo',
          verbose: true
        }
      }).then(assertData.bind(null, 'foo'))
        .then(done);
      deps.http.flush();
    });

    it('serializes query params using GET shortcut', function (done) {
      var config = {
        params: {
          query: 'foo',
          verbose: true
        }
      };
      deps.$http.get('/my/url', config)
        .then(assertData.bind(null, 'foo'))
        .then(done);
      deps.http.flush();
    });
  }
});
