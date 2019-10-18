// Plugins

// Install comands:
// npm install --save-dev gulp
// npm install --save-dev gulp-concat
// npm install --save-dev gulp-livereload
// npm install --save-dev gulp-server-livereload
// npm install --save-dev gulp-notify
// npm install --save-dev gulp-stylus
// npm install --save-dev gulp-uglify
// npm install --save-dev nib

const gulp						= require('gulp'),
		gulpif					= require('gulp-if'),
		
		// Hader & Notifications
		header					= require('gulp-header'),
		notify					= require('gulp-notify'),
		pkg							= require('./package.json'),

		// HTML
		pug							= require('gulp-pug'),
		prettyHtml			= require('gulp-pretty-html'),

		// Styles
		sass						= require('gulp-sass'),
		cssmin					= require('gulp-cssnano'),
		prefix					= require('gulp-autoprefixer'),

		// Vendors
		concat					= require('gulp-concat'),
		uglify					= require('gulp-uglify'),

		// Images
		imagemin				= require('gulp-imagemin'),

		// Sync & Help
		browserSync			=	require('browser-sync').create(),
		plumber					= require('gulp-plumber'),

		// Settings
		filename				= 'master',
		isNetcore				= false, // True: will create files inside wwwroot || False: will create files inside Content.
		isProduction		= true, // True: will compress and add header to css and js files and optim images.
		headerName			= 'Navidad Cinépolis ' + new Date().getFullYear() + ' ';

// Sass Compiler
sass.compiler		= require('node-sass'); 

// PATHS
const PATHS = {
	styles: {
		src: 'Dev/preprocess/Sass',
	},
	html: {
		src: 'Dev/preprocess/Pug',
		out: 'Dev/preprocess/Html'
	},
	vendors: {
		src: 'Dev/preprocess/Vendors',
	},
	outNetcore: 'wwwroot/',
	outMvc: 'Content/'
}

// TASK´S //////////
function fileHeader(title) {
	return [
		'/*!',
			title + ' - ' + pkg.version,
			'	Copyright © 2016 - ' + new Date().getFullYear(),
			'	Desarrollado en IA Interactive',
		'*/\n'
	].join('\n')
}

// Sass Styles
gulp.task('sass', () => {
	var streamScss = gulp.src(PATHS.styles.src + '/**/*.scss')
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(prefix())
		.pipe(gulpif(isProduction, cssmin()))
		.pipe(gulpif(isProduction, header(fileHeader('	'+headerName))))

	if (isNetcore === true) {
		streamScss = streamScss
			.pipe(gulp.dest(PATHS.outNetcore + 'css'))
			.pipe(browserSync.stream());
	}
	else {
		streamScss = streamScss
			.pipe(gulp.dest(PATHS.outMvc + 'css'))
			.pipe(browserSync.stream());
	}

	streamScss = streamScss.pipe(notify('SCSS converted to css and Ready :D'));
	return streamScss;
});

// JavaScript
gulp.task('scripts', () =>{
	var streamVendors = gulp.src([PATHS.vendors.src + '/*.js*'])
		.on('error', console.log)
		.pipe(plumber())
		.pipe(concat('vendors.min.js'))
		.pipe(gulpif(isProduction, uglify()))
		.pipe(gulpif(isProduction, header(fileHeader('	'+ headerName + ' - Vendors'))))

	if (isNetcore === true) {
		streamVendors = streamVendors
			.pipe(gulp.dest(PATHS.outNetcore + 'scripts'))
			.pipe(browserSync.stream());
	}
	else {
		streamVendors = streamVendors
			.pipe(gulp.dest(PATHS.outMvc + 'scripts'))
			.pipe(browserSync.stream());
	}

	streamVendors = streamVendors.pipe(notify('Scripts converted to css and Ready :D'));
	return streamVendors;
});

// Pug
gulp.task('pug', () => {
	return gulp.src(PATHS.html.src + '/*.pug')
	.pipe(plumber())
	.pipe(pug())
	.pipe(concat('index.html'))
  .pipe(gulp.dest(PATHS.html.out))
});

gulp.task('prettifypages', () => {
	return gulp.src(PATHS.html.out + '/*.html')
		.pipe(prettyHtml({
			indent_with_tabs: '-c',
			indent_char: ' ',
			unformatted: ['script', 'svg', 'css']
		}))
		.pipe(gulp.dest('html'))
		.pipe(browserSync.reload({stream: true}))
});

// Minification Images
gulp.task('images', () =>{
	var streamAssets = gulp.src([dev_path.img + '**/*'])
		.pipe(plumber())
		.pipe(gulpif(isProduction, imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({
					plugins: [
						{removeViewBox: true},
						{cleanupIDs: false}
					]
				})
			])
		))

	if (isNetcore === true) {
		streamAssets = streamAssets
			.pipe(gulp.dest(PATHS.outNetcore + 'img'))
			.pipe(browserSync.stream());
	}
	else {
		streamAssets = streamAssets
			.pipe(gulp.dest(PATHS.outMvc + 'img'))
			.pipe(browserSync.stream());
	}

	streamAssets = streamAssets.pipe(notify('Images optimized'));

	return streamAssets;
});

// Static Server + watching scss/html files
gulp.task('default', () => {
	browserSync.init({
		server: "./html"
	});

	gulp.watch(PATHS.html.src + '/*.pug', gulp.series('pug'))
	gulp.watch(PATHS.styles.src + '/**/*.scss', gulp.series('sass'))
	gulp.watch(PATHS.vendors.src + '/*.js', gulp.series('scripts'))
	gulp.watch('Dev/preprocess/Html', gulp.series('prettifypages'))
	gulp.watch('html').on('change', browserSync.reload)

});
