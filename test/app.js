define(['js/app'], function(App) {
    describe('App', function() {

        var clock;

        before(function () {
            clock = sinon.useFakeTimers();
        });

        after(function () {
            clock.restore();
        });

        describe('Notification', function() {

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

        describe('Finished pomodoros', function() {
            it('should be added to the finished pomodoro list', function() {
                var app = new App();
                app.run();

                expect(app.finishedPomodoros.length).to.be.equal(0);

                app.startPomodoro({
                    duration: 1000,
                    type: 'pomodoro'
                });
                clock.tick(1010);
                expect(app.finishedPomodoros.length).to.be.equal(1);
            });

            it('should not be added if it was interrupted', function() {
                var app = new App();
                app.run();
                app.startPomodoro({
                    duration: 1000,
                    type: 'break'
                });
                clock.tick(1010);
                expect(app.finishedPomodoros.length).to.be.equal(0);
            });

            it('should not be added if it\'s a break pomodoro', function() {
                var app = new App();
                app.run();
                app.startPomodoro({
                    duration: 1000,
                    type: 'break'
                });
                app.interruptPomodoro();
                expect(app.finishedPomodoros.length).to.be.equal(0);
            });
        });
    });
});
