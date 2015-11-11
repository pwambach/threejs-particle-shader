'use strict';

var gulp = require('gulp'),
deploy = require('gulp-gh-pages'),
watch = require('gulp-watch'),
webpack = require('webpack'),
webpackConf = require('./webpack.config.js');

gulp.task("webpack", function(callback) {
  webpack(webpackConf, function(err, stats) {
    if(err) throw new gutil.PluginError("webpack", err);
    callback();
  });
});

gulp.task('watch', function(){
  gulp.watch('src/**/*', ['webpack']);
  gulp.watch('dist/**/*', ['copy']);
});

gulp.task("copy", function(){
  gulp.src("dist/**/*")
    .pipe(gulp.dest('example/js'))
  gulp.src([
      "node_modules/three/three.min.js",
      "node_modules/jquery/dist/jquery.min.js"
    ])
    .pipe(gulp.dest('example/js/vendor'));
});

gulp.task('deploy', ['webpack'], function () {
  return gulp.src('example/**/*')
  .pipe(deploy({push: true}));
});
