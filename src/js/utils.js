define({
    /**
     * Converts a number of ms into a beautiful time string of
     * the mm:ss form.
     */
    prettifyTime: function(time) {
        var totalSeconds = Math.round(time / 1000);
        var minutes = parseInt(totalSeconds / 60);
        var seconds = totalSeconds % 60;

        var secondsStr;
        if (seconds < 10) {
            secondsStr = '0' + seconds;
        } else {
            secondsStr = '' + seconds;
        }

        var minutesStr;
        if (minutes < 10) {
            minutesStr = '0' + minutes;
        } else {
            minutesStr = '' + minutes;
        }

        return minutesStr + ':' + secondsStr;
    },

    /**
     * Use the notification html5 api to display a message to
     * user.
     */
    notify: function(title, options) {
        var _notify = function() {
            new Notification(title, options);
        };
        var Notification = window.Notification || window.mozNotification || window.webkitNotification;
        if (Notification) {
            var permission = Notification.permission;
            if (permission === "granted") {
                _notify();
            }
            else if (permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    if(!('permission' in Notification)) {
                        Notification.permission = permission;
                    }
                    if (permission === "granted") {
                        _notify();
                    }
                });
            }
        }
    }
});
