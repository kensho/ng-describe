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
      '/my/url?query=foo&another=bar': 'bar'
    }
  },
  tests: function (deps) {
    it('returns 42', function (done) {
      deps.$http.get('/my/url').then(function (response) {
        la(response && response.status === 200, 'expected success response', response);
        la(response.data === 42, 'expected data', response.data);
        done();
      });
      deps.http.flush();
    });

    it('returns query foo', function (done) {
      deps.$http.get('/my/url?query=foo').then(function (response) {
        la(response && response.status === 200, 'expected success response', response);
        la(response.data === 'foo', 'expected foo, got', response.data);
        done();
      });
      deps.http.flush();
    });

    it('returns query foo and bar', function (done) {
      deps.$http.get('/my/url?query=foo&another=bar').then(function (response) {
        la(response && response.status === 200, 'expected success response', response);
        la(response.data === 'bar', 'expected bar, got', response.data);
        done();
      });
      deps.http.flush();
    });
  }
});
