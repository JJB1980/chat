
var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less1', function() {
    return gulp.src('public/stylesheets/style.less')
        .pipe(less())
        .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('less2', function() {
    return gulp.src('public/components/input/style.less')
        .pipe(less())
        .pipe(gulp.dest('public/components/input/'));
});

gulp.task('less3', function() {
    return gulp.src('public/components/rooms/style.less')
        .pipe(less())
        .pipe(gulp.dest('public/components/rooms/'));
});

gulp.task('watch', function() {
    gulp.watch('public/stylesheets/style.less', ['less1']);  // Watch the .less file, then run the less task
    gulp.watch('public/components/input/style.less', ['less2']);  // Watch the .less file, then run the less task
    gulp.watch('public/components/rooms/style.less', ['less3']);  // Watch the .less file, then run the less task
});

gulp.task('default', ['less1','less2','less3','watch']); // Default will run the 'less' and 'watch' task
