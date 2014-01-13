require.config({
    baseUrl: '.',
    paths: {
        jquery: 'js/vendor/jquery',
        underscore: 'js/vendor/underscore',
        backbone: 'js/vendor/backbone',
        localstorage: 'js/vendor/backbone.localStorage',
        foundation: 'js/vendor/foundation',
        reveal: 'js/vendor/foundation.reveal',
        d3: 'js/vendor/d3'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        d3: {
            exports: 'd3'
        },
        foundation: ['jquery'],
        reveal: ['foundation']
    }
});

require(['js/app', 'reveal'], function(App) {
    var app = new App();
    app.run();

    $(document).foundation();
});
