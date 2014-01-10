// Configured in Gruntfile.js
var url = 'http://localhost:4242/index.html';
var sinon = require('../../../node_modules/sinon/lib/sinon');

casper.test.begin('The app should load flawlessly', 1, function suite(test) {
    casper.start(url, function() {
        test.assertHttpStatus(200,'http status is 200');
    });

    casper.run(function() {
        test.done();
    });
});
