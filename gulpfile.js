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

var gulp          = require('gulp'),

	// Notifications
	header          = require('gulp-header'),
	notify          = require('gulp-notify'),
	pkg             = require('./package.json'),

	// Html
	pug 						= require('gulp-pug'),
	prettyHtml 			= require('gulp-pretty-html'),

	// Stylesheets
	stylus          = require('gulp-stylus'),
	rupture         = require('rupture'),
	nib             = require('nib'),

	// Help
	plumber					= require('gulp-plumber'),

	// Server
	server          = require('gulp-server-livereload'),

	// Watching files
	livereload      = require('gulp-livereload'),

	// Scripts
	uglify          = require('gulp-uglify'),
	concat          = require('gulp-concat'),

	// Settings
	filename        = 'master',
	headerName			= '	Paquetes FICM 18 - 19 octubre ' + new Date().getFullYear() + ' ';

// Default Task with Stylus
gulp.task('default', function() {
	gulp.start(
		'nunjucks',
		'prettifypages',
		'stylus',
		'scripts',
		'watch',
		'webserver'
	);
});

function fileHeader(title) {
	return [
		'/*!',
			title + ' - ' + pkg.version,
			'	Copyright © 2016 - ' + new Date().getFullYear() + ' IA Interactive Team',
			'	Desarrollado en IA Interactive',
			'	http://ia.com.mx/',
		'*/\n'
	].join('\n')
}

const PATHS = {
	html: 				'Preprocess/html',
	stylus: 			'Preprocess/stylus/',
	pug: 					'Preprocess/pug/',
	vendors: 			'Preprocess/stylus/',
	buildHtml: 		'',
	buildCss: 		'',
	buildVendors: '',
	buildImages: 	''
}

// Compile Pug
gulp.task('pug', function(){
	gulp.src([
			PATHS.pug + '*.pug',
			'!' + PATHS.pug + '_*.pug',
			'!' + PATHS.pug + 'inlcudes/_*.pug'
		])
		.on('error', console.log)
		.pipe(gulp.dest(build_path.html))
		.pipe(notify({ message: 'HTML compiled!' }))
		.pipe(browsersync.reload({stream: true}));
});

gulp.task('prettifypages', function () {
	return gulp.src(PATHS.output + '/*.html')
		.pipe(prettyHtml({
			indent_with_tabs: '-c',
			indent_char: ' ',
			unformatted: ['script', 'svg']
		}))
		.pipe(gulp.dest('html'));
});

// Stylesheets Compiling actions
gulp.task('stylus', function () { // General styles
	return gulp.src(PATHS.stylPath + filename + '.styl')
	.pipe(plumber())
	.pipe(stylus({
		use: [
			nib(),
			rupture()
		],
		compress: true
	}))
	.pipe(header(fileHeader(headerName)))
	.pipe(gulp.dest('Content/css/'))
	.pipe(notify({ message: 'CSS compiled! 🍻🍻' }));
});

// Specific Scripts Concatenating
gulp.task('scripts', function() {
	return gulp.src(['Preprocess/vendors/*.js',])

	.pipe(plumber())
	.pipe(concat('jquery.vendors.js'))
	.pipe(notify({ message: 'Javascript concatenated! 🍻🍻' }))
	.pipe(header(fileHeader(headerName)))
	.pipe(uglify({
		preserveComments: 'some'
	}))
	.pipe(gulp.dest('Scripts/'));
});

// Server Connection
gulp.task('webserver', function() {
	gulp.src('')
	.pipe(plumber())
	.pipe(server({
		host: '0.0.0.0',
		livereload: true,
		directoryListing: false,
		open: true,
		port: 8080
	}))
	.pipe(notify({ message: 'Server running! 🍻🍻' }));
});

// Watching Files Stylus
gulp.task('watch', function() {
	// Stylus
	gulp.watch('Preprocess/stylus/**/*.styl', ['stylus']);

	// Scripts
	gulp.watch('Preprocess/vendors/*.js', ['scripts']);

	// Beautify
	gulp.watch('Preprocess/html/*.html', ['prettifypages']);

	// Nunjucks
	gulp.watch([PATHS.pages + '/**/*.+(html|js|css)', PATHS.templates + '/**/*.+(html|js|css)'], ['nunjucks']);
});