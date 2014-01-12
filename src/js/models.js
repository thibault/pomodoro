define(['backbone'], function(Backbone) {
    "use strict";

    var Models = {};

    /**
     * Reprensents a single pomodoro,
     * i.e a timer with a beginning and an end.
     */
    Models.Pomodoro = Backbone.Model.extend({
        defaults: {
            'duration': 25 * 60 * 1000
        },

        initialize: function() {
            this._timeout = null;
            this.set('startedAt', null);
            this.set('terminatedAt', null);
            this.set('wasInterrupted', null);
            _.bindAll(this, '_terminate');
        },

        /**
         * Starts the pomodoro
         *
         * @param callback optional callback to be called when pomodoro is over
         */
        start: function(callback) {
            this.set('startedAt', Date.now());

            this._timeout = _.delay(
                this._terminate,
                this.get('duration'),
                {interrupted: false}
            );

            if (callback) {
                this.listenTo(this, 'pomodoroFinished', callback);
            }
        },

        /**
         * Manually marks the pomodoro as over
         */
        interrupt: function() {
            clearTimeout(this._timeout);
            this._terminate({interrupted: true});
        },

        /**
         * Returns the number of ms before end of pomodoro.
         */
        remainingTime: function() {
            var remainingTime;

            if (this.get('startedAt') !== null && this.get('terminatedAt') === null) {
                var ellapsedTime = Date.now() - this.get('startedAt');
                remainingTime = this.get('duration') - ellapsedTime;
            } else {
                remainingTime = null;
            }

            return remainingTime;
        },

        /**
         * Marks the pomodoro as terminated
         */
        _terminate: function(options) {
            this.set('terminatedAt', Date.now());
            this.set('wasInterrupted', options.interrupted);
            this.trigger('pomodoroFinished');
        },
    });

    return Models;
});
