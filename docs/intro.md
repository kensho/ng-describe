# Intro

Unit testing and mocking AngularJs requires a lot of boilerplate code:
```js
describe('typical test', function () {
    var foo;
    beforeEach(function () {
        angular.mock.module('A');
        // other modules
    });
    beforeEach(inject(function (_foo_) {
        foo = _foo_;
    }));
    it('finally a test', function () {
        expect(foo).toEqual('bar');
    });
});
```

{%= name %} makes testing simple modules a breeze. 
Just list which modules you would like to load, which values / services / etc.
you would like to inject and then start testing. Same test as above using {%= name %}
is much shorter and clearer:
```js
ngDescribe({
    modules: 'A',
    tests: function (foo) {
        it('finally a test', function () {
            expect(foo).toEqual('bar');
        });
    });
});
```
{%= name %} can inject dependencies, mock modules, set configs, create controllers, scopes, and
even html fragments. For more details, continue reading. We also showed this library at AngularJS NYC
meetup, the slides are at [slides.com/bahmutov/ng-describe](http://slides.com/bahmutov/ng-describe).
