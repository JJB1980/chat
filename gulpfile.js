var gulp = require('gulp');
var watchLess = require('gulp-watch-less');
var less = require('gulp-less');

gulp.task('less', function() {
    return gulp.src('public/stylesheets/style.less')
        .pipe(watchLess('public/stylesheets/style.less'))
        .pipe(less())
        .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('watch', function() {
    gulp.watch('public/stylesheets/style.less', ['less']);  // Watch the .less file, then run the less task
});

gulp.task('default', ['less','watch']); // Default will run the 'less' and 'watch' task
