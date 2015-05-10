'use strict';
module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        "bitwise": false,
        "browser": true,
        "curly": false,
        "eqeqeq": true,
        "eqnull": true,
        "esnext": true,
        "immed": true,
        "jquery": true,
        "latedef": true,
        "newcap": true,
        "noarg": true,
        "node": true,
        "strict": false,
        "trailing": true
      },
      all: [
        'Gruntfile.js',
        'assets/js/*.js',
        '!assets/js/*.min.js'
      ]
    },

    // SASS
    sass: {
      dist: {
        options: {
          style: 'nested',
          compass: true
        },
        files: {
          'assets/css/app.css': [
            'assets/scss/app.scss'
          ]
        }
      }
    },
    // AUTOPREFIXER
    autoprefixer: {
      // if you have specified only the `src` param, the destination will be set automatically,
      // so source files will be overwritten
      no_dest: {
        src: 'assets/css/*.css' // globbing is also possible here
      },
    },
    
    // WATCH
    watch: {
      sass: {
        files: [
          'assets/scss/**/*.scss',
        ],
        tasks: ['sass', 'autoprefixer']
      },
      js: {
        files: [
          '<%= jshint.all %>'
        ],
        tasks: ['jshint']
      },
      livereload: {
        // Browser live reloading
        // https://github.com/gruntjs/grunt-contrib-watch#live-reloading
        options: {
          livereload: 35729
        },
        files: [
          'assets/css/app.min.css',
          'assets/js/app.js',
          'assets/js/paperjs/*.js',
          '*.php'
        ]
      }
    }
    
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');

  // Register tasks
  grunt.registerTask('default', [
    'watch',
  ]);

};
