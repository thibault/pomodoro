require.config({
    baseUrl: '.',
    paths: {
        jquery: 'js/vendor/jquery',
        underscore: 'js/vendor/underscore',
        backbone: 'js/vendor/backbone',
        localstorage: 'js/vendor/backbone.localStorage',
        foundation: 'js/vendor/foundation',
        reveal: 'js/vendor/foundation.reveal',
        d3: 'js/vendor/d3',
        modernizr: 'js/vendor/modernizr'
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
        modernizr: {
            exports: 'Modernizr'
        },
        foundation: ['jquery'],
        reveal: ['foundation']
    }
});

require(['js/app', 'jquery', 'modernizr', 'reveal'], function(App, $, Modernizr) {
    var checkCompatibility = function() {
        var requiredApis = ['inlinesvg', 'audio', 'localstorage', 'notification'];
        var missingApi = false;
        for (var i = 0 ; i < requiredApis.length && !missingApi ; i++) {
            missingApi = !Modernizr[requiredApis[i]];
        }

        if (missingApi) {
            $('#compatibility-alert').show();
        }
    };
    checkCompatibility();

    var app = new App();
    app.run();

    $(document).foundation();

});
