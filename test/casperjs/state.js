// Configured in Gruntfile.js
var url = 'http://localhost:4242/index.html';

//casper.on('remote.message', function(message) {
//    casper.debug('>>> ' + message);
//});


casper.test.begin('The pomodoro state is saved', function suite(test) {
    casper.start(url, function() {
        casper.evaluate(function() {
            localStorage.clear();
        }, {});
        this.wait(100);
    });

    casper.then(function() {
        test.assertHttpStatus(200,'http status is 200');
        test.assertSelectorHasText('#timer', '00:00');
        this.click('#start-pomodoro-btn');
    });

    casper.wait(1000, function() {
        test.assertSelectorHasText('#timer', '24:59');
    });

    casper.thenOpen(url);

    casper.wait(100, function() {
        test.assertSelectorHasText('#timer', '24:59');
    });

    casper.run(function() {
        test.done();
    });
});
