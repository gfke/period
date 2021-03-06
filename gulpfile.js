'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var paths = {
  lint: ['./gulpfile.js', './lib/**/*.js'],
  watch: ['./gulpfile.js', './lib/**', './test/**/*.js', '!test/{temp,temp/**}'],
  tests: ['./test/**/*.js', '!test/{temp,temp/**}'],
  source: ['./lib/*.js'],
  build: './dist',
  module: './lib/period.js'
};

var filenames = {
  build: {
    scripts: 'period.js'
  },
  release: {
    scripts: 'period.min.js',
    map: './dist/period.map.json'
  }
};

var plumberConf = {};

if (process.env.CI) {
  plumberConf.errorHandler = function (err) {
    throw err;
  };
}

gulp.task('lint', function () {
  return gulp.src(paths.lint)
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.plumber(plumberConf))
    .pipe(plugins.jscs())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('istanbul', function (cb) {
  gulp.src(paths.source)
    .pipe(plugins.istanbul()) // Covering files
    .pipe(plugins.istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(paths.tests)
        .pipe(plugins.plumber(plumberConf))
        .pipe(plugins.mocha())
        .pipe(plugins.istanbul.writeReports()) // Creating the reports after tests runned
        .on('finish', function () {
          process.chdir(__dirname);
          cb();
        });
    });
});

gulp.task('browserify', function () {
  return browserify({
    debug: true,
    entries: [paths.module]
  })
    .plugin('minifyify', {map: filenames.release.map, output: filenames.release.map})
    .bundle()
    .pipe(source(filenames.release.scripts))
    .pipe(gulp.dest(paths.build));
});

gulp.task('unitTest', function () {
  gulp.src(paths.tests, {cwd: __dirname})
    .pipe(plugins.plumber(plumberConf))
    .pipe(plugins.jasmine({verbose: true, includeStackTrace: true}));
});

gulp.task('bump', ['test'], function () {
  var bumpType = plugins.util.env.type || 'patch'; // major.minor.patch

  return gulp.src(['./package.json', './bower.json'])
    .pipe(plugins.bump({type: bumpType}))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', ['test'], function () {
  gulp.watch(paths.watch, ['test']);
});

gulp.task('test', ['lint', 'unitTest']);

gulp.task('release', ['bump']);

gulp.task('default', ['test']);

gulp.task('build', ['browserify']);
