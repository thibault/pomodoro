define([
    'underscore', 'backbone', 'jquery', 'src/js/models', 'src/js/views', 'src/js/utils'
],
function(_, Backbone, $, Models, Views, utils) {
    "use strict";

    var App = function() {
        this._currentPomodoro = null;

        _.extend(this, Backbone.Events);
        _.bindAll(this, 'onPomodoroFinished');
    };

    App.prototype.initializeViews = function() {
        this.timerView = new Views.TimerView({el: '#timer'});
        this.controlView = new Views.ControlView({el: '#control-bar'});
    };

    /**
     * Manually starts a pomodoro.
     *
     * Creates the pomodoro object, and run the countdown timer.
     *
     */
    App.prototype.startPomodoro = function(options) {
        var duration = options.duration;
        var type = options.type;

        this._currentPomodoro= new Models.Pomodoro({
            duration: duration,
            type: type
        });
        this._currentPomodoro.start(this.onPomodoroFinished);
        this.timerView.startRunning(this._currentPomodoro);
    };

    /**
     * Manually interrupts the pomodoro.
     *
     * Don't perform any other operations, because all the cleanup code
     * will be called when the pomodoro finished event will be raised.
     *
     */
    App.prototype.interruptPomodoro = function() {
        this._currentPomodoro.interrupt();
    };

    /**
     * Perform all operations required when a pomodoro is finished,
     * whether it was manually interrupted or not.
     *
     */
    App.prototype.onPomodoroFinished = function() {
        this.timerView.stopRunning(this._currentPomodoro);

        if (! this._currentPomodoro.get('wasInterrupted')) {
            this.notifyUser();
        }
    };

    /**
     * Notify user of the end of pomodoro.
     */
    App.prototype.notifyUser = function() {
        var audioElt = document.getElementById('audioAlert');
        if (audioElt) {
            audioElt.play();
        }

        if (this._currentPomodoro.get('type') === 'pomodoro') {
            utils.notify('The pomodoro is over', {body: 'Go easy on the coffee.'});
        } else {
            utils.notify('Let\'s get back to work', {body: 'Focus now!'});
        }
    };

    App.prototype.bindEvents = function() {
        this.listenTo(this.controlView, 'timerStarted', this.startPomodoro);
        this.listenTo(this.controlView, 'timerInterrupted', this.interruptPomodoro);
    };

    App.prototype.run = function() {
        this.initializeViews();
        this.bindEvents();
    };

    return App;
});
