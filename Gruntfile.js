module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [
        'ng-describe.js'
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
        files: ['*.js', 'test/*.js', 'package.json'],
        tasks: ['jshint', 'test']
      }
    }
  });

  var plugins = require('matchdep').filterDev('grunt-*');
  plugins.forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['karma']);
  grunt.registerTask('doc', ['readme', 'toc', 'readme']);
  grunt.registerTask('default',
    ['nice-package', 'deps-ok', 'sync', 'jsonlint', 'jshint', 'test', 'doc']);
};
