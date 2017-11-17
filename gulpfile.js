const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const shell = require('gulp-shell');
 
const paths = {
  scripts: ['src/**/*.js'],
  tests: ['test/**/*.js']
};

gulp.task('test', () => {
  return gulp.src('test/unit.test.js', {read: false})
    .pipe(shell([
      'nyc npm test && nyc report --reporter=text-lcov | coveralls'
    ]));
});

gulp.task('lint', () => {
  return gulp.src([paths.scripts, paths.tests,'!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format()) 
    .pipe(eslint.failAfterError());
});
 
gulp.task('compile', ['test', 'lint'], () => {
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(concat('pubnub-functions-mock.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['compile']);