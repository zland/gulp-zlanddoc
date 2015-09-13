/**
 * @filedescription Gulfile for running the zlanddoc gulp plugin
 */

'use strict';

var gulp = require('gulp');
var zlanddoc = require('./index');
var markdox = require('gulp-markdox');
var rename = require('gulp-rename');

gulp.task('create-markdown-docs', function() {
  return gulp.src(
    ["./**/*.js", "!node_modules/**/*", '!gulp/**/*']
  )
  .pipe(markdox({
    template: __dirname + '/lib/markdoxCustomTemplate.ejs',
    formatter: zlanddoc.markdoxCustomFormatter.format
  }))
  .pipe(rename(function (path) {
    path.extname = path.extname + ".md";
  }))
  .pipe(gulp.dest("./"));
});


gulp.task('create-docs', ['create-markdown-docs'], function() {
  // search for readme files and exclude certain folders
  return gulp.src([
    './**/README.md',
    "!node_modules/**/*",
    "!node_modules"
  ])
  .pipe(zlanddoc({
    buildFileDescriptions: true
  }))
  .pipe(gulp.dest('./'));
});
