// Last max value update from tagpro-stats.com: 2015-08-08

// import * as storage from 'lib/storage.js';
import ViewModel from 'lib/viewModel.js';
import { NEGATIVE_STATS, DIVISOR_LABEL_MAPPINGS } from 'lib/constants.js';
import { statMaxValues, statMinValues } from 'lib/statLimits.js';

require('lib/knockout-sortable');
var fs = require('fs');

GM_addStyle(fs.readFileSync(__dirname + '/templates/style.css', 'utf8'));

var viewModel = new ViewModel();

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
	if (_.contains(NEGATIVE_STATS, stat)) {
		return statMinValues[stat];
	}
	else {
		return statMaxValues[stat];
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
				labelDivisor: DIVISOR_LABEL_MAPPINGS[divisor]
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

var userCareerStats = getStatsFromTable($careerTable, true);
var userMonthlyStats = getStatsFromTable($monthlyTable, true);

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

		var max = statMaxValues[stat];
		var percentage;

		if (_.contains(NEGATIVE_STATS, stat)) {
			let min = statMinValues[stat];
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

function drawChart() {

	var datasets = [];

	if (viewModel.showCareerStats()) {
		var dataset = {
			label: 'Career',
			fillColor : "rgba(151,187,205,0.5)",
			strokeColor : "rgba(151,187,205,1)",
			pointColor : "rgba(151,187,205,1)",
			pointStrokeColor : "#fff",
			data : calculateValues(userCareerStats),
		};

		datasets.push(dataset);
	}

	if (viewModel.showMonthlyStats()) {
		var dataset = {
			label: 'Monthly',
			fillColor : "rgba(220,220,220,0.5)",
			strokeColor : "rgba(220,220,220,1)",
			pointColor : "rgba(220,220,220,1)",
			pointStrokeColor : "#fff",
			data : calculateValues(userMonthlyStats)
		}

		datasets.push(dataset);
	}

	var data = {
		labels : _.map(viewModel.selectedStats(), function(stat) {
			return viewModel.statsMeta[stat].label;
		}),
		datasets : datasets
	};

	var opts = {
		scaleOverlay: true,
		scaleOverride: true,
		scaleSteps: 4,
		scaleStepWidth: 25,
		responsive: true
	};

	if (chart) {
		chart.destroy();
	}

	switch(viewModel.chartType()) {
		case 'radar':
			chart = new Chart(ctx).Radar(data, opts);
			break;
		case 'bar':
			chart = new Chart(ctx).Bar(data, opts);
			break;
	}

	$('#chartLegend').html(chart.generateLegend());
}

viewModel.chartType.subscribe(drawChart);
viewModel.selectedStats.subscribe(drawChart);
viewModel.showMonthlyStats.subscribe(drawChart);
viewModel.showCareerStats.subscribe(drawChart);

drawChart();