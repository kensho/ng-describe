# Install

`npm install {%= name %} --save-dev`

Load ng-describe.js after angular and angular-mocks but before your specs, for example in Karma conf file.

```js 
// karma.conf.js
files: [
    'node_modules/angular/angular.js',
    'node_modules/angular-mocks/angular-mocks.js',
    'node_modules/ng-describe/dist/ng-describe.js',
    '<your source.js>',
    '<your specs.js>'
],
```

File `dist/ng-describe.js` includes es5-shim and other dependencies needed by 
the `ngDescribe` function.
