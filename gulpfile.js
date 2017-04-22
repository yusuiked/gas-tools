"use strict";
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var del = require('del');
var runSequence = require('run-sequence');

var paths = {
  allSrcJs: 'dev/**/*.js',
  allTestJs: 'test/*.js',
  entryPoint: 'dev/code.js',
  gulpFile: 'gulpfile.js',
  libDir: 'src',
  testLibDir: 'test/lib',
  allLibTests: 'test/lib/**/*.js',
  jshintFile: '.jshintrc',
};

gulp.task('gas-upload', ['browserify'], function () {
  return gulp.src('.')
    .pipe($.exec('gapps upload'));
});

gulp.task('clean', function () {
  return del(paths.libDir);
});

gulp.task('jshint', function () {
  return gulp.src([
    paths.gulpFile,
    paths.allSrcJs
  ])
    .pipe($.jshint(paths.jshintFile))
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['jshint', 'clean']);

gulp.task('espower', function () {
  return gulp.src(paths.allTestJs)
    .pipe($.espower())
    .pipe(gulp.dest(paths.testLibDir));
});

gulp.task('test', ['espower', 'build'], function () {
  return gulp.src([paths.allLibTests], { read: false })
    .pipe($.mocha({ reporter: 'spec' }));
});
gulp.task('browserify', ['test'], function () {
  return browserify({
    entries: [paths.entryPoint]
  }).plugin('gasify')
    .bundle()
    .pipe(source('code.js'))
    .pipe(gulp.dest('src'));
});

gulp.task('watch', function () {
  return gulp.watch(paths.allSrcJs, ['browserify']);
});

gulp.task('default', ['watch', 'browserify']);
