define(['src/js/models'], function(Models) {

    describe('A pomodoro', function() {

        var clock;

        before(function () {
            clock = sinon.useFakeTimers();
        });

        after(function () {
            clock.restore();
        });

        it('should have reasonable default values', function() {
            var pmdr = new Models.Pomodoro();
            expect(pmdr.get('duration')).to.be.equal(25 * 60 * 1000);
            expect(pmdr.get('startedAt')).to.be.null;
            expect(pmdr.get('terminatedAt')).to.be.null;
        });

        it('should have a configurable duration', function() {
            var pmdr = new Models.Pomodoro({'duration': 10 * 60 * 1000});
            expect(pmdr.get('duration')).to.be.equal(10 * 60 * 1000);
        });

        it('should emit a signal when it\'s completed', function(done) {
            var pmdr = new Models.Pomodoro({'duration': 1000});
            pmdr.start();
            pmdr.on('pomodoroCompleted', done);
            clock.tick(1100);
        });

        it('should emit a signal when it\'s interrupted', function(done) {
            var pmdr = new Models.Pomodoro({'duration': 1000});
            pmdr.start();
            pmdr.on('pomodoroInterrupted', done);
            pmdr.interrupt();
        });

        describe('start', function() {
            it('should save the started date', function() {
                var pmdr = new Models.Pomodoro();
                pmdr.start();
                expect(pmdr.get('startedAt')).to.be.equal(Date.now());
            });
        });

        describe('terminate', function() {
            it('should be called when the pomodoro is over', function() {
                var pmdr = new Models.Pomodoro({'duration': 1000});
                sinon.spy(pmdr, '_terminate');
                pmdr.start();

                clock.tick(2000);
                expect(pmdr._terminate.calledOnce).to.be.true;
            });
        });

        describe('interrupt', function() {
            it('should mark the pomodoro as manually interrupted', function() {
                var pmdr = new Models.Pomodoro();
                pmdr.start();
                pmdr.interrupt();
                expect(pmdr.get('wasInterrupted')).to.be.true;
            });
        });

        describe('remainingTime', function() {
            it('should return the number of ms before the end', function() {
                var pmdr = new Models.Pomodoro({duration: 25 * 60 * 1000});
                pmdr.start();

                expect(pmdr.remainingTime()).to.be.equal(25 * 60 * 1000);

                clock.tick(1000);
                expect(pmdr.remainingTime()).to.be.equal(25 * 60 * 1000 - 1000);
            });

            it('should return null if the pomodoro is not started yet', function() {
                var pmdr = new Models.Pomodoro({duration: 25 * 60 * 1000});
                expect(pmdr.remainingTime()).to.be.null;
            });

            it('should return null if the pomodoro is already finished', function() {
                var pmdr = new Models.Pomodoro({duration: 1000});
                pmdr.start();
                clock.tick(1500);
                expect(pmdr.remainingTime()).to.be.null;
            });
        });
    });
});
