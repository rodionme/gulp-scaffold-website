'use strict';

const gulp          = require('gulp'),                      // gulp
      del           = require('del'),                       // Files and folders remover
      plumber       = require('gulp-plumber'),              // Errors resolver
      notify        = require('gulp-notify'),               // Notifier
      sourcemaps    = require('gulp-sourcemaps'),           // Sourcemaps
      browserSync   = require('browser-sync').create(),     // Live reload
      concat        = require('gulp-concat'),               // Files concatenation
      sass          = require('gulp-sass'),                 // Sass
      stylus        = require('gulp-stylus'),               // Stylus
      postcss       = require('gulp-postcss'),              // PostCSS
      autoprefixer  = require('autoprefixer'),              // Autoprefixer
      pug           = require('gulp-pug'),                  // Pug
      csso          = require('gulp-csso'),                 // CSS minifier
      imagemin      = require('gulp-imagemin'),             // Images minifier
      uglify        = require('gulp-uglify'),               // JS minifier
      ftp           = require('vinyl-ftp'),                 // FTP-client
      gulpIf        = require('gulp-if'),                   // Flow conditions
      order         = require('gulp-order');                // File order


const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

require('./config.js');


// Clean resulting folder
gulp.task('clean', function () {
  return del('dist/**', function () {
    console.log('Files deleted');
  });
});


// Compile CSS
gulp.task('styles', function () {
  return gulp.src(config.build.src.css)
    .pipe(plumber({errorHandler: notify.onError("<%= error.message %>")}))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    // .pipe(stylus())
    // Path must be a string. Received undefined
    //.pipe(stylus({
    //  define: {
    //    url: require('stylus').resolver()
    //  }
    //}))
    .pipe(postcss([autoprefixer({
      browsers: config.browsers,        // https://github.com/ai/browserslist
      cascade: false
    })]))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulpIf(!isDevelopment, csso()))
    .pipe(gulp.dest(config.build.dest.css));
});


// Compile HTML
gulp.task('views', function () {
  return gulp.src(config.build.src.html, {since: gulp.lastRun('views')})
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(gulpIf(isDevelopment, pug({
      doctype: 'html',
      pretty: true
    }), pug()))
    .pipe(gulp.dest(config.build.dest.html));
});


// Compile JS
gulp.task('js', function () {
  return gulp.src(config.build.src.js)
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(concat('main.js'))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.build.dest.js));
});

gulp.task('js:vendor', function () {
  return gulp.src(config.build.src.js_vendor)
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(order(config.build.src.js_order))
    .pipe(concat('plugins.js'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.build.dest.js));
});

gulp.task('js:other', function () {
  return gulp.src(config.build.src.js_other)
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.build.dest.js));
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
    // browser: ["google chrome", "firefox", "safari"],
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
gulp.task('build', gulp.parallel('views', 'styles', 'js', 'js:other', 'js:vendor', 'images', 'fonts'));


// Watching changes
gulp.task('watch', function () {
  gulp.watch(config.watch.html, gulp.series('views'));
  gulp.watch(config.watch.css, gulp.series('styles'));
  gulp.watch(config.watch.js, gulp.parallel('js', 'js:other'));
  gulp.watch(config.watch.js_vendor, gulp.series('js:vendor'));
  gulp.watch(config.watch.img, gulp.series('images'));
  gulp.watch(config.watch.fonts, gulp.series('fonts'));
});


// Upload to remote server

// JS
gulp.task('upload:js', gulp.series('build', function () {
  var conn = ftp.create({
    host: 'mywebsite.tld',
    user: 'me',
    password: 'mypass'
  });

  return gulp.src(config.build.dest.js + '/**/*', {
    base: '.',
    buffer: false
  })
    .pipe(conn.newer('/public_html'))
    .pipe(conn.dest('/public_html'));
}));

// CSS
gulp.task('upload:css', gulp.series('build', function () {
  var conn = ftp.create({
    host: 'mywebsite.tld',
    user: 'me',
    password: 'mypass'
  });

  return gulp.src(config.build.dest.css + '/**', {
    base: '.',
    buffer: false
  })
    .pipe(conn.newer('/public_html'))
    .pipe(conn.dest('/public_html'));
}));

gulp.task('upload', gulp.parallel('upload:js', 'upload:css'));

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'server')));