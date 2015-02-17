# gfk-period 

A class that provides a DTO to represent a time period
and methods to render the dates of which it consists

It will always expand the provided dates for start and end to be the start and end of the
period they are in.
Start date will always be monday, the first of the month, the beginning of the quarter or the year
End date will always be sunday, the last of the month, the end of the quarter or the year

Only if PeriodMode DAYS is chosen, the dates will keep their exact values

## Install

### As NPM package
```bash
$ npm install --save gfk-period
```
then
```javascript
 require('gfk-period');
```

### As bower component
```bash
$ bower install --save gfk-period
```
then 
```html
<script src="/lib/period.js"></script>
<!--You will need to include moment and moment-range libraries yourself-->
```
or 
```html
<script src="/dist/period.js"></script>
<!--Already includes moment and moment-range libraries as well-->
```


## Usage

```javascript
var period = require('gfk-period');
var periodInstance = period.createPeriod(periodMode, start, end);
```

## API

```javascript
createPeriod (periodMode, start, end)
//Factory method to create a period instance
```

```javascript
PERIOD_MODES = {
    DAYS: 'd',
    WEEKS: 'w',
    MONTHS: 'm',
    QUARTERS: 'q',
    HALF_YEAR: 'h',
    YEARS: 'y'
  };
  //enum for all available PeriodModes
```

```javascript
Period.prototype.getLongPeriodLabel();
//Get a label representing the complete period
```

```javascript
Period.prototype.isEqual
```

```javascript
Period.prototype.getLongStringForStart
```

```javascript
Period.prototype.getLongStringForEnd
```

```javascript
Period.prototype.getLongStringFormat
```

```javascript
Period.prototype.getShortStringFormat
```

```javascript
Period.prototype.getGroupStringFormat
```

```javascript
Period.prototype.getValueAsObjects
```

## License

Copyright (c) 2015. Not licensed under the any license.
