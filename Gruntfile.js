(function () {
    'use strict';
}());

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                separator: '\r\n'
            },
            dist: {
                src: [
                    'js/app-bootstrap.js',
                    'js/util.js',
                    'js/models/**/*.js',
                    'js/collections/**/*.js',
                    'js/views/**/*.js',
                    'js/routers/router.js',
                    'js/app.js'
                ],
                dest: 'build/app.js',
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                 files: {
                      'deploy/app.min.js': ['<%= concat.dist.dest %>']
             }
            }
        },

        jshint: {
             files: ['Gruntfile.js', 'js/**/*.js'],
             options: {
                 globals: {
                      jQuery: true,
                      console: true,
                      module: true
                 }
             }
        },

        compass: {
            dist: {
                options: {
                    sassDir: 'sass',
                    cssDir: 'deploy',
                    environment: 'production',
                    outputStyle: 'compressed',
                    specify: 'sass/app.scss'
                }
            }
        },

        watch: {
            files: ['<%= jshint.files %>', 'sass/**/*.scss'],
            tasks: ['concat', 'uglify', 'jshint', 'compass']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['concat', 'uglify', 'jshint', 'compass','watch']);
};
