import _ from 'lodash';
import cheerio from 'cheerio';
import fs from 'fs';
import gulp from 'gulp';
import mustache from 'mustache';
import Promise from 'bluebird';

var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);
var request = Promise.promisify(require('request'));

const GAMES = 1000; // 0, 10, 50, 100, 200, 500, 1000
import { NEGATIVE_STATS } from '../src/lib/constants.js';

gulp.task('update-stats', () => {
	var statsMax = {};
	var statsMin = {};

	function queryStatNamesAsync(body) {
		return request('http://tagpro-stats.com').spread((resp, body) => {
			var $ = cheerio.load(body);

			var statNames = [];
			$('#SelectStat option').each(function() {
				statNames.push($(this).val());
			});

			return statNames;
		})
	}

	function queryStatAsync(stat, order) {
		let url = "http://tagpro-stats.com/get_table.php";
		let query = `?range=all&stat=${stat}&game=${GAMES}&row=1&order=${order}`;

		return request(`${url}${query}`).spread((resp, body) => {
			// NOTE: For debugging
			// console.log('query', query);

			let $ = cheerio.load(body);
			var val = $('tr:nth-child(2) td:last-child').text();
			return parseFloat(val);
		});
	}

	function queryStatsAsync(names, order) {
		// NOTE: For debugging
		// names = names.slice(0, 2);

		return Promise.map(names, stat => {
			return queryStatAsync(stat, order).then(val => [stat, val]);
		}, { concurrency: 3 })
			.then(_)
			.call('zipObject')
			.call('value')
			.props();
	}

	function queryStatValuesAsync(maxStats) {
		return Promise.join(
			queryStatsAsync(maxStats.sort(), 'desc'),
			queryStatsAsync(NEGATIVE_STATS.sort(), 'asc'),
			(max, min) => {
				return {
					updatedAt: new Date().toISOString(),
					statMaxValues: JSON.stringify(max, null, '\t'),
					statMinValues: JSON.stringify(min, null, '\t')
				};
			}
		);
	}

	function writeStatsToFileAsync(stats) {
		return readFile('src/templates/statLimits.js.mustache', 'utf8')
			.then((data) => writeFile('src/lib/statLimits.js', mustache.render(data.toString(), stats), 'utf8'));
	}

	queryStatNamesAsync()
		.then(queryStatValuesAsync)
		.then(writeStatsToFileAsync)
		.catch(console.error);
});