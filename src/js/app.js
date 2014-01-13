define([
    'underscore', 'backbone', 'jquery', 'js/models', 'js/views', 'js/utils'
],
function(_, Backbone, $, Models, Views, utils) {
    "use strict";

    var App = function() {
        this._currentPomodoro = null;
        this.finishedPomodoros = new Models.PomodoroCollection();
        this.dynamicTitleCb = $('#dynamicTitleCb');

        _.extend(this, Backbone.Events);
        _.bindAll(this,
            'onPomodoroFinished', 'onPomodoroCompleted', 'toggleTitle');
    };

    App.prototype.initializeViews = function() {
        this.timerView = new Views.TimerView({el: '#timer'});
        this.timerView._renderTitle = this.dynamicTitleCb.prop('checked');
        this.controlView = new Views.ControlView({el: '#control-bar'});
        this.configurationView = new Views.ConfigurationView({el: '#configuration-form'});
    };

    /**
     * Manually starts a pomodoro.
     *
     * Creates the pomodoro object, and run the countdown timer.
     */
    App.prototype.startPomodoro = function(options) {
        // If a pomodoro is already running, do nothing
        if (this._currentPomodoro) {
            return;
        }

        var duration = options.duration;
        var type = options.type;
        this._currentPomodoro= new Models.Pomodoro({
            duration: duration,
            type: type
        });
        this._currentPomodoro.start();

        this.timerView.startRunning(this._currentPomodoro);
        this.controlView.renderForPomodoro(this._currentPomodoro);

        this.listenTo(this._currentPomodoro, 'pomodoroCompleted', this.onPomodoroCompleted);
        this.listenTo(this._currentPomodoro, 'pomodoroFinished', this.onPomodoroFinished);

        this.saveState();
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
     * Perferm all operations required when a pomodoro is completed
     * (not interrupted).
     */
    App.prototype.onPomodoroCompleted = function() {
        this.notifyUser();
        if (this._currentPomodoro.get('type') === 'pomodoro') {
            this.finishedPomodoros.add(this._currentPomodoro);
            this._currentPomodoro.save();
        }
    };

    /**
     * Perform all operations required when a pomodoro is finished,
     * whether it was manually interrupted or not.
     *
     */
    App.prototype.onPomodoroFinished = function() {
        this.timerView.stopRunning(this._currentPomodoro);
        this.controlView.resetView();
        this.stopListening(this._currentPomodoro);
        this._currentPomodoro = null;

        this.saveState();
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

        this.dynamicTitleCb.on('click', this.toggleTitle);
    };

    App.prototype.toggleTitle = function(event) {
        this.timerView._renderTitle = this.dynamicTitleCb.prop('checked');
    };

    /**
     * Save current state in localstorage
     */
    App.prototype.saveState = function() {
        if (!this._currentPomodoro) {
            localStorage.removeItem('pomodoroData');
        } else {
            var data = this._currentPomodoro.toJSON();
            localStorage.setItem('pomodoroData', JSON.stringify(data));
        }
    };

    /**
     * Restore app state if data is present in localstorage.
     *
     * If we detect that a previously started pomodoro should still be running,
     * we restore it and run the application.
     *
     * We won't restore anything if the pomodoro expiration time was
     * already reached.
     */
    App.prototype.restoreState = function() {
        var data = JSON.parse(localStorage.getItem('pomodoroData'));
        if (data) {
            var pomodoro = new Models.Pomodoro(data);

            var remainingTime = pomodoro.remainingTime();
            if (remainingTime !== null) {
                this._currentPomodoro = pomodoro;
                this.timerView.startRunning(this._currentPomodoro);
                this.controlView.renderForPomodoro(this._currentPomodoro);

                this.listenTo(this._currentPomodoro, 'pomodoroCompleted', this.onPomodoroCompleted);
                this.listenTo(this._currentPomodoro, 'pomodoroFinished', this.onPomodoroFinished);
            }
        }

        this.finishedPomodoros.fetch();
    };

    App.prototype.run = function() {
        this.initializeViews();
        this.bindEvents();
        this.restoreState();
    };

    return App;
});
