'use strict';

var gulp = require("gulp");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var streamify = require("gulp-streamify");
var addsrc = require("gulp-add-src");
var gutil = require('gulp-util');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

require('./gulp/update-stats');

gulp.task('header', function() {
	gulp.src('./src/header.js')
		.pipe(rename('tagpro-stats-player-chart.meta.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('js', function() {
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

gulp.task('default', ['header', 'js']);
