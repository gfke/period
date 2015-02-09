# gfk-period 

A class that provides a DTO to represent a time period
and methods to render the dates of which it consists


## Install

```bash
$ npm install --save gfk-period
```


## Usage

```javascript
var periodFormat = require('gfk-period');
periodFormat(); // "awesome"
```

## API

```javascript
getIsoWeekNoFromTime (time);
```

```javascript
getIsoWeekYearFromTime (time, short); 
```

```javascript
getQuarterNoFromTime (time); 
```
```javascript
getHalfyearNoFromTime (time); 
```

## License

Copyright (c) 2015. Licensed under the MIT license.
