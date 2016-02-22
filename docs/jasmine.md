# Note to Jasmine users

We got very tired of fighting bugs in the [Jasmine](http://jasmine.github.io/) test framework.
From the broken order of `afterEach` callbacks to the `afterAll` not firing at all - the work arounds
we had to write quickly becamse insane. Thus we 
[recommend Mocha](https://glebbahmutov.com/blog/picking-javascript-testing-framework/) testing
framework - fast, simple and seems to not suffer from any bugs. You do need your own assertion
framework, we use [lazy-ass](https://github.com/bahmutov/lazy-ass) and a library
of predicates [check-more-types](https://github.com/kensho/check-more-types).
