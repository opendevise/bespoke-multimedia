var pkg = require('./package.json'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  concat = require('gulp-concat'),
  del = require('del'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  header = require('gulp-header'),
  jshint = require('gulp-jshint'),
  karma = require('karma'),
  ghpages = require('gh-pages'),
  path = require('path'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  source = require('vinyl-source-stream'),
  uglify = require('gulp-uglify');

gulp.task('default', ['clean', 'lint', 'test', 'compile']);
gulp.task('dev', ['compile', 'lint', 'test', 'watch']);

gulp.task('watch', function() {
  gulp.watch('lib/**/*.js', ['test', 'lint', 'compile']);
  gulp.watch('test/spec/**/*.js', ['test']);
});

gulp.task('clean', function() {
  return del(['dist', 'demo/dist', 'test/coverage']);
});

gulp.task('lint', function() {
  return gulp.src(['gulpfile.js', 'lib/**/*.js', 'specs/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', function(done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('compile', ['clean'], function() {
  return browserify('lib/bespoke-multimedia.js', { standalone: 'bespoke.plugins.multimedia' }).bundle()
    .pipe(source('bespoke-multimedia.js'))
    .pipe(buffer())
    .pipe(header([
      '/*!',
      ' * <%= name %> v<%= version %>',
      ' *',
      ' * Copyright <%= new Date().getFullYear() %>, <%= author.name %>',
      ' * This content is released under the <%= license %> license',
      ' */\n\n'
    ].join('\n'), pkg))
    .pipe(gulp.dest('dist'))
    .pipe(rename('bespoke-multimedia.min.js'))
    .pipe(uglify())
    .pipe(header([
      '/*! <%= name %> v<%= version %> ',
      '© <%= new Date().getFullYear() %> <%= author.name %>, ',
      '<%= license %> License */\n'
    ].join(''), pkg))
    .pipe(gulp.dest('dist'));
});

gulp.task('compile:demo', ['compile:demo:css', 'compile:demo:assets', 'compile:demo:html', 'compile:demo:js']);

gulp.task('compile:demo:css', ['clean'], function() {
  return gulp.src('demo/style.css')
    .pipe(gulp.dest('demo/dist'));
});

gulp.task('compile:demo:assets', ['clean'], function() {
  return gulp.src('demo/*.{ogg,mp4,svg}')
    .pipe(gulp.dest('demo/dist'));
});

gulp.task('compile:demo:html', ['clean'], function() {
  return gulp.src('demo/index.html')
    .pipe(replace(/<script [\s\S]*<\/script>/, '<script src="build.js"></script>'))
    .pipe(gulp.dest('demo/dist'));
});

gulp.task('compile:demo:js', ['compile'], function() {
  return gulp.src([
      'node_modules/bespoke/dist/bespoke.js',
      'node_modules/bespoke-classes/dist/bespoke-classes.js',
      'node_modules/bespoke-nav/dist/bespoke-nav.js',
      'dist/bespoke-multimedia.js',
      'demo/demo.js'
  ])
  .pipe(concat('build.js'))
  .pipe(uglify())
  .pipe(gulp.dest('demo/dist'));
});

gulp.task('deploy', ['compile:demo'], function(done) {
  ghpages.publish(path.join(__dirname, 'demo/dist'), { logger: gutil.log }, done);
});
