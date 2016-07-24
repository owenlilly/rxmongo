const gulp = require('gulp');
const mocha = require('gulp-mocha');
const gutil = require('gulp-util');


gulp.task('mocha', function(){
   return gulp.src(['test/*.js'], {read: false})
            .pipe(mocha({reporter: 'list'})) 
            .on('error', gutil.log);
});

gulp.task('gulp-tests', function(){
    gulp.watch(['./**/*.js', 'test/**/*.js'], ['mocha']);
});

gulp.task('default', ['gulp-tests']);