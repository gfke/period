'use strict';

var periodFormat = require('../lib/gfk-period');
var moment = require('moment');
var periodModes = periodFormat.PERIOD_MODES;


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
    expect(periodFormat._getNumberOfDaysInMonth(2015, 0)).toEqual(daysInJanuary2015);
  });

  it('setPeriodOnMoment should mutate provided moments days', function () {
    var momentToUse = moment('2015-01-01');
    var expectedDate = 5;
    periodFormat._setPeriodOnMoment(periodModes.DAYS, momentToUse, expectedDate);
    expect(momentToUse.date()).toEqual(expectedDate);
  });

  it('setPeriodOnMoment should mutate provided moments month', function () {
    var momentToUse = moment('2015-01-01');
    var expectedMonth = 11;
    periodFormat._setPeriodOnMoment(periodModes.MONTHS, momentToUse, expectedMonth);
    expect(momentToUse.month()).toEqual(expectedMonth);
  });

  it('setPeriodOnMoment should mutate provided moments years', function () {
    var momentToUse = moment('2015-01-01');
    var expectedYear = 11;
    periodFormat._setPeriodOnMoment(periodModes.YEARS, momentToUse, expectedYear);
    expect(momentToUse.year()).toEqual(expectedYear);
  });

  it('setPeriodOnMoment should mutate provided moments quarters', function () {
    var momentToUse = moment('2015-01-01');
    var expectedQuarter = 3;
    var expectedMonth = 6;
    periodFormat._setPeriodOnMoment(periodModes.QUARTERS, momentToUse, expectedQuarter);

    expect(momentToUse.quarter()).toEqual(expectedQuarter);
    expect(momentToUse.month()).toEqual(expectedMonth);
  });

  it('isNewPeriodGroup should return true for first of month if periodModes.DAYS', function () {
    var momentToUse = moment('2015-01-01'),
      isNewGroup;
    isNewGroup = periodFormat._isNewPeriodGroup(periodModes.DAYS, momentToUse)
    expect(isNewGroup).toBeTruthy();
  });

  it('isNewPeriodGroup should return false for second of month if periodModes.DAYS', function () {
    var momentToUse = moment('2015-01-02'),
      isNewGroup;
    isNewGroup = periodFormat._isNewPeriodGroup(periodModes.DAYS, momentToUse)
    expect(isNewGroup).toBeFalsy();
  });

  it('isNewPeriodGroup should return true for monday if periodModes.WEEKS', function () {
    var momentToUse = moment('2015-06-01'),//01.06.2015 is a monday
      isNewGroup;
    isNewGroup = periodFormat._isNewPeriodGroup(periodModes.WEEKS, momentToUse)
    expect(isNewGroup).toBeTruthy();
  });

  it('isNewPeriodGroup should return false for sunday if periodModes.WEEKS', function () {
    var momentToUse = moment('2015-05-31'),
      isNewGroup;
    isNewGroup = periodFormat._isNewPeriodGroup(periodModes.WEEKS, momentToUse)
    expect(isNewGroup).toBeFalsy();
  });

  it('isNewPeriodGroup should return true for first january if periodModes.MONTHS', function () {
    var momentToUse = moment('2015-01-01'),
      isNewGroup;
    isNewGroup = periodFormat._isNewPeriodGroup(periodModes.MONTHS, momentToUse)
    expect(isNewGroup).toBeTruthy();
  });

  it('isNewPeriodGroup should return false for thirty first december if periodModes.MONTHS', function () {
    var momentToUse = moment('2015-12-31'),
      isNewGroup;
    isNewGroup = periodFormat._isNewPeriodGroup(periodModes.MONTHS, momentToUse)
    expect(isNewGroup).toBeFalsy();
  });

});

describe('periodFormat', function () {

  it('should be defined', function () {
    expect(periodFormat).toBeDefined();
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
    periodInstance = periodFormat.createPeriod(periodMode, startDate, endDate);
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
    var period1 = periodFormat.createPeriod(periodModes.DAYS, startDate, endDate),
      period2 = periodFormat.createPeriod(periodModes.DAYS, startDate, endDate);

    expect(period1.isEqual(period2)).toBeTruthy();
  });

  it('isEqual should return false when both periods have the different start', function () {
    var period1 = periodFormat.createPeriod(periodModes.DAYS, startDate, endDate),
      falseDate = new Date(2000, 1, 1),
      period2 = periodFormat.createPeriod(periodModes.DAYS, falseDate, endDate);

    expect(period1.isEqual(period2)).toBeFalsy();
  });

  it('isEqual should return false when both periods have the different end', function () {
    var period1 = periodFormat.createPeriod(periodModes.DAYS, startDate, endDate),
      falseDate = new Date(2000, 1, 1),
      period2 = periodFormat.createPeriod(periodModes.DAYS, startDate, falseDate);

    expect(period1.isEqual(period2)).toBeFalsy();
  });

  it('isEqual should return false when both periods have the different periodMode', function () {
    var period1 = periodFormat.createPeriod(periodModes.DAYS, startDate, endDate),
      period2 = periodFormat.createPeriod(periodModes.MONTHS, startDate, endDate);

    expect(period1.isEqual(period2)).toBeFalsy();
  });

});
