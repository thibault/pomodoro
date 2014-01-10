define(['backbone'], function(Backbone) {
    "use strict";

    var Views = {};

    Views.TimerView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        render: function() {
            this.$el.html('00:00');
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
        render: function() {
            return this;
        },

        /**
         * Trigger events depending on clicked buttons.
         */
        onClick: function(event) {
            var target = event.target;
            var action = target.getAttribute('data-action');

            if (action == 'stop') {
                this.trigger('timerInterrupted');
            } else {
                var duration = target.getAttribute('data-duration');
                this.trigger('timerStarted', {duration: duration});
            }
        }
    });

    return Views;
});
