var PRODUCTION = true; // Change to false for a debug build
var APP_VERSION = '2.0.2-' + (new Date().toISOString().replace(/[\:\-]/g, '').split('.')[0]);
var COPYRIGHT = ' - Code for Ireland © ' + new Date().getUTCFullYear();

var bump = require('gulp-bump'),
    compass = require('gulp-compass'),
    concat = require('gulp-concat'),
    del = require('del'),
	gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),
	gulpif = require('gulp-if'),
	jshint = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
	replace = require('gulp-replace'),
    rev = require('gulp-rev-mtime'),
    rwi = require('gulp-rwi'),
    uglify = require('gulp-uglify');

var onError = notify.onError("Error: <%= error.message %>");

// Increment version.
gulp.task('bump-version', function() {
	gulp.src('*.json')
		.pipe(bump({version: APP_VERSION}))
		.pipe(gulp.dest('.'));
});

// Copy Libraries Task
gulp.task('libraries', function() {
	gulp.src('lib/**/*')
    	.pipe(gulp.dest('dist/lib'));

	gulp.src('fonts/**/*')
    	.pipe(gulp.dest('dist/fonts'));

    // Copy Bower resources.
	gulp.src('bower_components/bootstrap-maxlength/bootstrap-maxlength.min.js')
    	.pipe(gulp.dest('dist/lib/bootstrap-maxlength/'));

    // Copy Node resources.
	gulp.src('node_modules/animate.css/animate.min.css')
    	.pipe(gulp.dest('dist/lib/animate.css/'));

	gulp.src('node_modules/bootstrap-growl/dist/bootstrap-growl.min.js')
    	.pipe(gulp.dest('dist/lib/bootstrap.growl/'));

	gulp.src('node_modules/mustache/mustache.min.js')
    	.pipe(gulp.dest('dist/lib/mustache/'));

	gulp.src('node_modules/jquery-autosize/jquery.autosize.min.js')
    	.pipe(gulp.dest('dist/lib/jquery-autosize/'));
});

// Image Processing Task
gulp.task('images', function() {
	gulp.src(['images/*.jpg','images/*.png'])
 		.pipe(rwi({ img: 'dist/images' }));

	gulp.src(['images/favicon.ico'])
 		.pipe(gulp.dest('dist/images'));
});

// Scripts Task
gulp.task('scripts', function() {
	gulp.src([
			'js/app-bootstrap.js',
			'js/util.js',
			'js/models/**/*.js',
			'js/collections/**/*.js',
			'js/views/**/*.js',
			'js/routers/router.js',
			'js/google-translate.js',
			'js/app.js'
        ])
		.pipe(jshint())
      	.pipe(jshint.reporter('default'))
		.pipe(gulpif(PRODUCTION, replace(/\/\/--START-DEBUG-CODE([\s\S]*?)\/\/--END-DEBUG-CODE/m, '')))
		.pipe(concat('app.min.js'))
		.pipe(gulpif(PRODUCTION, uglify()))
		.pipe(gulp.dest('dist'))
		.pipe(livereload());
});

// Styles Task
gulp.task('styles', function(callback) {
	var stream = gulp.src('sass/app.scss')
		.pipe(compass({
			style: (PRODUCTION ? 'compressed' : 'expanded'),
			css: 'dist'
		}))
		.on('error', onError)
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist'))
		.on('end', function () {
            del('dist/app.css')
        })
		.pipe(livereload());

	return stream; // Return stream to make task synchronous as html task depends on this.
});

// HTML Task
gulp.task('html', ['bump-version', 'styles', 'scripts'], function() {
	gulp.src('templates/*.html')
	    .pipe(htmlmin({
	    	collapseWhitespace: PRODUCTION,
	    	minifyJS: PRODUCTION,
	    	processScripts: ['x-tmpl-mustache']
	    }))
		.on('error', onError)
		.pipe(replace(/APP_VERSION/, APP_VERSION + COPYRIGHT))
	    .pipe(gulp.dest('dist/templates'))
		.pipe(livereload());

	gulp.src('index.html')
		.pipe(gulpif(PRODUCTION, replace(/<!--PRODUCTION-CODE([\s\S]*?)-->/m, '$1')))
    	.pipe(htmlmin({collapseWhitespace: PRODUCTION}))
	    .pipe(gulp.dest('dist'))
		.pipe(rev({
          'cwd': './dist'
        }))
		.on('error', onError)
        .pipe(replace(/href\-no\-cache\-busting/g, 'href'))
        .pipe(replace(/src\-no\-cache\-busting/g, 'src'))
	    .pipe(gulp.dest('dist'))
		.pipe(livereload());
});

// Watch Task
gulp.task('watch', ['html'], function() {
	livereload.listen();

	gulp.watch('images/**/*', ['images']);
	gulp.watch('js/**/*.js', ['scripts']);
	gulp.watch('sass/**/*.scss', ['styles']);
	gulp.watch(['index.html', 'templates/**/*.html'], ['html']);
});

// Auto-reload gulpfile.js when changed.
gulp.task('gulp-reload', function() {
	gulp.watch(__filename).once('change', function() {
		delete require.cache[__filename];
		require(__filename);
		process.nextTick(function() {
			gulp.start('default');
		});
	});
});

gulp.task('default', ['libraries', 'images', 'scripts', 'styles', 'html', 'watch', 'gulp-reload']);
