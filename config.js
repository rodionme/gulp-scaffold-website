module.exports.config = {
    build: {
        src: {
            html: [
                './src/views/**/*.pug',
                '!./src/views/**/_*.pug',
            ],
            css: './src/styles/main.{styl,scss}',
            img: 'src/img/**/*.{png,jpg,gif,svg}',
            fonts: 'src/fonts/**/*.{eot,ttf,svg,otf,woff}',
        },
        dest: {
            html: 'dist/',
            css: 'dist/css',
            img: 'dist/img',
            fonts: 'dist/fonts',
            full: 'dist/**/*.*',
        },
    },
    watch: {
        html: 'src/views/**/*.pug',
        css: 'src/styles/**/*.{styl,scss}',
        img: 'src/img/**/*.{png,jpg,gif,svg}',
        fonts: 'src/fonts/**/*.{eot,ttf,svg,otf,woff}',
    },
    browsers: ['last 2 versions'],
};
