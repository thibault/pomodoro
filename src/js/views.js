define(['backbone', 'd3', 'js/utils'], function(Backbone, d3, utils) {
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

    Views.ChartView = Backbone.View.extend({
        initialize: function() {
            this.margin = {top: 20, right: 20, bottom: 30, left: 40};
            this.width = this.$el.width() - this.margin.left - this.margin.right;
            this.height = this.$el.height() - this.margin.top - this.margin.bottom;
        },

        /**
         * Generate easily graphable data.
         *
         * From the current pomodoro collection, generates an array of objets
         * of the following form:
         *  [
         *      {date: timestamp, pomodoros: x},
         *      {date: timestamp, pomodoros: y},
         *  ]
         *
         * We will group the pomodoros by day, i.e we need to extract the
         * exact date of each pomodoro and convert it to a common date for
         * each day.
         */
        chartData: function() {
            var pomodoroSets = _.groupBy(this.collection.models, function(pomodoro) {
                var date = new Date(pomodoro.get('startedAt'));
                return new Date(date.getFullYear(), date.getMonth(), date.getDay()).getTime();
            });

            var format = d3.time.format("%Y-%m-%d");
            var data = _.map(pomodoroSets, function(pomodoros, date) {
                return {date: format(new Date(parseInt(date))), pomodoros: pomodoros.length};
            });
            return data;
        },

        /**
         * Generates the chart svg structure.
         */
        renderChart: function() {
            this.svg = d3.select(this.el).append("svg")
                .attr('class', 'chart')
                .attr("width", this.$el.width())
                .attr("height", this.$el.height())
              .append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

            var format = d3.time.format("%Y-%m-%d");
            var xDomain = this.data.map(function(d) { return d.date; });
            this.x = d3.scale.ordinal()
                .domain(xDomain)
                .rangeRoundBands([0, this.width], 0.1);

            var yDomain = [0, d3.max(this.data, function(d) { return d.pomodoros; })];
            this.y = d3.scale.linear()
                .domain(yDomain)
                .range([this.height, 0]);
        },

        /**
         * Display axes and legends on chart.
         */
        renderAxes: function() {
            var xAxis = d3.svg.axis()
                .scale(this.x)
                .ticks(d3.time.day, 1)
                .orient("bottom");

            this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.height + ")")
                .call(xAxis);

            var yAxis = d3.svg.axis()
                .scale(this.y)
                .tickFormat(d3.format("d"))
                .ticks(d3.max(this.data, function(d) { return d.pomodoros; }))
                .orient("left");

            this.svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Pomodoros");
        },

        /**
         * Display data on the chart.
         */
        renderData: function() {
            var that = this;
            this.svg.selectAll('rect')
                .data(this.data, function(d) { return d.date; })
              .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return that.x(d.date); })
                .attr("y", function(d) { return that.y(d.pomodoros); })
                .attr("height", function(d) { return that.height - that.y(d.pomodoros); })
                .attr("width", this.x.rangeBand());
        },

        render: function() {
            this.data = this.chartData();
            this.renderChart();
            this.renderAxes();
            this.renderData();
            return this;
        }
    });

    return Views;
});
