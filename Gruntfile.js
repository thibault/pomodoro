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

        clean: {
            all: {
                files: [{
                    dot: true,
                    src: [
                        '<%= pomodoro.build %>/*',
                        '<%= pomodoro.dist %>/*'
                    ]
                }]
            }
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
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: './src/',
                    mainConfigFile: '<%= pomodoro.src %>/js/main.js',
                    name: 'js/vendor/almond',
                    out: '<%= pomodoro.dist %>/js/vendor/require.js',
                    include: ['js/main'],
                    insertRequire: ['js/main'],
                    keepBuildDir: true
                }
            }
        },

        useminPrepare: {
            options: {
                staging: '<%= pomodoro.build %>',
                dest: '<%= pomodoro.dist %>'
            },
            html: '<%= pomodoro.src %>/index.html'
        },

        usemin: {
            options: {
                assetsDirs: ['<%= pomodoro.dist %>']
            },
            html: ['<%= pomodoro.dist %>/index.html'],
            css: ['<%= pomodoro.dist %>/css/*.css']
        },

        // Concat, uglify and cssmin are autoconfigured by useminPrepare
        concat: {},
        cssmin: {},
        uglify: {},

        htmlmin: {
            dist: {
                options: {},
                files: [{
                    expand: true,
                    cwd: '<%= pomodoro.src %>',
                    src: '*.html',
                    dest: '<%= pomodoro.dist %>'
                }]
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= pomodoro.src %>',
                    dest: '<%= pomodoro.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'img/*',
                        'audio/*',
                        'manifest.appcache',
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= pomodoro.src %>/css',
                dest: '<%= pomodoro.build %>/css',
                src: '{,*/}*.css'
            }
        },

        rev: {
            dist: {
                files: {
                    src: [
                        '<%= pomodoro.dist %>/js/{,*/}*.js',
                        '<%= pomodoro.dist %>/css/{,*/}*.css',
                        '<%= pomodoro.dist %>/img/{,*/}*.{gif,jpeg,jpg,png,webp}',
                    ]
                }
            }
        },

        manifest: {
            generate: {
                options: {
                    basePath: '<%= pomodoro.dist %>',
                    network: ['*'],
                    preferOnline: false,
                    verbose: false,
                    timestamp: true,
                    hash: true,
                    master: ['index.html']
                },
                src: [
                    'css/**/*css',
                    'js/**/*js',
                    'audio/*',
                ],
                dest: '<%= pomodoro.dist %>/manifest.appcache'
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-casperjs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-manifest');

    grunt.registerTask('casper', ['connect', 'casperjs']);

    grunt.registerTask('test', [
        'mocha',
        'casper'
    ]);

    grunt.registerTask('build', [
        'clean:all',
        'requirejs',
        'useminPrepare',
        'htmlmin',
        'concat',
        'cssmin',
        'copy:dist',
        'rev',
        'usemin',
        'manifest',
    ]);

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'test', 'build']);
};
