// Configured in Gruntfile.js
var url = 'http://localhost:4242/index.html';

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
        this.wait(100);
    });

    casper.then(function() {
        test.assertSelectorHasText('#timer', '00:00');

        this.click('#start-pomodoro-btn');
        test.assertSelectorHasText('#timer', '25:00');

        this.wait(1000);
        test.assertSelectorHasText('#timer', '24:59');

        this.wait(1000);
        test.assertSelectorHasText('#timer', '24:58');
    });

    casper.run(function() {
        test.done();
    });
});
