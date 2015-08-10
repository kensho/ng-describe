# Development

To build the README document, run unit tests and linter

    npm run build

To run all unit tests (against different Angular versions)

    npm test

To keep a watch and rerun build + lint + tests on source file change

    npm run watch

For now, all source is in a single `ng-describe.js` file, while the documentation
is generated from Markdown files in the `docs` folder

To just run karma unit tests via Grunt plugin

    npm run karma

If you have Karma runner installed globally you can run all the unit tests yourself ones

    karma start --single-run=true test/karma.conf.js
