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

gulp.task('copy', function(){
    return gulp.src([
        'bower_components/midi-soundfonts-partial/FluidR3_GM/acoustic_grand_piano-mp3/*',
        'bower_components/midi-soundfonts-partial/FluidR3_GM/acoustic_grand_piano-mp3.js',
        'bower_components/midi-soundfonts-partial/FluidR3_GM/acoustic_grand_piano-ogg.js',
        'assets/*'
    ]).pipe(copy('dist'));
});

 
gulp.task('deploy', ['default'], function () {
    return gulp.src('./dist/**/*')
        .pipe(deploy({push: true}));
});