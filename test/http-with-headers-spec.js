/* global ngDescribe, it */
ngDescribe({
  name: 'mocking http with headers',
  only: false,
  verbose: false,
  inject: '$http',
  http: {
    post: {
      '/my/url': [201, {message: 'ok'}, {Location: '/new/url'}, 'this is the new response']
    }
  },
  tests: function (deps) {
    it('should append right headers to result', function (done) {
      deps.$http.post('/my/url', {})
        .then(function (data) {
          la(data.headers('Location') === '/new/url');
        })
        .then(done);
      deps.http.flush();
    });
    it('should append right statusText to result', function (done) {
      deps.$http.post('/my/url', {})
        .then(function (data) {
          la(data.statusText === 'this is the new response');
        })
        .then(done);
      deps.http.flush();
    });
  }
});
