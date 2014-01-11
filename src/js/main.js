require.config({
    baseUrl: '..',
    paths: {
        'jquery': 'src/js/vendor/jquery',
        'underscore': 'src/js/vendor/underscore',
        'backbone': 'src/js/vendor/backbone',
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});

require(['src/js/app'], function(App) {
    var app = new App();
    app.run();
});
