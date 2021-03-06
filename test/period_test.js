'use strict';

var period = require('../lib/period');
var moment = require('moment');
var periodModes = period.PERIOD_MODES;


function indicesOf(array, element) {
    var idx = array.indexOf(element),
        indices = [];
    while (idx != -1) {
        indices.push(idx);
        idx = array.indexOf(element, idx + 1);
    }
    return indices
}

function countDatesInMoments(array, value) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        if (obj.date() === value) count++;
    }
    return count;
}

function countMonthsInMoments(array, value) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        if (obj.month() === value) count++;
    }
    return count;
}

describe('Test functions', function () {
    it('countDatesInMoments should return correct number of dates', function () {
        var testArray = [
            moment('2015-01-01'),
            moment('2015-02-02'),
            moment('2015-03-02')
        ];
        var countFirstOfMonths = countDatesInMoments(testArray, 1);
        var countSecondOfMonths = countDatesInMoments(testArray, 2);
        var countThirdOfMonths = countDatesInMoments(testArray, 3);

        expect(countFirstOfMonths).toEqual(1);
        expect(countSecondOfMonths).toEqual(2);
        expect(countThirdOfMonths).toEqual(0);
    });
});

describe('Helper functions', function () {
    it('getNumberOfDaysInMonth should return number of days in provided month', function () {
        var daysInJanuary2015 = 31;
        expect(period._getNumberOfDaysInMonth(2015, 0)).toEqual(daysInJanuary2015);
    });

    it('setPeriodOnMoment should mutate provided moments days', function () {
        var momentToUse = moment('2015-01-01');
        var expectedDate = 5;
        period._setPeriodOnMoment(periodModes.DAYS, momentToUse, expectedDate);
        expect(momentToUse.date()).toEqual(expectedDate);
    });

    it('setPeriodOnMoment should mutate provided moments month', function () {
        var momentToUse = moment('2015-01-01');
        var expectedMonth = 11;
        period._setPeriodOnMoment(periodModes.MONTHS, momentToUse, expectedMonth);
        expect(momentToUse.month()).toEqual(expectedMonth);
    });

    it('setPeriodOnMoment should mutate provided moments years', function () {
        var momentToUse = moment('2015-01-01');
        var expectedYear = 11;
        period._setPeriodOnMoment(periodModes.YEARS, momentToUse, expectedYear);
        expect(momentToUse.year()).toEqual(expectedYear);
    });

    it('setPeriodOnMoment should mutate provided moments quarters', function () {
        var momentToUse = moment('2015-01-01');
        var expectedQuarter = 3;
        var expectedMonth = 6;
        period._setPeriodOnMoment(periodModes.QUARTERS, momentToUse, expectedQuarter);

        expect(momentToUse.quarter()).toEqual(expectedQuarter);
        expect(momentToUse.month()).toEqual(expectedMonth);
    });

    describe('isNewPeriodGroup', function () {
        it('should return true for first of month if periodModes.DAYS', function () {
            var momentToUse = moment('2015-01-01'),
                isNewGroup;
            isNewGroup = period._isNewPeriodGroup(periodModes.DAYS, momentToUse)
            expect(isNewGroup).toBeTruthy();
        });

        it('should return false for second of month if periodModes.DAYS', function () {
            var momentToUse = moment('2015-01-02'),
                isNewGroup;
            isNewGroup = period._isNewPeriodGroup(periodModes.DAYS, momentToUse)
            expect(isNewGroup).toBeFalsy();
        });

        it('should return true for monday if periodModes.WEEKS', function () {
            var momentToUse = moment('2015-06-01'),//01.06.2015 is a monday
                isNewGroup;
            isNewGroup = period._isNewPeriodGroup(periodModes.WEEKS, momentToUse)
            expect(isNewGroup).toBeTruthy();
        });

        it('should return false for sunday if periodModes.WEEKS', function () {
            var momentToUse = moment('2015-05-31'),
                isNewGroup;
            isNewGroup = period._isNewPeriodGroup(periodModes.WEEKS, momentToUse)
            expect(isNewGroup).toBeFalsy();
        });

        it('should return true for first january if periodModes.MONTHS', function () {
            var momentToUse = moment('2015-01-01'),
                isNewGroup;
            isNewGroup = period._isNewPeriodGroup(periodModes.MONTHS, momentToUse)
            expect(isNewGroup).toBeTruthy();
        });

        it('should return false for thirty first december if periodModes.MONTHS', function () {
            var momentToUse = moment('2015-12-31'),
                isNewGroup;
            isNewGroup = period._isNewPeriodGroup(periodModes.MONTHS, momentToUse)
            expect(isNewGroup).toBeFalsy();
        });

    });

    describe('setPeriodMinimum', function () {
        it('should set monday for provided date if periodModes.WEEKS', function () {
            var momentToUse = moment('2015/02/15');

            period._setPeriodMinimum(momentToUse, periodModes.WEEKS);

            expect(momentToUse.weekday()).toEqual(0);
            expect(momentToUse.date()).toEqual(9);

        });

        it('should set first of month for provided date if periodModes.MONTHS', function () {
            var momentToUse = moment('2015-02-17');

            period._setPeriodMinimum(momentToUse, periodModes.MONTHS);

            expect(momentToUse.date()).toEqual(1);
        });

        it('should set first of january for provided date in first quarter if periodModes.QUARTERS', function () {
            var momentToUse = moment('2015-02-17');

            period._setPeriodMinimum(momentToUse, periodModes.QUARTERS);

            expect(momentToUse.date()).toEqual(1);
            expect(momentToUse.month()).toEqual(0);
        });

        it('should set first of april for provided date in second quarter if periodModes.QUARTERS', function () {
            var momentToUse = moment('2015-05-17');

            period._setPeriodMinimum(momentToUse, periodModes.QUARTERS);

            expect(momentToUse.date()).toEqual(1);
            expect(momentToUse.month()).toEqual(3);
        });

        it('should set first of januar for provided date if periodModes.YEARS', function () {
            var momentToUse = moment('2015-05-17');

            period._setPeriodMinimum(momentToUse, periodModes.YEARS);

            expect(momentToUse.date()).toEqual(1);
            expect(momentToUse.month()).toEqual(0);
        });
    });

    describe('setPeriodMaximum', function () {
        it('should set sunday for provided date if periodModes.WEEKS', function () {
            var momentToUse = moment('2015-02-17');

            period._setPeriodMaximum(momentToUse, periodModes.WEEKS);

            expect(momentToUse.weekday()).toEqual(6);
            expect(momentToUse.date()).toEqual(22);
        });

        it('should set 31th for provided date in january if periodModes.MONTHS', function () {
            var momentToUse = moment('2015-01-17');

            period._setPeriodMaximum(momentToUse, periodModes.MONTHS);

            expect(momentToUse.date()).toEqual(31);
        });

        it('should set 28th for provided date in february if periodModes.MONTHS', function () {
            var momentToUse = moment('2015-02-17');

            period._setPeriodMaximum(momentToUse, periodModes.MONTHS);

            expect(momentToUse.date()).toEqual(28);
        });

        it('should set 30th for provided date in april if periodModes.MONTHS', function () {
            var momentToUse = moment('2015-04-17');

            period._setPeriodMaximum(momentToUse, periodModes.MONTHS);

            expect(momentToUse.date()).toEqual(30);
        });

        it('should set last of march for provided date in first quarter if periodModes.QUARTERS', function () {
            var momentToUse = moment('2015-02-17');

            period._setPeriodMaximum(momentToUse, periodModes.QUARTERS);

            expect(momentToUse.date()).toEqual(31);
            expect(momentToUse.month()).toEqual(2);
        });

        it('should set last of june for provided date in second quarter if periodModes.QUARTERS', function () {
            var momentToUse = moment('2015-05-17');

            period._setPeriodMaximum(momentToUse, periodModes.QUARTERS);

            expect(momentToUse.date()).toEqual(30);
            expect(momentToUse.month()).toEqual(5);
        });

        it('should set last of september for provided date in third quarter if periodModes.QUARTERS', function () {
            var momentToUse = moment('2015-08-17');

            period._setPeriodMaximum(momentToUse, periodModes.QUARTERS);

            expect(momentToUse.date()).toEqual(30);
            expect(momentToUse.month()).toEqual(8);
        });

        it('should set last of december for provided date in fouth quarter if periodModes.QUARTERS', function () {
            var momentToUse = moment('2015-11-17');

            period._setPeriodMaximum(momentToUse, periodModes.QUARTERS);

            expect(momentToUse.date()).toEqual(31);
            expect(momentToUse.month()).toEqual(11);
        });

        it('should set 31th of december for provided date if periodModes.YEARS', function () {
            var momentToUse = moment('2015-05-17');

            period._setPeriodMaximum(momentToUse, periodModes.YEARS);

            expect(momentToUse.date()).toEqual(31);
            expect(momentToUse.month()).toEqual(11);
        });
    });

    describe('expandRangeToCompletePeriods', function () {
        it('should expand one day to one week if  periodModes.WEEKS', function () {
            var startMoment = moment('2015-05-18');//monday
            var endMoment = moment('2015-05-18');

            period._expandRangeToCompletePeriods(startMoment, endMoment, periodModes.WEEKS);

            //Start momonet should not change
            expect(startMoment.date()).toEqual(18);
            expect(startMoment.month()).toEqual(4);

            //End moment should be end of week
            expect(endMoment.date()).toEqual(24);
            expect(endMoment.month()).toEqual(4);
        });

        it('should expand one day to one month if periodModes.MONTH', function () {
            var startMoment = moment('2015-05-18');//monday
            var endMoment = moment('2015-05-18');

            period._expandRangeToCompletePeriods(startMoment, endMoment, periodModes.MONTHS);

            expect(startMoment.date()).toEqual(1);
            expect(startMoment.month()).toEqual(4);

            expect(endMoment.date()).toEqual(31);
            expect(endMoment.month()).toEqual(4);
        });

        it('should expand one day in second quarter to complete third quarter if periodModes.QUARTERS', function () {
            var startMoment = moment('2015-05-18');//monday
            var endMoment = moment('2015-05-18');

            period._expandRangeToCompletePeriods(startMoment, endMoment, periodModes.QUARTERS);

            expect(startMoment.date()).toEqual(1);
            expect(startMoment.month()).toEqual(3);

            expect(endMoment.date()).toEqual(30);
            expect(endMoment.month()).toEqual(5);
        });
    });

});

