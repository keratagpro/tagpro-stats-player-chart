var gulp = require('gulp');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var mustache = require('mustache');

const GAMES = 1000; // 0, 10, 50, 100, 200, 500, 1000
import { NEGATIVE_STATS } from '../src/lib/constants.js';

gulp.task('update-stats', function() {
	var statsMax = {};
	var statsMin = {};

	function queryStatNamesAsync(body) {
		return new Promise((resolve, reject) => {
			request('http://tagpro-stats.com', function(err, resp, body) {
				if (err) {
					reject(err);
				}
				else {
					var $ = cheerio.load(body);

					var statNames = [];
					$('#SelectStat option').each(function() {
						statNames.push($(this).val());
					});

					resolve(statNames);
				}
			});
		})
	}

	function queryStatAsync(stat, order) {
		let url = "http://tagpro-stats.com/get_table.php";
		let query = `?range=all&stat=${stat}&game=${GAMES}&row=1&order=${order}`;

		// console.log('query', query);

		return new Promise((resolve, reject) => {
			request(`${url}${query}`, function(err, resp, body) {
				if (err) {
					reject(err);
				}
				else {
					let $ = cheerio.load(body);
					var val = $('tr:nth-child(2) td:last-child').text();
					resolve(parseFloat(val));
				}
			});
		});
	}

	function queryStatsAsync(names, order) {
		return new Promise((resolve, reject) => {
			let stats = {};
			
			Promise.all(names.map(stat => {
				return new Promise((resolve, reject) => {
					queryStatAsync(stat, order)
						.then(val => {
							stats[stat] = val;
							resolve(val);
						})
						.catch(reject);
				});
			}))
				.then((_) => resolve(stats))
				.catch(reject);
		});
	}

	function queryStatValuesAsync(maxStats) {
		return Promise.all([
			queryStatsAsync(maxStats.sort(), 'desc'),
			queryStatsAsync(NEGATIVE_STATS.sort(), 'asc')
		]);
	}

	function writeStatsToFileAsync([statsMax, statsMin]) {
		return new Promise((resolve, reject) => {
			fs.readFile('src/templates/statLimits.js.template', function(err, data) {
				if (err) {
					reject(err);
				}

				var obj = {
					statMaxValues: JSON.stringify(statsMax, null, '\t'),
					statMinValues: JSON.stringify(statsMin, null, '\t')
				};

				var output = mustache.render(data.toString(), obj);

				resolve(fs.writeFile('src/lib/statLimits.js', output, 'utf8'));
			});
		})
	}

	queryStatNamesAsync()
		.then(queryStatValuesAsync)
		.then(writeStatsToFileAsync)
		.catch(console.error);
});