'use strict';

var gulp = require('gulp'),
useref = require('gulp-useref'),
deploy = require('gulp-gh-pages'),
copy = require('gulp-copy');

gulp.task('default', function () {
  var assets = useref.assets();

  return gulp.src('index.html')
  .pipe(assets)
  .pipe(assets.restore())
  .pipe(useref())
  .pipe(gulp.dest('dist'));

});


gulp.task('deploy', ['default'], function () {
  return gulp.src('./dist/**/*')
  .pipe(deploy({push: true}));
});
