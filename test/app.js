define(['js/app'], function(App) {

    describe('Notification', function() {
        var clock;

        before(function () {
            clock = sinon.useFakeTimers();
        });

        after(function () {
            clock.restore();
        });

        it('should be displayed when a pomodoro is over', function() {
            var app = new App();
            app.run();
            app.startPomodoro({
                duration: 1000,
                type: 'pomodoro'
            });

            var spy = sinon.spy(app, 'notifyUser');
            expect(spy.calledOnce).to.be.false;

            clock.tick(1500);
            expect(spy.calledOnce).to.be.true;
        });

        it('should not be displayed when a pomodoro was interrupted', function() {
            var app = new App();
            sinon.spy(app, 'onPomodoroFinished');
            sinon.spy(app, 'notifyUser');
            app.run();
            app.startPomodoro({
                duration: 1000,
                type: 'pomodoro'
            });

            expect(app.onPomodoroFinished.calledOnce).to.be.false;
            expect(app.notifyUser.calledOnce).to.be.false;

            app.interruptPomodoro();
            expect(app.onPomodoroFinished.calledOnce).to.be.true;
            expect(app.notifyUser.calledOnce).to.be.false;
        });
    });
});

