// Инициализируем плагины
var gulp        = require('gulp'),            // Собственно Gulp JS
    config      = require('./config.json'),   // Конфиг для проектов
    rename      = require('gulp-rename'),     // Переименование файлов
    newer       = require('gulp-newer'),      // Passing through only those source files that are newer than corresponding destination files
    concat      = require('gulp-concat'),     // Склейка файлов
    jade        = require('gulp-jade'),       // Плагин для Jade
    compass     = require('gulp-compass'),    // Плагин для Compass
    csso        = require('gulp-csso'),       // Минификация CSS
    imagemin    = require('gulp-imagemin'),   // Минификация изображений
    uglify      = require('gulp-uglify'),     // Минификация JS
    ftp         = require('gulp-ftp'),        // FTP-клиент
    del         = require('del'),             // Удаление файлов и папок
    browserSync = require('browser-sync'),    // Обновление без перезагрузки страницы
    reload      = browserSync.reload,
    order       = require('gulp-order'),      // Определение порядка файлов в потоке
    csscomb     = require('gulp-csscomb'),    // Форматирование стилей
    wrapper     = require('gulp-wrapper'),    // Добавляет к файлу текстовую шапку и/или подвал
    plumber     = require('gulp-plumber'),    // Перехватчик ошибок
    notify      = require("gulp-notify");     // Нотификатор


// Очистка результирующей папки
gulp.task('clean', function() {
  del('www/**', function (err) {
    console.log('Files deleted');
  });
});


// Форматирование стилей
gulp.task('csscomb', function() {
  return gulp.src('./dev/sass/**/*.scss')
    .pipe(csscomb())
    .pipe(gulp.dest('./dev/sass'));
});


// https://www.npmjs.org/package/gulp-compass
function compassTask() {
  return gulp.src(config.build.src.css)
    .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
    .pipe(compass({
      // project: "/",
      css: "www/css",
      sass: "dev/sass",
      font: "www/fonts",
      image: "www/img",
      comments: true
    })); // Пути к css и scss должны совпадать с путями в config.rb
}


// Собираем css из Compass
gulp.task('compass', ['csscomb'], function() {
  compassTask()
    .pipe(reload({ stream: true }));
});


// Собираем html из Jade
gulp.task('jade', function() {
  return gulp.src(config.build.src.html)
    .pipe(newer(config.build.dest.html, '.html'))
    .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(config.build.dest.html))
    .pipe(reload({ stream: true }));
});


// Собираем JS
gulp.task('js', function() {
  return gulp.src(config.build.src.js)
    .pipe(wrapper({
       header: '\n// ${filename}\n\n',
       footer: '\n'
    }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest(config.build.dest.js))
    .pipe(reload({ stream: true }));
});

gulp.task('js-vendor', function() {
  return gulp.src(config.build.src.js_vendor)
    .pipe(order(config.build.src.js_order))
    .pipe(concat('plugins.js'))
    .pipe(gulp.dest(config.build.dest.js))
    .pipe(reload({ stream: true }));
});

gulp.task('js-other', function() {
  return gulp.src(config.build.src.js_other)
    .pipe(wrapper({
       header: '\n// ${filename}\n\n',
       footer: '\n'
    }))
    .pipe(gulp.dest(config.build.dest.js))
    .pipe(reload({ stream: true }));
});


// Копируем изображения
gulp.task('images', function() {
  return gulp.src(config.build.src.img)
    .pipe(newer(config.build.dest.img))
    .pipe(gulp.dest(config.build.dest.img))
    .pipe(reload({ stream: true }));
});


// Копируем шрифты
gulp.task('fonts', function() {
  return gulp.src(config.build.src.fonts)
    .pipe(newer(config.build.dest.fonts))
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
       baseDir: 'www'
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
gulp.task('watch', ['jade', 'compass', 'js', 'js-other', 'js-vendor', 'images', 'fonts', 'server'], function() {
  gulp.watch(config.watch.jade, ['jade']);
  gulp.watch(config.watch.scss, ['compass']);
  gulp.watch(config.watch.js, ['js', 'js-other']);
  gulp.watch(config.watch.js_vendor, ['js-vendor']);
  gulp.watch(config.watch.img, ['images']);
  gulp.watch(config.watch.fonts, ['fonts']);
});


// Сборка неминимизированного проекта
gulp.task('build', ['clean'], function () {
  gulp.start(['jade', 'compass', 'js', 'js-vendor', 'js-other', 'images', 'fonts']);
});


// Сборка минимизированного проекта
gulp.task('production', ['clean'], function() {
  // css
  compassTask()
    .pipe(csso())
    .pipe(gulp.dest(config.build.dest.css));

  // jade
  gulp.src(config.build.src.html)
    .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
    .pipe(jade())
    .pipe(gulp.dest(config.build.dest.html));

  // js
  gulp.src(config.build.src.js)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.build.dest.js));

  gulp.src(config.build.src.js_vendor)
    .pipe(order(config.build.src.js_order))
    .pipe(concat('plugins.js'))
    .pipe(gulp.dest(config.build.dest.js));

  gulp.src(config.build.src.js_other)
    .pipe(uglify())
    .pipe(gulp.dest(config.build.dest.js));

  // image
  gulp.src(config.build.src.img)
    .pipe(imagemin())
    .pipe(gulp.dest(config.build.dest.img));

  // fonts
  gulp.src(config.build.src.fonts)
    .pipe(gulp.dest(config.build.dest.fonts));
});


// Загрузка на удаленный сервер
var settings = config.server;

// js
gulp.task('upload-js', ['build'], function () {
  settings.remotePath = '/web/js';

  gulp.src(config.build.dest.js + '/**/*')
    // .pipe(gulp.dest(config.upload.js))   // Дублировать для WP
    .pipe(ftp(settings));
});

// css
gulp.task('upload-css', ['build'], function () {
  settings.remotePath = '/web/css';

  gulp.src(config.build.dest.css + '/**')
    // .pipe(gulp.dest(config.upload.css))   // Дублировать для WP
    .pipe(ftp(settings));
});

gulp.task('upload', ['upload-js', 'upload-css']);

gulp.task('default', ['watch']);