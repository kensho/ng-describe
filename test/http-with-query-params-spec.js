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
        console.log('verbose query');
        return [200, 'foo'];
      }
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

    it('works with low-level method', function (done) {
      deps.$http({
        method: 'GET',
        url: '/my/url'
      }).then(function (response) {
        la(response.data === 42, 'expected 42, got', response);
        done();
      });
      deps.http.flush();
    });

    it('works with low-level method and serializes query params', function (done) {
      deps.$http({
        method: 'GET',
        url: '/my/url',
        params: {
          query: 'foo'
        }
      }).then(function (response) {
        la(response.data === 'foo', 'expected foo, got', response);
        done();
      });
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
      }).then(function (response) {
        la(response.data === 'foo', 'expected foo, got', response);
        done();
      });
      deps.http.flush();
    });

    it('serializes query params using GET shortcut', function (done) {
      var config = {
        params: {
          query: 'foo',
          verbose: true
        }
      };
      deps.$http.get('/my/url', config).then(function (response) {
        la(response.data === 'foo', 'expected foo, got', response);
        done();
      });
      deps.http.flush();
    });
  }
});
