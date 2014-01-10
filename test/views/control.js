define(['src/js/views'], function(Views) {

    describe('Control bar', function() {

        describe('The start pomodoro button', function() {
            it('should start a 25 minutes timer');
            it('should trigger an event');
        });

        describe('The start break button', function() {
            it('should start a 5 minutes timer');
            it('should trigger an event');
        });

        describe('The start long break button', function() {
            it('should start a 15 minutes timer');
            it('should trigger an event');
        });

        describe('The stop button', function() {
            it('should trigger an event');
        });
    });
});

