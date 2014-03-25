// Инициализируем плагины
var gulp       = require('gulp'),            // Собственно Gulp JS
    config     = require('./config.json'),   // Конфиг для проектов
    jade       = require('gulp-jade'),       // Плагин для Jade
    compass    = require('gulp-compass'),    // Плагин для Compass
    lr         = require('tiny-lr'),         // Минивебсервер для livereload
    livereload = require('gulp-livereload'), // Livereload для Gulp
    csso       = require('gulp-csso'),       // Минификация CSS
    imagemin   = require('gulp-imagemin'),   // Минификация изображений
    uglify     = require('gulp-uglify'),     // Минификация JS
    concat     = require('gulp-concat'),     // Склейка файлов
    rename     = require('gulp-rename'),     // Переименование файлов
    connect    = require('connect'),         // Webserver
    server     = lr();


// Собираем compass

gulp.task('compass', function() {
	gulp.src(config.build.src.css)
		.pipe(compass({
			config_file: './config.rb',
			css: 'dev/css',
			sass: 'dev/sass'
		})) // Пути к css и scss должны совпадать с путями в config.rb
		.on('error', console.log) // Если есть ошибки, выводим и продолжаем
		.pipe(gulp.dest('./www/css'))
		.pipe(livereload(server)); // даем команду на перезагрузку страницы
});


// Собираем html из Jade

gulp.task('jade', function() {
	gulp.src(config.build.src.html)
		.pipe(jade({
			pretty: true
		}))  // Собираем Jade, исключая файлы с _*
		.on('error', console.log) // Если есть ошибки, выводим и продолжаем
		.pipe(gulp.dest(config.build.dest.html)) // Записываем собранные файлы
		.pipe(livereload(server)); // даем команду на перезагрузку страницы
});


// Собираем JS

gulp.task('js', function() {
	gulp.src(config.build.src.js)
		.pipe(concat('main.js')) // Собираем все JS, кроме тех которые находятся в ./www/js/vendor/**
		.pipe(gulp.dest(config.build.dest.js))
		.pipe(livereload(server)); // даем команду на перезагрузку страницы
});

gulp.task('js-vendor', function() {
	gulp.src(config.build.src.js_vendor)
		.pipe(concat('plugins.js'))
		.pipe(gulp.dest(config.build.dest.js))
		.pipe(livereload(server));
});

// Копируем js-файлы с префиксом _ без изменений
gulp.task('js-other', function() {
	gulp.src(config.build.src.js_other)
		.pipe(gulp.dest(config.build.dest.js))
		.pipe(livereload(server));
});


// Копируем и минимизируем изображения

gulp.task('images', function() {
	gulp.src(config.build.src.img)
		.pipe(imagemin())
		.pipe(gulp.dest(config.build.dest.img));
});


// Копируем шрифты

gulp.task('fonts', function() {
	gulp.src(config.build.src.fonts)
		.pipe(gulp.dest(config.build.dest.fonts));
});


// Локальный сервер для разработки
gulp.task('http-server', function() {
	connect()
		.use(require('connect-livereload')())
		.use(connect.static(config.build.dest.html))
		.listen('8888');

	console.log('Server listening on http://localhost:8888');
});

// Запуск сервера разработки gulp watch
gulp.task('watch', function() {
	// Подключаем Livereload
	server.listen(35729, function(err) {
		if (err) return console.log(err);

		gulp.watch(config.watch.scss, function() {
			gulp.run('compass');
		});
		gulp.watch(config.watch.jade, function() {
			gulp.run('jade');
		});
		gulp.watch(config.watch.js, function() {
			gulp.run('js');
			gulp.run('js-other');
		});
		gulp.watch(config.watch.js_vendor, function() {
			gulp.run('js-vendor');
		});
		gulp.watch(config.watch.img, function() {
			gulp.run('images');
		});
	});
	gulp.run('http-server');
});


// Сборка неминимизированного проекта

gulp.task('build', function() {
	// css
	gulp.src(config.build.src.css)
		.pipe(compass({
			config_file: './config.rb',
			css: 'dev/css',
			sass: 'dev/sass'
		})) // Пути к css и scss должны совпадать с путями в config.rb
		.on('error', console.log) // Если есть ошибки, выводим и продолжаем
		.pipe(gulp.dest(config.build.dest.css));

	// jade
	gulp.src(config.build.src.html)
		.pipe(jade({
			pretty: true
		}))
		.pipe(gulp.dest(config.build.dest.html));

	// js
	gulp.src(config.build.src.js)
		.pipe(concat('main.js'))
		.pipe(gulp.dest(config.build.dest.js));

	gulp.src(config.build.src.js_vendor)
		.pipe(concat('plugins.js'))
		.pipe(gulp.dest(config.build.dest.js));

	gulp.src(config.build.src.js_other)
		.pipe(gulp.dest(config.build.dest.js))
		.pipe(livereload(server));

	// image
	gulp.src(config.build.src.img)
		.pipe(gulp.dest(config.build.dest.img));

	// fonts
	gulp.src(config.build.src.fonts)
		.pipe(gulp.dest(config.build.dest.fonts));
});


// Сборка минимизированного проекта

gulp.task('production', function() {
	// css
	gulp.src(config.build.src.css)
		.pipe(compass({
			config_file: './config.rb',
			css: 'dev/css',
			sass: 'dev/sass'
		})) // Пути к css и scss должны совпадать с путями в config.rb
		.on('error', console.log) // Если есть ошибки, выводим и продолжаем
		.pipe(rename('main.css'))
		.pipe(csso()) // минимизируем css
		.pipe(gulp.dest(config.build.dest.css));

	// jade
	gulp.src(config.build.src.html)
		.pipe(jade())
		.pipe(gulp.dest(config.build.dest.html));

	// js
	gulp.src(config.build.src.js)
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest(config.build.dest.js));

	gulp.src(config.build.src.js_vendor)
		.pipe(concat('plugins.js'))
		.pipe(gulp.dest(config.build.dest.js));

	gulp.src(config.build.src.js_other)
		.pipe(uglify())
		.pipe(gulp.dest(config.build.dest.js))
		.pipe(livereload(server));

	// image
	gulp.src(config.build.src.img)
		.pipe(imagemin())
		.pipe(gulp.dest(config.build.dest.img));

	// fonts
	gulp.src(config.build.src.fonts)
		.pipe(gulp.dest(config.build.dest.fonts));
});