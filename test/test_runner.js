require.config({
    baseUrl: '../',
    paths: {
        jquery: 'src/js/vendor/jquery',
        underscore: 'src/js/vendor/underscore',
        backbone: 'src/js/vendor/backbone',
        chai: 'test/vendor/chai',
        mocha: 'test/vendor/mocha',
        sinon: 'test/vendor/sinon'
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
        }
    }
});

require(['require', 'mocha', 'chai', 'sinon'], function(require, mocha, chai) {
    expect = chai.expect;
    mocha.setup('bdd');

    require(['test/test_models'], function() {
        mocha.run();
    });
});
