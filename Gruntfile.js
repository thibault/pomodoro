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
            all: ['test/tests.html']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha');

    grunt.registerTask('test', []);

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'test']);
};
