require.config({
    baseUrl: '.',
    paths: {
        'jquery': 'js/vendor/jquery',
        'underscore': 'js/vendor/underscore',
        'backbone': 'js/vendor/backbone',
        'foundation': 'js/vendor/foundation',
        'reveal': 'js/vendor/foundation.reveal'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
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
