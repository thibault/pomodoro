define(['backbone', 'd3', 'js/utils', 'js/data'], function(Backbone, d3, utils, Data) {
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

    /**
     * Display a wonderful chart of pomodoro counts.
     */
    Views.ChartView = Backbone.View.extend({
        initialize: function() {
            this.initializeChart();
            this.interval = d3.time.day;
            this.dataProvider = new Data.Provider(this.collection, this.interval);
            this.dataProvider.setBoundaries(
                d3.time.monday.floor(new Date()),
                d3.time.monday.ceil(new Date())
            );

            _.bindAll(this, 'render');
            this.listenTo(this.collection, 'add', this.render);
        },

        /**
         * Creates the initial svg structure for the chart.
         */
        initializeChart: function() {
            this.margin = {top: 20, right: 20, bottom: 30, left: 40};
            this.width = this.$el.width() - this.margin.left - this.margin.right;
            this.height = this.$el.height() - this.margin.top - this.margin.bottom;

            this.svg = d3.select(this.el).append("svg")
                .attr('class', 'chart')
                .attr("width", this.$el.width())
                .attr("height", this.$el.height())
              .append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

            this.xAxis = this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.height + ")");

            this.yAxis = this.svg.append("g")
                .attr("class", "y axis");
            this.yAxis
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Pomodoros");
        },

        /**
         * Generates the chart svg structure.
         */
        getScales: function(data) {
            var format = d3.time.format("%Y-%m-%d");
            var xDomain = data.map(function(d) { return d.date; });
            var x = d3.scale.ordinal()
                .domain(xDomain)
                .rangeRoundBands([0, this.width], 0.1);

            var yDomain = [0, d3.max(data, function(d) { return d.pomodoros; })];
            var y = d3.scale.linear()
                .domain(yDomain)
                .range([this.height, 0]);

            return {x: x, y: y};
        },

        /**
         * Get X and Y axes.
         */
        getAxes: function(data, scales) {
            var dateFormat = d3.time.format("%Y-%m-%d");
            var xAxis = d3.svg.axis()
                .scale(scales.x)
                .ticks(this.interval, 1)
                .tickFormat(function(d) {
                    return dateFormat(d);
                })
                .orient("bottom");

            var maxPomodoros = (d3.max(data, function(d) { return d.pomodoros; }));
            var yTicks = d3.min(20, maxPomodoros);
            var yAxis = d3.svg.axis()
                .scale(scales.y)
                .tickFormat(d3.format("d"))
                .ticks(yTicks)
                .orient("left");

            return {x: xAxis, y: yAxis};
        },

        /**
         * Render the axes on the chart.
         */
        renderAxes: function(axes) {
            this.xAxis
                .transition()
                .duration(1000)
                .call(axes.x);

            this.yAxis
                .transition()
                .duration(1000)
                .call(axes.y);
        },

        /**
         * Display data on the chart.
         */
        renderData: function(data, scales) {
            var that = this;

            var bars = this.svg.selectAll('rect')
                .data(data, function(d) { return d.date; });

            bars.enter()
                .append("rect")
                .attr("class", "bar");

            bars.transition()
                .duration(1000)
                .attr("x", function(d) { return scales.x(d.date); })
                .attr("width", scales.x.rangeBand())
                .attr("y", function(d) { return scales.y(d.pomodoros); })
                .attr("height", function(d) { return that.height - scales.y(d.pomodoros); });
        },

        render: function() {
            var data = this.dataProvider.getData();
            var scales = this.getScales(data);
            var axes = this.getAxes(data, scales);
            this.renderAxes(axes);
            this.renderData(data, scales);
            return this;
        }
    });

    return Views;
});
