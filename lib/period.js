/*
 * gfk-period
 * user/repo
 *
 * Copyright (c) 2015
 * Licensed under the MIT license.
 */

'use strict';
//If require is available use it, elsewise trust on a global to be present
if (require) {
  var moment = require('moment') || moment;
  require('moment-range');
}
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var period,
  Period,
  PERIOD_MODES = {
    DAYS: 'd',
    WEEKS: 'w',
    MONTHS: 'm',
    QUARTERS: 'q',
    HALF_YEAR: 'h',
    YEARS: 'y'
  };

/**
 * A Period describes a time range from end to start and provides all dates
 * in the period in different formats
 * @param {string} periodMode Describes which time unit the period uses
 * @param {date|moment} start The date on which the period starts
 * @param {date|moment} end The date on which the period ends
 * @constructor
 */
Period = function (periodMode, start, end) {

  this.periodMode = periodMode;
  this.start = moment(start);
  this.end = moment(end);
  this.range = moment().range(start, end);
  this.values = null;
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
 * Returns DTO with all dates the period consists of, grouped by its PeriodMode
 * @returns array {{key: (string), value: (moment)}}
 */
Period.prototype.getValueAsObjects = function () {
  if (this.values !== null) {
    return this.values;
  }
  var periodInstance = this,
    momentRangeIterator = getMomentRangeIterator(this.periodMode);

  this.values = [];
  this.range.by(momentRangeIterator, function (momentToUse) {
    momentToUse.isNewGroup = isNewPeriodGroup(periodInstance.periodMode, momentToUse);
    periodInstance.values.push(momentToUse);
  });
  return this.values;
};


/**
 * Create a new key/value object from give moment with provided period set to a new value
 * Used as DTO for the front end
 * @param {string} periodMode Period which will be altered
 * @param {moment} momentToUse Moment object that will be cloned and formatted (provided moment will not be altered)
 * @param {number} [null] newValue number the given period will be set to
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
  }
}


function getShortPeriodFormat(periodMode) {
  if (periodMode === 'ytd') {
    return '[YTD] YY';
  }
  switch (periodMode[0]) {
    case PERIOD_MODES.DAYS:
      return 'DD.';
    case PERIOD_MODES.WEEKS:
      return '[KW] W YYYY';
    case PERIOD_MODES.MONTHS:
      return 'MMMM YYYY';
    case PERIOD_MODES.QUARTERS:
      return '[Q.]Q YYYY';
    case PERIOD_MODES.HALF_YEAR:
      return 'Q. [Halbjahr] YYYY';
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
      return '[KW] W YYYY';
    case PERIOD_MODES.MONTHS:
      return 'MMMM YYYY';
    case PERIOD_MODES.QUARTERS:
      return '[Q.]Q YYYY';
    case PERIOD_MODES.HALF_YEAR:
      return 'Q. [Halbjahr] YYYY';
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
      return '[Q%Q%] YYYY';
    case PERIOD_MODES.HALF_YEAR:
      return '[H%H%] YYYY';
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
 * @param periodMode
 * @param momentToUse
 * @returns {bool}
 */
function isNewPeriodGroup(periodMode, momentToUse) {
  switch (periodMode) {
    case PERIOD_MODES.DAYS:
      return momentToUse.date() === 1;
      break;
    case PERIOD_MODES.WEEKS:
      return momentToUse.date() === 1;
      break;
    case PERIOD_MODES.MONTHS:
    case PERIOD_MODES.QUARTERS:
      return momentToUse.dayOfYear() === 1;
      break;
    case PERIOD_MODES.YEARS:
      return true;
      break;
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


period = {};

/**
 * Create a new instance of Period
 * @param {string} periodMode PeriodMode of this instance
 * @param start Date when this period starts
 * @param end Date when this period ends
 * @returns {Period}
 */
period.createPeriod = function (periodMode, start, end) {
  return new Period(periodMode, start, end);
};

period.PERIOD_MODES = PERIOD_MODES;

//Expose privates for testing
period._getNumberOfDaysInMonth = getNumberOfDaysInMonth;
period._setPeriodOnMoment = setPeriodOnMoment;
period._isNewPeriodGroup = isNewPeriodGroup;

//if module is available use it to export the module, else we'll have
//the period global exposed
if (module) {
  module.exports = period;
}
