define(['src/js/models', 'src/js/views'], function(Models, Views) {

    describe('The timer', function() {

        var clock;

        before(function () {
            clock = sinon.useFakeTimers();
        });

        after(function () {
            clock.restore();
        });

        it('should display 00:00 by default', function() {
            var view = new Views.TimerView();
            expect(view.render().$el.text()).to.be.equal('00:00');
        });

        it('should be updated as soon as the pomodoro starts', function() {
            var pomodoro = new Models.Pomodoro({duration: 10000});
            var view = new Views.TimerView();
            view.startRunning(pomodoro);
            expect(view.$el.text()).to.be.equal('00:10');
        });

        it('should be decremented every second', function() {
            var pomodoro = new Models.Pomodoro({duration: 1500000});
            var view = new Views.TimerView();
            view.startRunning(pomodoro);

            clock.tick(1000);
            expect(view.$el.text()).to.be.equal('24:59');

            clock.tick(1000);
            expect(view.$el.text()).to.be.equal('24:58');

            clock.tick(10000);
            expect(view.$el.text()).to.be.equal('24:48');
        });

        it('should display 00:00 when it stops running', function() {
            var pomodoro = new Models.Pomodoro({duration: 1500000});
            var view = new Views.TimerView();
            view.startRunning(pomodoro);
            view.stopRunning();
            expect(view.$el.text()).to.be.equal('00:00');
        });
    });
});
