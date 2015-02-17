/*
 * gfk-period
 *
 * Copyright (c) 2015
 */
'use strict';
/*global module, define, require */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        module.exports = factory(require('moment'), require('moment-range'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['moment'], factory);
    } else {
        // Global Variables
        root.period = factory(root.moment);
    }
}(this, function (moment) {
    moment.locale('de', {
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    var api,
        Period,
        PERIOD_MODES = {
            DAYS: 'd',
            WEEKS: 'w',
            MONTHS: 'm',
            QUARTERS: 'q',
            YEARS: 'y'
        };

    /**
     * A Period describes a time range from end to start and provides all dates
     * in the period in different formats
     * The provided dates are always expanded to stretch over complete periods
     * @param {string} periodMode Describes which time unit the period uses
     * @param {date|moment} start The date on which the period starts
     * @param {date|moment} end The date on which the period ends
     * @constructor
     */
    Period = function (periodMode, start, end) {
        //TODO:Make variables private and expose setters and getters
        this.periodMode = periodMode;
        this.start = moment(start);
        this.end = moment(end);

        expandRangeToCompletePeriods(this.start, this.end, this.periodMode);

        this.values = null;
        this.checksum = this.getChecksum();

    };

    Period.prototype.getLongPeriodLabel = function () {
        var labelStart = this.getLongStringForStart(),
            labelEnd = this.getLongStringForEnd();

        return labelStart + ' - ' + labelEnd;
    };

    Period.prototype.isEqual = function (periodToCompare) {
        var hasSameStart,
            hasSameEnd,
            hasSamePeriodMode;

        hasSameStart = this.start.isSame(periodToCompare.start);
        hasSameEnd = this.end.isSame(periodToCompare.end);
        hasSamePeriodMode = this.periodMode === periodToCompare.periodMode;

        return hasSameStart && hasSameEnd && hasSamePeriodMode;
    };

    Period.prototype.getChecksum = function () {
        var startCheckSum = this.start.unix(),
            endCheckSum = this.end.unix();

        return this.periodMode + '/' + startCheckSum + '/' + endCheckSum;
    };

    Period.prototype.isDirty = function () {
        return this.checksum !== this.getChecksum();
    };

    Period.prototype.getLongStringForStart = function () {
        return this.start.format(getLongPeriodFormat(this.periodMode));
    };

    Period.prototype.getLongStringForEnd = function () {
        return this.end.format(getLongPeriodFormat(this.periodMode));
    };

    Period.prototype.getLongStringFormat = function () {
        return getLongPeriodFormat(this.periodMode);
    };

    Period.prototype.getShortStringFormat = function () {
        return getShortPeriodFormat(this.periodMode);
    };

    Period.prototype.getGroupStringFormat = function () {
        return getPeriodGroupFormat(this.periodMode);
    };

    /**
     * Returns array of DTOs with all dates the period consists of, grouped by its PeriodMode
     * Checks if the start and end values have been altered and recalculates if so
     * @returns array {{key: (string), value: (moment)}}
     */
    Period.prototype.getValueAsObjects = function () {
        if (this.values !== null && this.isDirty() === false) {
            return this.values;
        }
        var periodInstance = this,
            momentRangeIterator = getMomentRangeIterator(this.periodMode),
            currentRange = moment().range(this.start, this.end);


        this.values = [];
        currentRange.by(momentRangeIterator, function (momentToUse) {
            momentToUse.isNewGroup = isNewPeriodGroup(periodInstance.periodMode, momentToUse);
            periodInstance.values.push(momentToUse);
        });

        this.checksum = this.getChecksum();
        return this.values;
    };

    function expandRangeToCompletePeriods(start, end, periodMode) {
        setPeriodToMinimum(start, periodMode);
        setPeriodToMaximum(end, periodMode);
    }

    function setPeriodToMinimum(momentToUse, periodMode) {
        switch (periodMode) {
            case PERIOD_MODES.WEEKS:
                momentToUse.weekday(0);
                break;
            case PERIOD_MODES.MONTHS:
                momentToUse.date(1);
                break;
            case PERIOD_MODES.QUARTERS:
                momentToUse.date(1);
                switch (momentToUse.quarter()) {
                    case 1:
                        momentToUse.month(0);
                        break;
                    case 2:
                        momentToUse.month(3);
                        break;
                    case 3:
                        momentToUse.month(6);
                        break;
                    case 4:
                        momentToUse.month(9);
                        break;
                }
                break;
            case PERIOD_MODES.YEARS:
                momentToUse.date(1);
                momentToUse.month(0);
                break;
        }
    }

    function setPeriodToMaximum(momentToUse, periodMode) {
        switch (periodMode) {
            case PERIOD_MODES.WEEKS:
                momentToUse.weekday(6);
                break;
            case PERIOD_MODES.MONTHS:
                momentToUse.date(1).add(1, 'months').subtract(1, 'days');
                break;
            case PERIOD_MODES.QUARTERS:
                //When setting dates to maximum, always set the month first
                // else you might set it to a higher date than the current month
                // and it will bubble up and mess up the date
                switch (momentToUse.quarter()) {
                    case 1:
                        momentToUse.month(2);
                        momentToUse.date(31);
                        break;
                    case 2:
                        momentToUse.month(5);
                        momentToUse.date(30);
                        break;
                    case 3:
                        momentToUse.month(8);
                        momentToUse.date(30);
                        break;
                    case 4:
                        momentToUse.month(11);
                        momentToUse.date(31);
                        break;
                }
                break;
            case PERIOD_MODES.YEARS:
                momentToUse.month(11);
                momentToUse.date(31);
                break;
        }
    }

    /**
     * Create a new key/value object from give moment with provided period set to a new value
     * Used as DTO for the front end
     * @param {string} periodMode Period which will be altered
     * @param {moment} momentToUse Moment object that will be cloned and formatted (provided moment will not be altered)
     * @param {number} [newValue=null] number the given period will be set to
     * @returns {{key: (string), value: (moment)}}
     */
    function createDateObject(periodMode, momentToUse, newValue) {
        var formatToUse = getShortPeriodFormat(periodMode),
            clonedMoment = moment(momentToUse);

        if (newValue) {
            setPeriodOnMoment(periodMode, clonedMoment, newValue);
        }

        return {
            key: clonedMoment.format(formatToUse),
            value: clonedMoment
        };
    }

    function getShortPeriodFormat(periodMode) {
        if (periodMode === 'ytd') {
            return '[YTD] YY';
        }
        switch (periodMode[0]) {
            case PERIOD_MODES.DAYS:
                return 'DD.';
            case PERIOD_MODES.WEEKS:
                return '[KW] W GGGG';
            case PERIOD_MODES.MONTHS:
                return 'MMMM YYYY';
            case PERIOD_MODES.QUARTERS:
                return '[Q.]Q YYYY';
            case PERIOD_MODES.YEARS:
                return 'YYYY';
            case PERIOD_MODES.TOTAL:
                return '[Total]';
        }
        throw 'No short period format found for "' + periodMode + '"';
    }

    function getLongPeriodFormat(periodMode) {
        if (periodMode === 'ytd') {
            return '[YTD] YYYY';
        }
        switch (periodMode[0]) {
            case PERIOD_MODES.DAYS:
                return 'DD.MM.YYYY';
            case PERIOD_MODES.WEEKS:
                return '[KW] W GGGG';
            case PERIOD_MODES.MONTHS:
                return 'MMMM YYYY';
            case PERIOD_MODES.QUARTERS:
                return '[Q.]Q YYYY';
            case PERIOD_MODES.YEARS:
                return 'YYYY';
            case PERIOD_MODES.TOTAL:
                return '[Total]';
        }
        throw 'No long period format found for "' + periodMode + '"';
    }

    function getPeriodGroupFormat(periodMode) {
        if (periodMode === 'ytd') {
            return '[YTD] YYYY';
        }
        switch (periodMode[0]) {
            case PERIOD_MODES.DAYS:
                return 'DD. MMMM';
            case PERIOD_MODES.WEEKS:
                return '[KW] W GGGG';
            case PERIOD_MODES.MONTHS:
                return 'MMMM YYYY';
            case PERIOD_MODES.QUARTERS:
                return '[Quartal] Q YYYY';
            case PERIOD_MODES.YEARS:
                return 'YYYY';
            case PERIOD_MODES.TOTAL:
                return '[Total]';
        }
        throw 'No long period format found for "' + periodMode + '"';
    }

    function getMomentSetterFunction(periodMode) {
        switch (periodMode) {
            case PERIOD_MODES.DAYS:
                return 'date';
            case PERIOD_MODES.WEEKS:
                return 'week';
            case PERIOD_MODES.MONTHS:
                return 'month';
            case PERIOD_MODES.QUARTERS:
                return 'quarter';
            case PERIOD_MODES.YEARS:
                return 'year';
        }
        throw 'No moment setter found for period "' + periodMode + '"';
    }

    /**
     * Show if the group of the date change according to given periodMode
     * Days are grouped in months, so this will return true on the first of every month
     * @param {string} periodMode
     * @param {moment} momentToUse
     * @returns {boolean}
     */
    function isNewPeriodGroup(periodMode, momentToUse) {
        switch (periodMode) {
            case PERIOD_MODES.DAYS:
                return momentToUse.date() === 1;
            case PERIOD_MODES.WEEKS:
                return momentToUse.date() === 1;
            case PERIOD_MODES.MONTHS:
            case PERIOD_MODES.QUARTERS:
                return momentToUse.dayOfYear() === 1;
            case PERIOD_MODES.YEARS:
                return true;
        }
        throw 'No newGroup rule found for period "' + periodMode + '"';
    }

    function getMomentRangeIterator(periodMode) {
        switch (periodMode) {
            case PERIOD_MODES.DAYS:
                return 'days';
            case PERIOD_MODES.WEEKS:
                return 'weeks';
            case PERIOD_MODES.MONTHS:
                return 'months';
            case PERIOD_MODES.QUARTERS:
                return 'quarters';
            case PERIOD_MODES.YEARS:
                return 'years';
        }
        throw 'No moment setter found for period "' + periodMode + '"';
    }

    function setPeriodOnMoment(periodMode, moment, value) {
        var setterFunction = getMomentSetterFunction(periodMode);
        moment[setterFunction](value);
    }

    /**
     * Get the count of days in a specific month
     * @param {number} year Year of the date to be used
     * @param {number} month Zero based month to be used
     * @returns {number}
     */
    function getNumberOfDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    api = {};

    /**
     * Create a new instance of Period
     * @param {string} periodMode PeriodMode of this instance
     * @param {date|moment} start The date on which the period starts
     * @param {date|moment} end The date on which the period ends
     * @returns {Period}
     */
    api.createPeriod = function (periodMode, start, end) {
        return new Period(periodMode, start, end);
    };

    api.PERIOD_MODES = PERIOD_MODES;

//Expose privates for testing
    api._getNumberOfDaysInMonth = getNumberOfDaysInMonth;
    api._setPeriodOnMoment = setPeriodOnMoment;
    api._isNewPeriodGroup = isNewPeriodGroup;
    api._setPeriodMinimum = setPeriodToMinimum;
    api._setPeriodMaximum = setPeriodToMaximum;
    api._expandRangeToCompletePeriods = expandRangeToCompletePeriods;

    return api;

}));
