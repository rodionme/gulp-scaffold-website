'use strict';

const gulp          = require('gulp'),                      // Собственно Gulp JS
      del           = require('del'),                       // Удаление файлов и папок
      plumber       = require('gulp-plumber'),              // Перехватчик ошибок
      notify        = require('gulp-notify'),               // Нотификатор
      sourcemaps    = require('gulp-sourcemaps'),           // Sourcemaps
      browserSync   = require('browser-sync').create(),     // Live reload
      concat        = require('gulp-concat'),               // Склейка файлов
      stylus        = require('gulp-stylus'),               // Плагин для Stylus
      postcss       = require('gulp-postcss'),              // PostCSS
      autoprefixer  = require('autoprefixer'),              // Autoprefixer
      jade          = require('gulp-jade'),                 // Плагин для Jade
      csso          = require('gulp-csso'),                 // Минификация CSS
      imagemin      = require('gulp-imagemin'),             // Минификация изображений
      uglify        = require('gulp-uglify'),               // Минификация JS
      ftp           = require('gulp-ftp'),                  // FTP-клиент
      gulpIf        = require('gulp-if'),                   // Добавление условий
      order         = require('gulp-order');                // Определение порядка файлов в потоке


const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

require('./config.js');
require('./ftp.js');


// Очистка результирующей папки
gulp.task('clean', function () {
  return del('dist/**', function () {
    console.log('Files deleted');
  });
});


// Собираем css из Stylus
gulp.task('styles', function () {
  return gulp.src(config.build.src.css)
    .pipe(plumber({errorHandler: notify.onError("<%= error.message %>")}))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(stylus())
    //.pipe(stylus({
    //  define: {
    //    url: require('stylus').resolver()
    //  }
    //}))
    // Path must be a string. Received undefined
    .pipe(postcss([autoprefixer({
      browsers: config.browsers,        // https://github.com/ai/browserslist
      cascade: false
    })]))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulpIf(!isDevelopment, csso()))
    .pipe(gulp.dest(config.build.dest.css));
});


// Собираем html из Jade
gulp.task('jade', function () {
  return gulp.src(config.build.src.html, {since: gulp.lastRun('jade')})
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(gulpIf(isDevelopment, jade({
      doctype: 'html',
      pretty: true
    }), jade()))
    .pipe(gulp.dest(config.build.dest.html));
});


// Собираем JS
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


// Копируем изображения
gulp.task('images', function () {
  return gulp.src(config.build.src.img, {since: gulp.lastRun('images')})
    .pipe(gulpIf(!isDevelopment, imagemin()))
    .pipe(gulp.dest(config.build.dest.img));
});


// Копируем шрифты
gulp.task('fonts', function () {
  return gulp.src(config.build.src.fonts, {since: gulp.lastRun('fonts')})
    .pipe(gulp.dest(config.build.dest.fonts));
});


// Локальный сервер для разработки
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


// Сборка неминимизированного проекта
gulp.task('build', gulp.parallel('jade', 'styles', 'js', 'js:other', 'js:vendor', 'images', 'fonts'));


// Отслеживание изменений
gulp.task('watch', function () {
  gulp.watch(config.watch.jade, gulp.series('jade'));
  gulp.watch(config.watch.css, gulp.series('styles'));
  gulp.watch(config.watch.js, gulp.parallel('js', 'js:other'));
  gulp.watch(config.watch.js_vendor, gulp.series('js:vendor'));
  gulp.watch(config.watch.img, gulp.series('images'));
  gulp.watch(config.watch.fonts, gulp.series('fonts'));
});


// Загрузка на удаленный сервер

// js
gulp.task('upload:js', gulp.series('build', function () {
  ftpConfig.remotePath = '/web/js';

  gulp.src(config.build.dest.js + '/**/*')
    // .pipe(gulp.dest(config.upload.js))   // Дублировать для WP
    .pipe(ftp(ftpConfig));
}));

// css
gulp.task('upload:css', gulp.series('build', function () {
  ftpConfig.remotePath = '/web/js';

  gulp.src(config.build.dest.css + '/**')
    // .pipe(gulp.dest(config.upload.css))   // Дублировать для WP
    .pipe(ftp(ftpConfig));
}));

gulp.task('upload', gulp.parallel('upload:js', 'upload:css'));

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'server')));