# gulp-zlanddoc [![Build Status](https://travis-ci.org/zland/gulp-zlanddoc.svg)](https://travis-ci.org/zland/gulp-zlanddoc)  

Build markdown docs for files and folders.  
The documentation for the plugin is created using gulp-zlanddoc.  
Just take a look into gulpfile.js or continue reading Installation and Usage instructions.  

## Installation

`npm install gulp-zlanddoc --save-dev`

## Usage for creating folder descriptions

This will append folder descripions to your readme files.

```javascript
var gulp = require('gulp');
var zlanddoc = require('gulp-zlanddoc');

gulp.task('create-docs', ['create-markdown-docs'], function() {
  // search for readme files and exclude certain folders
  return gulp.src([
    './**/README.md',
    "!node_modules/**/*",
    "!node_modules"
  ])
  .pipe(zlanddoc())
  .pipe(gulp.dest('./'));
});
```

## Usage for creating folder and file descriptions

This will append folder and file descriptions to your README.md files.  
You should add a filedescription comment to each file:  

```javascript
/**
 * @filedescription Here comes he description
 * and some more
 */
```

```javascript
gulp.task('create-docs', ['create-markdown-docs'], function() {
  // search for readme files and exclude certain folders
  return gulp.src([
    './**/README.md',
    "!node_modules/**/*",
    "!node_modules"
  ])
  .pipe(zlanddoc({
    buildFileDescriptions: true,
    // these are the default extensions, no need to pass them
    fileExtensions: ['.js', '.jsx']
  }))
  .pipe(gulp.dest('./'));
});
```


<!-- start generated readme -->

## Directories  

### [lib](lib)  
contains the markdox custom formatter and custom template

## Files  

### [gulpfile.js](gulpfile.js.md)  
Gulfile for running the zlanddoc gulp plugin

### [index.js](index.js.md)  
gulp-plugin

### [index_test.js](index_test.js.md)  
test of the gulp-plugin

<!-- end generated readme -->
