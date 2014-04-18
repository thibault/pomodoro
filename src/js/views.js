define(['backbone', 'd3', 'js/utils'], function(Backbone, d3, utils) {
    "use strict";

    var Views = {};

    Views.TimerView = Backbone.View.extend({
        initialize: function() {
            this.model = null;
            this._interval = null;
            this._renderTitle = false;
            this.render();

            _.bindAll(this, 'render', 'startTicking');
        },

        /**
         * Starts ticking the timer, updating it every second.
         */
        startRunning: function(pomodoro) {
            this.model = pomodoro;
            setTimeout(this.startTicking, 50);
        },

        /**
         * Accurate timer hack.
         *
         * If we start the setInterval at the exact same time
         * we start the pomodoro, the lack of accuracy of
         * the setTimeout function will create an irregularity
         * in the timer rendering.
         *
         * Hence, we wait a short time before starting the loop,
         * so every time the `render` method is called, we are sure
         * a different timer value will be displayed.
         */
        startTicking: function() {
            this.render();
            clearInterval(this._interval);
            this._interval = setInterval(this.render, 1000);
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
            'change': 'onConfigurationChange',
            'click input[type=checkbox]': 'toggleTitle'
        },
        buttons: [
            {
                field: '#pomodoro-duration',
                button: '#start-pomodoro-btn',
                option: 'pomodoroDuration'
            },
            {
                field: '#break-duration',
                button: '#start-break-btn',
                option: 'breakDuration'
            },
            {
                field: '#lbreak-duration',
                button: '#start-lbreak-btn',
                option: 'lbreakDuration'
            },
        ],

        initialize: function() {
            this.dynamicTitleCb = this.$el.find('#dynamicTitleCb');

            this.updateConfigurationForm();
            this.updateTimerButtons();
        },

        /**
         * Set configuration form default values to current
         * configuration values.
         */
        updateConfigurationForm: function() {
            this.dynamicTitleCb.prop('checked', this.model.get('dynamicTitleEnabled'));
            var model = this.model;
            _.each(this.buttons, function(data) {
                var field = $(data.field);
                var value = model.get(data.option) / 60000;
                field.val(value);
            });
        },

        /**
         * Set the data-duration attributes on timer buttons.
         */
        updateTimerButtons: function() {
            var model = this.model;
            _.each(this.buttons, function(data) {
                var button = $(data.button);
                var value = model.get(data.option);
                button.attr('data-duration', value);
            });

        },

        /**
         * Updates the configuration model object with data from the
         * configuration form.
         */
        onConfigurationChange: function() {
            this.model.set('dynamicTitleEnabled', this.isTitleDynamic());
            var model = this.model;
            _.each(this.buttons, function(data) {
                var field = $(data.field);
                var value = field.val() * 60000;
                model.set(data.option, value);
            });

            this.updateTimerButtons();
            this.trigger('configurationChanged');
        },

        toggleTitle: function() {
            this.trigger('dynamicTitleToggled');
        },

        isTitleDynamic: function() {
            return this.dynamicTitleCb.prop('checked');
        }
    });

    /**
     * Display a wonderful chart of pomodoro counts.
     */
    Views.ChartView = Backbone.View.extend({
        initialize: function(options) {
            this.initializeChart();

            // Required options for this view
            var chartOptions = ['interval', 'dateFormat', 'dataProvider'];
            _.extend(this, _.pick(options, chartOptions));

            _.bindAll(this, 'render');
            this.listenTo(this.collection, 'add', this.render);
            this.listenTo(this.collection, 'change', this.render);
        },

        /**
         * Creates the initial svg structure for the chart.
         */
        initializeChart: function() {
            this.margin = {top: 20, right: 20, bottom: 100, left: 100};
            this.width = this.$el.width() - this.margin.left - this.margin.right;
            this.height = 200;
            this.barHeight = 25;

            this.rootSvg = d3.select(this.el).append("svg")
                .attr('class', 'chart')
                .attr("width", this.$el.width())
                .attr("height", 300);
            this.svg = this.rootSvg
              .append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

            this.xAxis = this.svg.append("g")
                .attr("class", "x axis");

            this.yAxis = this.svg.append("g")
                .attr("class", "y axis");
        },

        /**
         * Generates the chart svg structure.
         */
        getScales: function(data) {
            var xDomain = [0, d3.max(data, function(d) { return d.pomodoros; })];
            var x = d3.scale.linear()
                .domain(xDomain)
                .range([0, this.width]);

            var yDomain = data.map(function(d) { return d.date; });
            var y = d3.scale.ordinal()
                .domain(yDomain)
                .rangeRoundBands([this.height, 0]);

            return {x: x, y: y};
        },

        /**
         * Get X and Y axis.
         */
        getAxes: function(data, scales) {
            var maxPomodoros = (d3.max(data, function(d) { return d.pomodoros; }));
            var xTicks = d3.min(20, maxPomodoros);
            var xAxis = d3.svg.axis()
                .scale(scales.x)
                .tickFormat(d3.format("d"))
                .ticks(xTicks)
                .orient("top");

            var format = d3.time.format(this.dateFormat);
            var yAxis = d3.svg.axis()
                .scale(scales.y)
                .tickFormat(function(d) {
                    return format(d);
                })
                .orient("left");

            return {x: xAxis, y: yAxis};
        },

        /**
         * Render the axes on the chart.
         */
        renderAxes: function(axes) {
            //this.xAxis
            //    .transition()
            //    .duration(1000)
            //    .call(axes.x);

            this.yAxis
                .transition()
                .duration(1000)
                .call(axes.y);

            //this.yAxis.selectAll("text")
            //    .style("text-anchor", "end")
            //    .attr("dx", "-.8em")
            //    .attr("dy", ".15em")
            //    .attr("transform", function(d) {
            //        return "rotate(-30)";
            //    });
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
                .attr("x", 0)
                .attr("y", function(d) { return scales.y(d.date); })
                .attr("height", this.barHeight - 2)
                .attr("width", 0)
                .attr("class", "bar");

            bars.transition()
                .duration(1000)
                .attr("y", function(d) { return scales.y(d.date); })
                .attr("width", function(d) { return scales.x(d.pomodoros); });
        },

        updateHeight: function(data) {
            this.height = this.barHeight * data.length;
            this.$el.css("height", this.height);
            this.rootSvg.attr("height", this.height);
        },

        render: function() {
            var data = this.dataProvider.getData();
            this.updateHeight(data);
            var scales = this.getScales(data);
            var axes = this.getAxes(data, scales);
            this.renderAxes(axes);
            this.renderData(data, scales);
            return this;
        }
    });

    /**
     * Display a wonderful pie with pomodoros data
     */
    Views.PieView = Backbone.View.extend({
        initialize: function(options) {
            this.initializePie();

            // Required options for this view
            var pieOptions = ['interval', 'dateFormat', 'dataProvider'];
            _.extend(this, _.pick(options, pieOptions));

            _.bindAll(this, 'render');
            this.listenTo(this.collection, 'add', this.render);
            this.listenTo(this.collection, 'change', this.render);

            var that = this;
            setInterval(function() {
                that.render();
            }, 4000);
        },

        /**
         * Creates the initial svg structure for the chart.
         */
        initializePie: function() {
            this.margin = {top: 20, right: 20, bottom: 100, left: 40};
            var width = this.$el.width() - this.margin.left - this.margin.right;
            var height = this.$el.height() - this.margin.top - this.margin.bottom;

            this.radius = Math.min(width, height) / 2;
            this.color = d3.scale.category20();

            this.pie = d3.layout.pie();

            this.arc = d3.svg.arc()
                .outerRadius(this.radius)
                .innerRadius(50);

            this.svg = d3.select(this.el).append("svg")
                .attr('class', 'chart')
                .attr("width", this.$el.width())
                .attr("height", this.$el.height())
              .append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

            this.piesvg = this.svg.append("g")
                .attr('class', 'pie')
                .attr("transform", "translate(" + this.$el.width() / 2 + "," + this.$el.height() / 2 + ")");

            this.piesvg.append("text")
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text('Projects');
        },

        /**
         * Display data on the chart.
         */
        renderData: function(data) {
            var that = this;

            this.pie
                .value(function(d) { return d.count; })
                .sort(null);

            var path = this.piesvg.datum(data).selectAll('path')
                .data(this.pie);

            path.enter()
                .append("path")
                .attr("fill", function(d, i) { return that.color(i); })
                .attr("d", that.arc)
                .each(function(d) { this._current = d; });

            path.exit()
                .remove();

            var arcTween = function(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function(t) {
                    return that.arc(i(t));
                };
            };

            path
                .transition()
                .duration(750)
                .attrTween('d', arcTween);
        },

        renderLegend: function(data) {
            this.legend = this.svg.selectAll('g.legend')
                .data(data);

            var that = this;
            var enter = this.legend.enter()
                .append('g')
                .attr('class', 'legend')
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            enter.append('rect')
                .attr("width", 18)
                .attr("height", 18)
                .style('fill', function(d, i) { return that.color(i); });

            enter.append("text")
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .text(function(d) { return d.project; });
        },

        render: function() {
            var data = this.dataProvider.getProjectsData();
            this.renderLegend(data);
            this.renderData(data);
            return this;
        }
    });

    Views.AnnotationView = Backbone.View.extend({
        events: {
            'submit': 'annotatePomodoro'
        },
        initialize: function() {
            this.input = this.$el.find('input[type="text"]');
        },
        annotatePomodoro: function(event) {
            event.preventDefault();
            var pomodoro = this.collection.last();
            var annotation = this.input.val();

            if (pomodoro && annotation) {
                var project = utils.extractProject(annotation);
                pomodoro.set('project', project);

                var tags = utils.extractTags(annotation);
                pomodoro.set('tags', tags);

                pomodoro.save();
            }

            this.input.val('');
        }
    });

    return Views;
});
