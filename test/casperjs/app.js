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
    });

    casper.then(function() {
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

casper.test.begin('Button activations', function(test) {
    casper.start(url, function() {
        // Wait for requirejs to load all scripts
        this.wait(100);
    });

    casper.then(function() {
        test.assertEqual(
            this.getElementAttribute('#start-pomodoro-btn', 'disabled'),
            false
        );
        test.assertEqual(
            this.getElementAttribute('#start-break-btn', 'disabled'),
            false
        );
        test.assertEqual(
            this.getElementAttribute('#start-lbreak-btn', 'disabled'),
            false
        );
        test.assertEqual(
            this.getElementAttribute('#stop-btn', 'disabled'),
            true
        );
    });

    casper.then(function() {
        this.click('#start-pomodoro-btn');

        test.assertEqual(
            this.getElementAttribute('#start-pomodoro-btn', 'disabled'),
            true
        );
        test.assertEqual(
            this.getElementAttribute('#start-break-btn', 'disabled'),
            true
        );
        test.assertEqual(
            this.getElementAttribute('#start-lbreak-btn', 'disabled'),
            true
        );
        test.assertEqual(
            this.getElementAttribute('#stop-btn', 'disabled'),
            false
        );
    });

    casper.then(function() {
        this.click('#stop-btn');

        test.assertEqual(
            this.getElementAttribute('#start-pomodoro-btn', 'disabled'),
            false
        );
        test.assertEqual(
            this.getElementAttribute('#start-break-btn', 'disabled'),
            false
        );
        test.assertEqual(
            this.getElementAttribute('#start-lbreak-btn', 'disabled'),
            false
        );
        test.assertEqual(
            this.getElementAttribute('#stop-btn', 'disabled'),
            true
        );
    });
});
