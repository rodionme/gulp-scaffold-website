const gulp          = require('gulp'),                      // gulp
      del           = require('del'),                       // Files and folders remover
      plumber       = require('gulp-plumber'),              // Errors resolver
      notify        = require('gulp-notify'),               // Notifier
      sourcemaps    = require('gulp-sourcemaps'),           // Sourcemaps
      browserSync   = require('browser-sync').create(),     // Live reload
      stylus        = require('gulp-stylus'),               // Stylus
      sass          = require('gulp-sass'),                 // Sass
      autoprefixer  = require('gulp-autoprefixer'),         // Autoprefixer
      pug           = require('gulp-pug'),                  // Pug
      csso          = require('gulp-csso'),                 // CSS minifier
      imagemin      = require('gulp-imagemin'),             // Images minifier
      gulpIf        = require('gulp-if'),                   // Flow conditions
      config        = require('./config.js').config;


const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'dev';


// Clean resulting folder
gulp.task('clean', function () {
  return del('dist/**', function () {
    console.log('Files deleted');
  });
});


// Compile HTML
gulp.task('views', function () {
    return gulp.src(config.build.src.html)
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(gulpIf(isDevelopment, pug({
            doctype: 'html',
            pretty: true
        }), pug()))
        .pipe(gulp.dest(config.build.dest.html));
});


// Compile CSS
gulp.task('styles', function () {
  return gulp.src(config.build.src.css)
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(stylus())
    // .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: config.browsers, // https://github.com/ai/browserslist
      cascade: false
    }))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulpIf(!isDevelopment, csso()))
    .pipe(gulp.dest(config.build.dest.css));
});


// Copy images
gulp.task('images', function () {
  return gulp.src(config.build.src.img, {since: gulp.lastRun('images')})
    .pipe(gulpIf(!isDevelopment, imagemin()))
    .pipe(gulp.dest(config.build.dest.img));
});


// Copy fonts
gulp.task('fonts', function () {
  return gulp.src(config.build.src.fonts, {since: gulp.lastRun('fonts')})
    .pipe(gulp.dest(config.build.dest.fonts));
});


// Local development server
gulp.task('server', function () {
  browserSync.init({
    server: 'dist',
    port: 8888,
    notify: false,
    // browser: ['google chrome', 'firefox', 'safari'],
    open: false,
    ghostMode: {
      clicks: true,
      forms: true,
      scroll: true
    }
  });

  browserSync.watch(config.build.dest.full).on('change', browserSync.reload);
});


// Project assembly
gulp.task('build', gulp.series('clean', gulp.parallel('views', 'styles', 'images', 'fonts')));


// Watching changes
gulp.task('watch', function () {
  gulp.watch(config.watch.html, gulp.series('views'));
  gulp.watch(config.watch.css, gulp.series('styles'));
  gulp.watch(config.watch.img, gulp.series('images'));
  gulp.watch(config.watch.fonts, gulp.series('fonts'));
});


gulp.task('default', gulp.series('build', gulp.parallel('watch', 'server')));
