'use strict';

var gulp = require("gulp");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var streamify = require("gulp-streamify");
var addsrc = require("gulp-add-src");
var gutil = require('gulp-util');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var ghPages = require('gulp-gh-pages');

require('./gulp/update-stats');

gulp.task('meta', function() {
	gulp.src('./src/header.js')
		.pipe(rename('tagpro-stats-player-chart.meta.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('build', function() {
	var bundleStream = browserify({
		entries: ['./src/main.js'],
		paths: ['./src/']
	}).bundle();

	bundleStream
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('./src/main.js'))
		.pipe(addsrc.prepend('./src/header.js'))
		.pipe(streamify(concat('tagpro-stats-player-chart.user.js')))
		.pipe(gulp.dest('./dist'));
});

gulp.task('deploy', ['meta', 'build'], function() {
	return gulp.src('./dist/**/*')
		.pipe(ghPages({ push: false }));
});

gulp.task('default', ['meta', 'build']);
