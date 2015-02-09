# gfk-period 

A class that provides a DTO to represent a time period
and methods to render the dates of which it consists


## Install

```bash
$ npm install --save gfk-period
```


## Usage

```javascript
var period = require('gfk-period');
var periodInstance = period.createPeriod(periodMode, start, end);
```

## API

```javascript
createPeriod (periodMode, start, end)
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
