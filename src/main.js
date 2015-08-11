// Last max value update from tagpro-stats.com: 2015-08-08

import ViewModel from 'lib/viewModel.js';
import * as constants from 'lib/constants.js';
import * as statLimits from 'lib/statLimits.js';
import * as storage from 'lib/storage.js';
import 'lib/knockout-sortable.js';

var fs = require('fs');

GM_addStyle(fs.readFileSync(__dirname + '/templates/style.css', 'utf8'));

var options = _.extend({}, constants.DEFAULT_OPTIONS, storage.getAll());

var viewModel = new ViewModel(options);

var careerRowSelector = 'nav.navbar + .row > .col-lg-8 > .row';
var monthlyRowSelector = 'nav.navbar + .row > .col-lg-8 > .row + .row';
var sidebarSelector = 'nav.navbar + .row > .col-lg-4';

var tableSelector = '.statstable';
var $careerTable = $(careerRowSelector).find(tableSelector).first();
var $monthlyTable = $(monthlyRowSelector).find(tableSelector).first();

var $panel = $(fs.readFileSync(__dirname + '/templates/panel.html', 'utf8'));

$(sidebarSelector).prepend($panel);

$('body').attr('data-bind', "css: { 'show-best-stats': showBestStats }");

function getBestStatValue(stat) {
	if (_.contains(constants.NEGATIVE_STATS, stat)) {
		return statLimits.minValues[stat];
	}
	else {
		return statLimits.maxValues[stat];
	}
}

function getStatsFromTable(table, injectInputs) {
	var stats = {};

	table.find('td.head').each(function() {
		var $link = $(this).siblings('td.rank').find('a');
		var stat = $link.attr('href').match(/stat=([^&]+)/);

		if (!stat) {
			return;
		}

		var statname = stat[1];
		var label = $(this).text();

		if (!viewModel.statsMeta[statname]) {
			var [dividend, divisor] = label.split('/', 2);

			viewModel.statsMeta[statname] = {
				label: label,
				labelDividend: dividend,
				labelDivisor: constants.DIVISOR_LABEL_MAPPINGS[divisor]
			};
		}

		stats[statname] = {
			label: label,
			value: parseFloat($(this).siblings('td.stat').first().text())
		};

		if (injectInputs) {
			var $input = $('<input type="checkbox" class="pull-right" data-bind="visible: customizeStats, checked: selectedStats">').attr('value', statname);
			$(this).prepend($input);

			var rank = $link.text();
			var bestStat = +getBestStatValue(statname).toFixed(2);
			$link.html(`<span data-bind="visible: !showBestStats()">${rank}</span><span data-bind="visible: showBestStats">${bestStat}</span>`);
		}
	});

	return stats;
}

viewModel.name = $("h3 a[href*='profile/']").text();
viewModel.statsCareer = getStatsFromTable($careerTable, true);
viewModel.statsMonthly = getStatsFromTable($monthlyTable, true);

ko.applyBindings(viewModel);

function calculateValues(stats) {
	return _.map(viewModel.selectedStats(), function(stat) {
		var val = stats[stat];

		// If the statistic was not found, calculate it
		if (!val && viewModel.statsMeta[stat]) {
			var meta = viewModel.statsMeta[stat];
			var statDividend = _.findKey(stats, { 'label': meta.labelDividend });
			var statDivisor = _.findKey(stats, { 'label': meta.labelDivisor });
			val = stats[statDividend].value / stats[statDivisor].value;
		}
		else {
			val = val.value;
		}

		var max = statLimits.maxValues[stat];
		var percentage;

		if (_.contains(constants.NEGATIVE_STATS, stat)) {
			let min = statLimits.minValues[stat];
			percentage = (val - min) * 100 / (max - min);
		}
		else {
			percentage = (val / max) * 100;
		}

		if (percentage > 100) {
			percentage = 100;
		}

		if (percentage < 0) {
			percentage = 0;
		}

		return percentage.toFixed(2);
	});
}

var ctx = document.getElementById('chart').getContext('2d');
var chart;

function createDataSet(label, data, colors) {
	return {
		label: label,
		fillColor: colors.fill,
		strokeColor: colors.stroke,
		pointColor: colors.point,
		pointStrokeColor: colors.pointStroke || '#fff',
		data: data
	};
}

function drawChart() {
	var datasets = [];
	var storedStats = viewModel.storedStats();
	var showStoredStats = viewModel.showStoredStats();

	var schemes = constants.COLOR_SCHEMES.slice(0);
	var storedCareerColors = schemes.shift();
	var storedMonthlyColors = schemes.shift();

	if (showStoredStats && storedStats) {
		if (viewModel.showCareerStats()) {
			var label = `Career (${storedStats.name})`;
			var values = calculateValues(storedStats.statsCareer);

			datasets.push(createDataSet(label, values, storedCareerColors));
		}

		if (viewModel.showMonthlyStats()) {
			var label = `Monthly (${storedStats.name})`;
			var values = calculateValues(storedStats.statsMonthly);

			datasets.push(createDataSet(label, values, storedMonthlyColors));
		}
	}

	var colors = schemes.shift();
	if (viewModel.showCareerStats()) {
		let label = 'Career';

		if (showStoredStats && storedStats) {
			label = `Career (${viewModel.name})`;
		};

		var careerValues = calculateValues(viewModel.statsCareer);

		datasets.push(createDataSet(label, careerValues, colors));
	}

	colors = schemes.shift();
	if (viewModel.showMonthlyStats()) {
		let label = 'Monthly';

		if (showStoredStats && storedStats) {
			label = `Monthly (${viewModel.name})`;
		}

		var monthlyValues = calculateValues(viewModel.statsMonthly);

		datasets.push(createDataSet(label, monthlyValues, colors));
	}

	var labels = _.map(viewModel.selectedStats(), function(stat) {
		return viewModel.statsMeta[stat].label;
	})

	var data = { labels, datasets };

	var opts = {
		animation: false,
		scaleOverlay: true,
		scaleOverride: true,
		scaleSteps: 4,
		scaleStepWidth: 25,
		showTooltips: false,
		responsive: true
	};

	if (chart) {
		chart.destroy();
	}

	if (viewModel.showName()) {
		opts.onAnimationComplete = () => {
			ctx.fillStyle = "#666";
			ctx.textBaseline = "top";
			ctx.textAlign = "right";
			ctx.fillText(viewModel.name, ctx.canvas.width, 0);
		};
	}

	switch(viewModel.chartType()) {
		case 'bar':
			chart = new Chart(ctx).Bar(data, opts);
			break;
		default:
			chart = new Chart(ctx).Radar(data, opts);
			break;
	}

	$('#chartLegend').html(chart.generateLegend());
}

viewModel.chartType.subscribe(drawChart);
viewModel.selectedStats.subscribe(drawChart);
viewModel.showMonthlyStats.subscribe(drawChart);
viewModel.showCareerStats.subscribe(drawChart);
viewModel.showStoredStats.subscribe(drawChart);
viewModel.showName.subscribe(drawChart);

drawChart();