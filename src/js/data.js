define(['d3'], function(d3) {
    "use strict";

    var Data = {};

    /**
     * Initialize a data provider.
     *
     * @interval: a d3.time.* object
     * @collection: a Backbone pomodoro collection
     */
    Data.Provider = function(collection, interval, from, to) {
        this.collection = collection;
        this.interval = interval;
        this.from = from;
        this.to = to;
        _.bindAll(this, 'pomodoroFilter');
    };

    /**
     * Returns true if the given pomodoro startedAt property
     * is within the current provider date boundaries.
     */
    Data.Provider.prototype.pomodoroFilter = function(pomodoro) {
        return pomodoro.get('startedAt') >= this.from &&
               pomodoro.get('startedAt') <= this.to;
    };

    /**
     * Returns an associative array of the form:
     * [timestamp] = count
     *
     * We use integer timestamp instead of Date objects because
     * underscore converts them in date string anyway.
     */
    Data.Provider.prototype.countPomodorosByDate = function() {
        var that = this;
        var pomodoros = this.collection.filter(this.pomodoroFilter);

        var countData = _.countBy(pomodoros, function(pomodoro) {
            var date = new Date(pomodoro.get('startedAt'));
            return that.interval.floor(date).getTime();
        });
        return countData;
    };

    /**
     * Generate easily graphable data.
     *
     * From the current pomodoro collection, generates an array of objets
     * of the following form:
     *  [
     *      {date: <Date>, pomodoros: <Number>},
     *      {date: <Date>, pomodoros: <Number>},
     *  ]
     *
     *  Pomodoros will be grouped by the interval given in the
     *  constructor.
     */
    Data.Provider.prototype.getData = function() {
        var dates = this.interval.range(this.from, this.to);
        var countData = this.countPomodorosByDate();

        var padCount = _.map(dates, function(date) {
            var time = date.getTime();
            var count = countData[time] || 0;
            return {date: date, pomodoros: count};
        });

        return padCount;
    };

    /**
     * Returns an associative array of the form:
     * [project] = count
     */
    Data.Provider.prototype.countProjectsByDate = function() {
        var that = this;
        var pomodoros = this.collection.filter(this.pomodoroFilter);

        var countData = _.countBy(pomodoros, function(pomodoro) {
            var date = new Date(pomodoro.get('startedAt'));
            return that.interval.floor(date).getTime();
        });
        console.log(countData);
        return countData;
    };

    /**
     * Returns an array of objects:
     *  [
     *      {project: <String>, count: <Number>},
     *      {project: <String>, count: <Number>},
     *  ]
     */
    Data.Provider.prototype.getProjectsData = function() {
        var count = this.collection.countBy('project');
        var associativeCount = _.map(count, function(count, prj) {
            if (prj == 'null') {
                prj = 'ND';
            }
            return {project: prj, count: count};
        });
        return associativeCount;
    };

    return Data;
});
