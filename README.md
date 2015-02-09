# gfk-period 

A class that provides a DTO to represent a time period
and methods to render the dates of which it consists


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
<!--You will need to include moment and moment-range libraries yourself --!>
```
or 
```html
<script src="/dist/period.js"></script>
<!--Already includes moment and moment-range libraries as well--!>
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
