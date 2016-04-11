/*global define*/
define([
    'jquery',
    'bootstrap-datetimepicker'
], function() {
    // Datetime picker
    $.fn.datetimepicker.defaults = $.extend({}, $.fn.datetimepicker.defaults, {
        // pickDate: true, //en/disables the date picker
        // pickTime: false, //en/disables the time picker
        // useMinutes: true, //en/disables the minutes picker
        // useSeconds: true, //en/disables the seconds picker
        // useCurrent: true, //when true, picker will set the value to the current date/time
        // minuteStepping: 5, //set the minute stepping
        // minDate: '1/1/1900', //set a minimum date
        // maxDate: '', //set a maximum date (defaults to today +100 years)
        // showToday: true, //shows the today indicator
        locale: 'zh-cn', //sets language locale
        // defaultDate: '', //sets a default date, accepts js dates, strings and moment objects
        // disabledDates: [], //an array of dates that cannot be selected
        // enabledDates: [], //an array of dates that can be selected
        // icons: {
        //     time: 'glyphicon glyphicon-time',
        //     date: 'glyphicon glyphicon-calendar',
        //     up: 'glyphicon glyphicon-chevron-up',
        //     down: 'glyphicon glyphicon-chevron-down'
        // },
        // useStrict: false, //use 'strict' when validating dates
        // sideBySide: false, //show the date and time picker side by side
        // daysOfWeekDisabled: [] //for example use daysOfWeekDisabled: [0,6] to disable weekends
    });
});
