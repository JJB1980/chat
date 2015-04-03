var gulp = require('gulp');
Promise = require('promise');

gulp.task('less', function() {
    var less = require('gulp-less');
    
    return gulp.src('public/stylesheets/style.less')
        .pipe(less())
        .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('autoprefixer', function () {
    var postcss      = require('gulp-postcss');
//    var sourcemaps   = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer-core');

    return gulp.src('public/stylesheets/style.css')
//        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
//        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('watch', function() {
    gulp.watch('public/stylesheets/style.less', ['less']);  // Watch the .less file, then run the less task
});

gulp.task('default', ['watch']); // Default will run the 'less' and 'watch' task
