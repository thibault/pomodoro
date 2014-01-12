define(['backbone', 'js/utils'], function(Backbone, utils) {
    "use strict";

    var Views = {};

    Views.TimerView = Backbone.View.extend({
        initialize: function() {
            this.model = null;
            this._interval = null;
            this._renderTitle = false;
            this.render();

            _.bindAll(this, 'render');
        },

        /**
         * Starts ticking the timer, updating it every second.
         */
        startRunning: function(pomodoro) {
            this.model = pomodoro;
            this.render();
            clearInterval(this._interval);
            this._interval = setInterval(this.render, 100);
        },

        /**
         * Stops the timer ticks.
         */
        stopRunning: function() {
            clearInterval(this._interval);
            this.model = null;
            this.render();
        },

        render: function() {
            var time;
            if (this.model) {
                var remainingTime = this.model.remainingTime();
                time = utils.prettifyTime(remainingTime);
            } else {
                time = '00:00';
            }

            this.$el.text(time);

            if (this._renderTitle) {
                $('title').text(time);
            } else {
                $('title').text('Pomodoro');
            }
            return this;
        }
    });

    Views.ControlView = Backbone.View.extend({
        events: {
            'click button': 'onClick'
        },
        initialize: function() {
            this.render();
        },
        renderForPomodoro: function(pomodoro) {
            this.model = pomodoro;
            this.render();
        },
        resetView: function() {
            this.model = null;
            this.render();
        },

        /**
         * Disable the control buttons depending of the state of the
         * current pomodoro.
         */
        render: function() {
            var startButtons = this.$el.find('button.start-control');
            var stopButton = this.$el.find('button.stop-control');

            if (this.model) {
                startButtons.prop('disabled', true);
                stopButton.prop('disabled', false);
            } else {
                startButtons.prop('disabled', false);
                stopButton.prop('disabled', true);
            }
            return this;
        },

        /**
         * Trigger events depending on clicked buttons.
         */
        onClick: function(event) {
            var target = event.target;
            var action = target.getAttribute('data-action');
            var type = target.getAttribute('data-type');

            if (action === 'stop') {
                this.trigger('timerInterrupted');
            } else {
                var duration = target.getAttribute('data-duration');
                this.trigger('timerStarted', {
                    duration: duration,
                    type: type
                });
            }
        }
    });

    /**
     * Updates the app configuration when the form is modified.
     */
    Views.ConfigurationView = Backbone.View.extend({
        events: {
            change: 'onConfigurationChange'
        },
        buttons: [
            { field: '#pomodoro-duration', button: '#start-pomodoro-btn' },
            { field: '#break-duration', button: '#start-break-btn' },
            { field: '#lbreak-duration', button: '#start-lbreak-btn' }
        ],
        initialize: function() {
            _.each(this.buttons, function(data) {
                var button = $(data.button);
                var ms = button.data('duration');
                var input = $(data.field);
                input.val(ms / 60000);
            });
        },
        onConfigurationChange: function() {
            _.each(this.buttons, function(data) {
                var input = $(data.field);
                var minutes = input.val();
                var button = $(data.button);
                button.attr('data-duration', minutes * 60 * 1000);
            });
        }
    });

    return Views;
});
