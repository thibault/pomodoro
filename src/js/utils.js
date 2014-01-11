define({
    /**
     * Converts a number of ms into a beautiful time string of
     * the mm:ss form.
     */
    prettifyTime: function(time) {
        var totalSeconds = parseInt(time / 1000);
        var minutes = parseInt(totalSeconds / 60);
        seconds = totalSeconds % 60;

        var secondsStr;
        if (seconds < 10) {
            secondsStr = '0' + seconds;
        } else {
            secondsStr = '' + seconds;
        }

        if (minutes < 10) {
            minutesStr = '0' + minutes;
        } else {
            minutesStr = '' + minutes;
        }

        return minutesStr + ':' + secondsStr;
    }
});
