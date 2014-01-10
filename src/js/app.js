define([
    'backbone', 'jquery', 'models', 'views'
],
function(Backbone, $, Models, Views) {
    "use strict";

    var App = function() {
        this._currentPomodoro = null;

        _.extend(this, Backbone.Events);
    };

    App.prototype.initializeViews = function() {
        var timer = $('#timer');
        this.timerView = new Views.TimerView({el: timer});

        var controlBar = $('#control-bar');
        this.controlView = new Views.ControlView({el: controlBar});
    };

    App.prototype.startPomodoro = function(options) {
        console.log('starting pomodoro');
        var duration = options.duration;
        var pomodoro = new Models.Pomodoro({duration: duration});
        pomodoro.start(this.onPomodoroFinished);

        this._currentPomodoro = pomodoro;
    };

    App.prototype.interruptPomodoro = function() {
        console.log('interrupting pomodoro');
        this._currentPomodoro.interrupt();
    };

    App.prototype.onPomodoroFinished = function() {
        console.log('pomodoro finished');
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
