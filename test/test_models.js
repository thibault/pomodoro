var expect = chai.expect;

describe('Pomodoro', function() {

    var clock;

    before(function () {
        clock = sinon.useFakeTimers();
    });

    after(function () {
        clock.restore();
    });

    describe('initialize', function() {
        it('should have default values', function() {
            var pmdr = new Pomodoro();
            expect(pmdr.get('duration')).to.be.equal(25 * 60 * 1000);
            expect(pmdr.get('startedAt')).to.be.null;
            expect(pmdr.get('terminatedAt')).to.be.null;
        });
    });

    describe('start()', function() {
        it('should save the started date', function() {
            var pmdr = new Pomodoro();
            pmdr.start();
            expect(pmdr.get('startedAt')).to.be.equal(Date.now());
        });
    });
});
