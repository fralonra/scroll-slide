const gulp = require('gulp'),
  babelify = require('babelify'),
  bro = require('gulp-bro'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify');

const pkg = require('./package.json');

const build = () => {
  gulp.src('src/*.js')
    .pipe(bro({
      transform: [
        babelify.configure({
          presets: ['es2015']
        })
      ]
    }))
    .pipe(rename({ basename: pkg.name }))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({
      basename: pkg.name,
      suffix: '.min' }))
    .pipe(gulp.dest('dist'));
};

gulp.task('build', build);
