'use strict';

import gulp from 'gulp';
import addsrc from 'gulp-add-src';
import bump from 'gulp-bump';
import concat from 'gulp-concat';
import ghPages from 'gulp-gh-pages';
import gutil from 'gulp-util';
import mustache from 'gulp-mustache';
import rename from 'gulp-rename';
import streamify from 'gulp-streamify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';

import project from './package.json';

import './gulp/update-stats.js';

gulp.task('bump', () => {
	gulp.src('./package.json')
		.pipe(bump())
		.pipe(gulp.dest('./'));
});

gulp.task('meta', () => {
	gulp.src('./src/templates/meta.js.mustache')
		.pipe(mustache({
			version: project.version
		}))
		.pipe(rename('tagpro-stats-player-chart.meta.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('build', ['meta'], () => {
	var bundleStream = browserify({
		entries: ['./src/main.js'],
		paths: ['./src/']
	}).bundle();

	bundleStream
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('./src/main.js'))
		.pipe(addsrc.prepend('./dist/tagpro-stats-player-chart.meta.js'))
		.pipe(streamify(concat('tagpro-stats-player-chart.user.js')))
		.pipe(gulp.dest('./dist'));
});

gulp.task('deploy', ['build'], () => {
	return gulp.src('./dist/**/*')
		.pipe(ghPages());
});

gulp.task('default', ['meta', 'build']);
