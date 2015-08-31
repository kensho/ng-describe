angular.module('websockets test', [])
  // WebSocket function does not exist, has to be mocked!
  .value('WebSocket', WebSocket)
  .value('MockWebSocket', (function () {
    function MockWebSocket(url) {
      this._url = url;
    }

    return MockWebSocket;
  })())
  .factory('ComponentUsingMockWebSocket', [
    'MockWebSocket',
    function (MockWebSocket) {
      // just to prove it's injectable
      function ComponentUsingMockWebSocket(url) {
        this._socket = new MockWebSocket(url);
      }

      ComponentUsingMockWebSocket.prototype.getSocket = function () {
        return this._socket;
      };

      return ComponentUsingMockWebSocket;
    }
  ])
  .factory('ComponentUsingWebSocket', ['WebSocket',
    function (WebSocket) {
      function ComponentUsingWebSocket(url) {
        this._socket = new WebSocket(url);
      }

      ComponentUsingWebSocket.prototype.getSocket = function () {
        return this._socket;
      };

      return ComponentUsingWebSocket;

    }
  ]);

/* global ngDescribe, it */
ngDescribe({
  name: 'mock constructor function - using mock class',
  module: 'websockets test',
  inject: 'ComponentUsingMockWebSocket',
  only: false,
  tests: function (deps) {
    it('creates mock value', function () {
      var url = 'ws://mock';
      var mc = new deps.ComponentUsingMockWebSocket(url);
      la(mc.getSocket()._url === url);
    });
  }
});

ngDescribe({
  name: 'mock constructor function on the fly',
  module: 'websockets test',
  inject: 'ComponentUsingWebSocket',
  mocks: {
    'websockets test': {
      WebSocket: function (MockWebSocket, url) {
        // inject mock web socket implementation
        // the use it ourselves to create new instance
        la(check.fn(MockWebSocket));
        return new MockWebSocket(url);
      }
    }
  },
  only: false,
  tests: function (deps) {
    it('creates mock value', function () {
      var url = 'ws://mock';
      var mc = new deps.ComponentUsingWebSocket(url);
      var socket = mc.getSocket();
      la(check.object(socket), 'socket is an object', socket);
      la(socket._url === url, 'socket', socket, 'has expected url', url);
    });
  }
});
