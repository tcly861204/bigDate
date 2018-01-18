const gulp = require('gulp');
const less = require('gulp-less');
const stylus = require('gulp-stylus');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnext = require('cssnext');
const precss = require('precss');
const cssmin = require('gulp-cssmin');




const _ts = require('gulp-typescript');


gulp.task('stylusTask', function() {
    return gulp.src('./css/*.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({
            linenos: true,
            compress: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dev/css'));
});

gulp.task('postcssTask',['stylusTask'],function(){
    var processors = [autoprefixer, cssnext, precss];
    gulp.src('./dev/css/*.css')
        .pipe(postcss(processors))
        .pipe(cssmin())
        .pipe(gulp.dest('build/css'));
});

gulp.task('LessTask', function() {
    var processors = [autoprefixer, cssnext, precss];
    gulp.src('Less/*.less')
        .pipe(less())
        .pipe(postcss(processors))
        .pipe(cssmin())
        .pipe(gulp.dest('./build/css/'));
});

gulp.task('tsTask', function () {
    gulp.src('ts/*ts')
        .pipe(_ts())
        .pipe(gulp.dest('ts/'));
});



gulp.task("default", function() {
    // gulp.watch("./css/*.styl", ['postcssTask']);
    //less跑移动端任务
    gulp.watch("Less/*.less", ['LessTask']);
    gulp.watch("ts/*ts",["tsTask"]);
});