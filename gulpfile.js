const gulp        = require('gulp'),        // Собственно Gulp JS
  config      = require('./config.json'),   // Конфиг для проектов
  concat      = require('gulp-concat'),     // Склейка файлов
  jade        = require('gulp-jade'),       // Плагин для Jade
  stylus      = require('gulp-stylus'),     // Плагин для Stylus
  sourcemaps  = require('gulp-sourcemaps'), // Sourcemaps
  csso        = require('gulp-csso'),       // Минификация CSS
  imagemin    = require('gulp-imagemin'),   // Минификация изображений
  uglify      = require('gulp-uglify'),     // Минификация JS
  ftp         = require('gulp-ftp'),        // FTP-клиент
  del         = require('del'),             // Удаление файлов и папок
  browserSync = require('browser-sync'),    // Обновление без перезагрузки страницы
  reload      = browserSync.reload,
  gulpIf      = require('gulp-if'),         // Добавление условий
  order       = require('gulp-order'),      // Определение порядка файлов в потоке
  plumber     = require('gulp-plumber'),    // Перехватчик ошибок
  notify      = require("gulp-notify");     // Нотификатор


const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';


// Очистка результирующей папки
gulp.task('clean', function() {
  return del('dist/**', function () {
    console.log('Files deleted');
  });
});


function styles() {
  return gulp.src('src/styles/main.styl')
    .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(stylus())
    .pipe(gulpIf(isDevelopment, sourcemaps.write()));
}


// Собираем css из Stylus
gulp.task('styles', function() {
  styles()
    .pipe(gulp.dest(config.build.dest.css));
});

gulp.task('styles:min', function() {
  styles()
    .pipe(csso())
    .pipe(gulp.dest(config.build.dest.css));
});


// Собираем html из Jade
gulp.task('jade', function() {
  return gulp.src(config.build.src.html, {since: gulp.lastRun('jade')})
    .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
    .pipe(jade({
      doctype: 'html',
      pretty: true
    }))
    .pipe(gulp.dest(config.build.dest.html))
    .pipe(reload({ stream: true }));
});

gulp.task('jade:min', function() {
  return gulp.src(config.build.src.html)
    .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
    .pipe(jade())
    .pipe(gulp.dest(config.build.dest.html));
});


// Собираем JS
gulp.task('js', function() {
  return gulp.src(config.build.src.js)
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(concat('main.js'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.build.dest.js))
    .pipe(reload({ stream: true }));
});

gulp.task('js:min', function() {
  return gulp.src(config.build.src.js)
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.build.dest.js));
});

gulp.task('js:vendor', function() {
  return gulp.src(config.build.src.js_vendor)
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(order(config.build.src.js_order))
    .pipe(concat('plugins.js'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.build.dest.js))
    .pipe(reload({ stream: true }));
});

gulp.task('js:vendor:min', function() {
  return gulp.src(config.build.src.js_vendor)
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(order(config.build.src.js_order))
    .pipe(concat('plugins.js'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.build.dest.js));
});

gulp.task('js:other', function() {
  return gulp.src(config.build.src.js_other)
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.build.dest.js))
    .pipe(reload({ stream: true }));
});

gulp.task('js:other:min', function() {
  return gulp.src(config.build.src.js_other)
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(uglify())
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(config.build.dest.js));
});


// Копируем изображения
gulp.task('images', function() {
  return gulp.src(config.build.src.img, {since: gulp.lastRun('images')})
    .pipe(gulp.dest(config.build.dest.img))
    .pipe(reload({ stream: true }));
});

gulp.task('images:min', function() {
  return gulp.src(config.build.src.img)
    .pipe(imagemin())
    .pipe(gulp.dest(config.build.dest.img));
});


// Копируем шрифты
gulp.task('fonts', function() {
  return gulp.src(config.build.src.fonts, {since: gulp.lastRun('fonts')})
    .pipe(gulp.dest(config.build.dest.fonts))
    .pipe(reload({ stream: true }));
});


// Локальный сервер для разработки
// http://www.browsersync.io/docs/options/
gulp.task('server', function () {
  var files = [
    config.build.dest.html,
    config.build.dest.css,
    config.build.dest.img,
    config.build.dest.fonts,
    config.build.dest.js
  ];

  browserSync(files, {
    server: {
      baseDir: 'dist'
    },
    port: 8888,
    notify: false,
    // browser: ["google chrome", "firefox", "safari"],
    open: false,
    ghostMode: {
      clicks: true,
      location: true,
      forms: true,
      scroll: true
    }
  });
});


// Запуск сервера разработки
gulp.task('watch', gulp.series('build', gulp.parallel(
    gulp.watch(config.watch.jade, gulp.series('jade')),
    gulp.watch(config.watch.css, gulp.series('styles')),
    gulp.watch(config.watch.js, gulp.series('js', 'js:other')),
    gulp.watch(config.watch.js_vendor, gulp.series('js:vendor')),
    gulp.watch(config.watch.img, gulp.series('images')),
    gulp.watch(config.watch.fonts, gulp.series('fonts'))
  ))
);


// Сборка неминимизированного проекта
gulp.task('build', function () {
  gulp.parallel('jade', 'styles', 'js', 'js:other', 'js:vendor', 'images', 'fonts');
});


// Сборка минимизированного проекта
gulp.task('production', function() {
  gulp.parallel('jade:min', 'styles-min', 'js:min', 'js:vendor:min', 'js:other:min', 'images:min', 'fonts');
});


// Загрузка на удаленный сервер
var settings = config.server;

// js
gulp.task('upload:js', ['build'], function () {
  settings.remotePath = '/web/js';

  gulp.src(config.build.dest.js + '/**/*')
    // .pipe(gulp.dest(config.upload.js))   // Дублировать для WP
    .pipe(ftp(settings));
});

// css
gulp.task('upload:css', ['build'], function () {
  settings.remotePath = '/web/css';

  gulp.src(config.build.dest.css + '/**')
    // .pipe(gulp.dest(config.upload.css))   // Дублировать для WP
    .pipe(ftp(settings));
});

gulp.task('upload', ['upload:js', 'upload:css']);

gulp.task('default', ['watch']);