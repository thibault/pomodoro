module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        pomodoro: {
            src: 'src',
            test: 'test',
            build: 'build',
            dist: 'dist'
        },

        jshint: {
            options: {
                jshintrc: 'jshintrc.json',
                reporter: require('jshint-stylish')
            },
            files: [
                'Gruntfile.js',
                '<%= pomodoro.src %>/js/*.js',
                '<%= pomodoro.src %>/js/**/*.js',
                '!<%= pomodoro.src %>/js/vendor/*.js'
            ]
        },

        mocha: {
            all: ['test/tests.html'],
            options: {
                run: false,
            }
        },

        connect: {
            server: {
                options: {
                    port: 4242,
                    base: '<%= pomodoro.src %>'
                }
            }
        },

        casperjs: {
            options: {
                async: {
                    parallel: false
                }
            },
            files: ['test/casperjs/**/*.js']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-casperjs');

    grunt.registerTask('test', [
        'mocha',
        'connect',
        'casperjs'
    ]);

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'test']);
};
