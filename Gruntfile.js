module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [
        'src/ng-describe.js'
      ],
      specs: ['test/*-spec.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    jsonlint: {
      all: {
        src: ['package.json']
      }
    },

    concat: {
      dist: {
        src: [
          // 3rd party dependencies
          'node_modules/es5-shim/es5-shim.js',
          'node_modules/check-types/src/check-types.js',
          'node_modules/check-more-types/check-more-types.js',
          'node_modules/lazy-ass/index.js',
          // the library itself
          'src/ng-describe.js'
        ],
        dest: 'dist/ng-describe.js',
      },
    },

    sync: {
      all: {
        options: {
          sync: ['author', 'name', 'version',
            'private', 'license', 'keywords', 'homepage'],
        }
      }
    },

    toc: {
      api: {
        options: {
          heading: '\n'
        },
        files: {
          './docs/toc.md': './README.md'
        }
      }
    },

    readme: {
      options: {
        readme: './docs/README.tmpl.md',
        docs: '.',
        templates: './docs'
      }
    },

    karma: {
      unit: {
        configFile: 'test/karma.conf.js'
      }
    },

    watch: {
      options: {
        atBegin: true
      },
      all: {
        files: ['*.js', 'src/*.js', 'test/*.js', 'package.json'],
        tasks: ['jshint', 'concat', 'test']
      }
    }
  });

  var plugins = require('matchdep').filterDev('grunt-*');
  plugins.forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['karma']);
  grunt.registerTask('doc', ['readme', 'toc', 'readme']);
  grunt.registerTask('default', [
    'nice-package', 'deps-ok', 'sync', 'jsonlint', 'jshint',
    'concat', 'test', 'doc'
  ]);
};
