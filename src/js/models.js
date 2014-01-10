define(['backbone'], function(Backbone) {
    "use strict";

    var Models = {};

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
                this.listenTo(this, 'finished', callback);
            }
        },

        /**
         * Manually marks the pomodoro as over
         */
        interrupt: function() {
            clearTimeout(this._timeout);
            this._terminate(true);
        },

        /**
         * Marks the pomodoro as terminated
         */
        _terminate: function(interrupted) {
            this.set('terminatedAt', Date.now());
            this.set('wasInterrupted', interrupted);
            this.trigger('finished');
        },
    });

    return Models;
});
