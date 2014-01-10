define(['../src/js/models'], function(Models) {

    describe('Pomodoro', function() {

        var clock;

        before(function () {
            clock = sinon.useFakeTimers();
        });

        after(function () {
            clock.restore();
        });

        describe('initialize', function() {
            it('should set reasonable default values', function() {
                var pmdr = new Models.Pomodoro();
                expect(pmdr.get('duration')).to.be.equal(25 * 60 * 1000);
                expect(pmdr.get('startedAt')).to.be.null;
                expect(pmdr.get('terminatedAt')).to.be.null;
            });
            it('should take a duration argument', function() {
                var pmdr = new Models.Pomodoro({'duration': 10 * 60 * 1000});
                expect(pmdr.get('duration')).to.be.equal(10 * 60 * 1000);
            });
        });

        describe('start', function() {
            it('should save the started date', function() {
                var pmdr = new Models.Pomodoro();
                pmdr.start();
                expect(pmdr.get('startedAt')).to.be.equal(Date.now());
            });
            it('should call the terminate function when over', function() {
                var pmdr = new Models.Pomodoro({'duration': 10 * 60 * 1000});
                pmdr.start();

                var spy = sinon.spy(pmdr._terminate);
                clock.tick(10 * 60 * 1000 + 10);
                expect(spy.calledOnce).to.be.true;
            });
            it('should take a callback as an argument');
        });
    });
});
