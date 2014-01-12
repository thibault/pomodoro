// Configured in Gruntfile.js
var url = 'http://localhost:4242/index.html';

//casper.on('remote.message', function(message) {
//    casper.debug('>>> ' + message);
//});


casper.isDisabled = function(selector) {
    "use strict";
    this.checkStarted();
    return this.evaluate(function _evaluate(selector) {
        var element = __utils__.findOne(selector);
        return element.hasAttribute('disabled');
    }, selector);
};

casper.test.begin('The app should load flawlessly', 1, function suite(test) {
    casper.start(url, function() {
        test.assertHttpStatus(200,'http status is 200');
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin('Start pomodoro button', function(test) {
    casper.start(url, function() {
        // Wait for requirejs to load all scripts
        casper.evaluate(function() {
            localStorage.clear();
        }, {});
        this.wait(100);
    });

    casper.then(function() {
        test.assertSelectorHasText('#timer', '00:00');
    });

    casper.then(function() {
        this.click('#start-pomodoro-btn');
        test.assertSelectorHasText('#timer', '25:00');
    });

    casper.wait(1010, function() {
        test.assertSelectorHasText('#timer', '24:59');
    });

    casper.wait(1010, function() {
        test.assertSelectorHasText('#timer', '24:58');
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin('Button activations', function(test) {
    casper.start(url, function() {
        // Wait for requirejs to load all scripts
        casper.evaluate(function() {
            localStorage.clear();
        }, {});
        this.wait(100);
    });

    casper.then(function() {
        test.assertFalsy(casper.isDisabled('#start-pomodoro-btn'));
        test.assertFalsy(casper.isDisabled('#start-break-btn'));
        test.assertFalsy(casper.isDisabled('#start-lbreak-btn'));
        test.assert(casper.isDisabled('#stop-btn'));
    });

    casper.then(function() {
        this.click('#start-pomodoro-btn');
        test.assert(casper.isDisabled('#start-pomodoro-btn'));
        test.assert(casper.isDisabled('#start-break-btn'));
        test.assert(casper.isDisabled('#start-lbreak-btn'));
        test.assertFalsy(casper.isDisabled('#stop-btn'));
    });

    casper.then(function() {
        this.click('#stop-btn');
        test.assertFalsy(casper.isDisabled('#start-pomodoro-btn'));
        test.assertFalsy(casper.isDisabled('#start-break-btn'));
        test.assertFalsy(casper.isDisabled('#start-lbreak-btn'));
        test.assert(casper.isDisabled('#stop-btn'));
    });

    casper.run(function() {
        test.done();
    });
});
