global.config = {
  build: {
    src: {
      html: [
        './src/views/**/*.pug',
        '!./src/views/**/_*.pug'
      ],
      // css: './src/styles/main.styl',
      css: './src/styles/main.scss',
      js: './src/js/**/*.js',
      js_vendor: [
        './src/vendor/jquery/**/*.js',
        './src/vendor/**/*.js',
      ],
      img: 'src/img/**/*.{png,jpg,gif,svg}',
      fonts: 'src/fonts/**/*.{eot,ttf,svg,otf,woff}'
    },
    dest: {
      css: 'dist/css',
      html: 'dist/',
      js: 'dist/js',
      img: 'dist/img',
      fonts: 'dist/fonts',
      full: 'dist/**/*.*'
    }
  },
  watch: {
    // css: 'src/{styles,vendor}/**/*.styl',
    css: 'src/{styles,vendor}/**/*.scss',
    html: 'src/views/**/*.pug',
    js: 'src/js/**/*.js',
    js_vendor: 'src/vendor/**/*.js',
    img: 'src/img/**/*.{png,jpg,gif,svg}',
    fonts: 'src/fonts/**/*.{eot,ttf,svg,otf,woff}'
  },
  upload: {
    css: 'web/theme/css',
    js: 'web/theme/js'
  },
  browsers: ['last 2 versions']
};

exports.config = config;
