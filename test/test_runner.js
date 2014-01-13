require.config({
    baseUrl: '../src/',
    paths: {
        jquery: 'js/vendor/jquery',
        underscore: 'js/vendor/underscore',
        backbone: 'js/vendor/backbone',
        localstorage: 'js/vendor/backbone.localStorage',
        d3: 'js/vendor/d3',
        chai: '../test/vendor/chai',
        mocha: '../test/vendor/mocha',
        sinon: '../test/vendor/sinon'
    },
    shim: {
        'mocha': {
            exports: 'mocha',
        },
        'chai': {
            exports: 'chai',
        },
        'sinon': {
            exports: 'sinon',
        },
        'underscore': {
            exports: '_'
        },
        'jquery': {
            exports: '$'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'd3': {
            exports: 'd3'
        }
    }
});

require(['require', 'chai', 'sinon'], function(require, chai) {
    expect = chai.expect;
    mocha.setup('bdd');

    require([
        '../test/models/pomodoro',
        '../test/views/timer',
        '../test/utils',
        '../test/app'
    ], function() {
        mocha.run();
    });
});
