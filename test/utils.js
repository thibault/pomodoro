define(['js/utils'], function(utils) {
    describe('prettifyTime', function() {
        it('should display a ms value in the mm:ss form', function() {
            expect(utils.prettifyTime(1000)).to.be.equal('00:01');
            expect(utils.prettifyTime(15000)).to.be.equal('00:15');
            expect(utils.prettifyTime(60000)).to.be.equal('01:00');
            expect(utils.prettifyTime(1500000)).to.be.equal('25:00');
            expect(utils.prettifyTime(1501000)).to.be.equal('25:01');
        });
    });
});

