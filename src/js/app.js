define([
    'underscore', 'backbone', 'jquery', 'd3', 'js/models', 'js/views', 'js/data',
    'js/utils'
],
function(_, Backbone, $, d3, Models, Views, Data, utils) {
    "use strict";

    var App = function() {
        this._currentPomodoro = null;
        this.finishedPomodoros = new Models.PomodoroCollection();

        _.extend(this, Backbone.Events);
        _.bindAll(this,
            'onPomodoroFinished', 'onPomodoroCompleted', 'toggleTitle',
            'updateConfiguration');
    };

    /**
     * Creates a configuration objects. Either takes it's data from
     * localstorage, or use default data.
     */
    App.prototype.configure = function() {
        var configurationData = JSON.parse(localStorage.getItem('configurationData'));
        configurationData = configurationData || {};
        this.configuration = new Models.Configuration(configurationData);
    };

    /**
     * Save the current configuration in localstorage
     */
    App.prototype.updateConfiguration = function() {
        var configurationString = JSON.stringify(this.configuration.toJSON());
        localStorage.setItem('configurationData', configurationString);
    };

    App.prototype.initializeViews = function() {
        this.timerView = new Views.TimerView({el: '#timer'});
        this.controlView = new Views.ControlView({el: '#control-bar'});
        this.annotationView = new Views.AnnotationView({
            el: '#annotation-form',
            collection: this.finishedPomodoros
        });
        this.configurationView = new Views.ConfigurationView({
            el: '#configuration-form',
            model: this.configuration
        });
        this.toggleTitle();

        var weekDataProvider = new Data.Provider(
            this.finishedPomodoros,
            d3.time.day,
            d3.time.day.offset(new Date(), -7),
            d3.time.day.ceil(new Date())
        );
        this.weekChartView = new Views.ChartView({
            el: '#weekChart',
            collection: this.finishedPomodoros,
            interval: d3.time.day,
            dateFormat: "%a %b %e",
            dataProvider: weekDataProvider,
        });

        var monthDataProvider = new Data.Provider(
            this.finishedPomodoros,
            d3.time.monday,
            d3.time.week.offset(new Date(), -10),
            d3.time.week.ceil(new Date())
        );
        this.monthChartView = new Views.ChartView({
            el: '#monthChart',
            collection: this.finishedPomodoros,
            interval: d3.time.monday,
            dateFormat: "Week %W, %b",
            dataProvider: monthDataProvider,
        });
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
        this.runTimer();
        this.saveState();
    };

    /**
     * Render the timer and bind to events
     * triggered by the current pomodoro.
     */
    App.prototype.runTimer = function() {
        this.timerView.startRunning(this._currentPomodoro);
        this.controlView.renderForPomodoro(this._currentPomodoro);

        this.listenTo(this._currentPomodoro, 'pomodoroCompleted', this.onPomodoroCompleted);
        this.listenTo(this._currentPomodoro, 'pomodoroFinished', this.onPomodoroFinished);
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
        this.listenTo(this.configurationView, 'dynamicTitleToggled', this.toggleTitle);
        this.listenTo(this.configurationView, 'configurationChanged', this.updateConfiguration);
    };

    App.prototype.toggleTitle = function(event) {
        this.timerView._renderTitle = this.configurationView.isTitleDynamic();
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
        // Restore running pomodoro
        var pomodoroData = JSON.parse(localStorage.getItem('pomodoroData'));
        if (pomodoroData) {
            var pomodoro = new Models.Pomodoro(pomodoroData);

            var remainingTime = pomodoro.remainingTime();
            if (remainingTime !== null) {
                pomodoro.set('duration', remainingTime);
                pomodoro.start();
                this._currentPomodoro = pomodoro;
                this.runTimer();
            }
        }

        // Restore pomodoro collection
        this.finishedPomodoros.fetch({silent: true});
    };

    App.prototype.run = function() {
        this.configure();
        this.initializeViews();
        this.bindEvents();
        this.restoreState();

        this.weekChartView.render();
        this.monthChartView.render();
    };

    return App;
});