describe('period', function () {

    it('should be defined', function () {
        expect(period).toBeDefined();
    });

});

describe('Period', function () {
    var startDate,
        endDate,
        periodInstance;

    //Test data
    var startDateYear = 2015,
        startDateMonth = 1,
        startDateDay = 1,
        endDateYear = 2015,
        endDateMonth = 12,
        endDateDay = 31;

    function instanciatePeriod(periodMode) {
        periodInstance = period.createPeriod(periodMode, startDate, endDate);
    }

    beforeEach(function () {
        startDate = new Date(startDateYear, startDateMonth, startDateDay);
        endDate = new Date(endDateYear, endDateMonth, endDateDay);
    });

    it('createPeriod should return instance of Period', function () {
        instanciatePeriod(periodModes.DAYS);

        expect(periodInstance).toBeDefined();
        expect(periodInstance.start.date()).toEqual(startDateDay);
        expect(periodInstance.end.date()).toEqual(endDateDay);
    });

    it('getValueAsObjects should return correct number of days if PeriodMode is day', function () {
        instanciatePeriod(periodModes.DAYS);

        var days = periodInstance.getValueAsObjects();
        expect(days.length).toEqual(365);
    });

    it('getValueAsObjects should return correct days if PeriodMode is day', function () {
        instanciatePeriod(periodModes.DAYS);

        var days = periodInstance.getValueAsObjects(),
            numberOfFirsts = countDatesInMoments(days, 1),
            numberOfThirtyFirsts = countDatesInMoments(days, 31);

        expect(numberOfFirsts).toEqual(12);
        expect(numberOfThirtyFirsts).toEqual(7);
    });

    it('getValueAsObjects should return correct number of month if PeriodMode is month', function () {
        instanciatePeriod(periodModes.MONTHS);

        var months = periodInstance.getValueAsObjects();
        expect(months.length).toEqual(12);
    });

    it('getValueAsObjects should return correct months if PeriodMode is month', function () {
        instanciatePeriod(periodModes.MONTHS);
        var months = periodInstance.getValueAsObjects();
        for (var i = 1; i < 12; i++) {
            expect(countMonthsInMoments(months, i)).toEqual(1);
        }
    });

    it('isEqual should return true when both periods have the same start, end and periodMode', function () {
        var period1 = period.createPeriod(periodModes.DAYS, startDate, endDate),
            period2 = period.createPeriod(periodModes.DAYS, startDate, endDate);

        expect(period1.isEqual(period2)).toBeTruthy();
    });

    it('isEqual should return false when both periods have the different start', function () {
        var period1 = period.createPeriod(periodModes.DAYS, startDate, endDate),
            falseDate = new Date(2000, 1, 1),
            period2 = period.createPeriod(periodModes.DAYS, falseDate, endDate);

        expect(period1.isEqual(period2)).toBeFalsy();
    });

    it('isEqual should return false when both periods have the different end', function () {
        var period1 = period.createPeriod(periodModes.DAYS, startDate, endDate),
            falseDate = new Date(2000, 1, 1),
            period2 = period.createPeriod(periodModes.DAYS, startDate, falseDate);

        expect(period1.isEqual(period2)).toBeFalsy();
    });

    it('isEqual should return false when both periods have the different periodMode', function () {
        var period1 = period.createPeriod(periodModes.DAYS, startDate, endDate),
            period2 = period.createPeriod(periodModes.MONTHS, startDate, endDate);

        expect(period1.isEqual(period2)).toBeFalsy();
    });

    it('isDirty should be false if date has been created', function () {
        var period1 = period.createPeriod(periodModes.DAYS, startDate, endDate);

        expect(period1.isDirty()).toBeFalsy();
    });

    it('isDirty should be true if date has been altered', function () {
        var period1 = period.createPeriod(periodModes.DAYS, startDate, endDate);

        expect(period1.isDirty()).toBeFalsy();
        period1.start = moment(endDate);
        expect(period1.isDirty()).toBeTruthy();
    });

    it('values should update if date has been altered', function () {
        var period1 = period.createPeriod(periodModes.DAYS, startDate, endDate);
        var valuesBeforeChange = period1.getValueAsObjects(),
            valuesAfterChange;

        period1.start = moment(endDate);
        valuesAfterChange = period1.getValueAsObjects();

        expect(valuesBeforeChange.length).not.toEqual(valuesAfterChange.length);

    });

});
