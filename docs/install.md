# Install

`npm install {%= name %} --save-dev`

Load ng-describe.js after angular, [lazy-ass](https://github.com/bahmutov/lazy-ass), 
[check-types](https://github.com/philbooth/check-types.js), 
[check-more-types](https://github.com/kensho/check-more-types) but before your code, for example in Karma conf file

    npm install lazy-ass check-types check-more-types angular angular-mocks --save-dev

    // karma.conf.js
    files: [
        'node_modules/check-types/src/check-types.js',
        'node_modules/check-more-types/check-more-types.js',
        'node_modules/lazy-ass/index.js',
        'node_modules/angular/angular.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'node_modules/ng-describe/ng-describe.js',
        '<your source.js>',
        '<your specs.js>'
    ],
