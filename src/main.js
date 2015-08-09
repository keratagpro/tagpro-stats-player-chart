// Last max value update from tagpro-stats.com: 2015-08-08

// import * as storage from 'lib/storage.js';
import viewModel from 'lib/viewModel.js';
import * as constants from 'lib/constants.js';

require('lib/knockout-sortable');
var fs = require('fs');

GM_addStyle(fs.readFileSync(__dirname + '/templates/style.css', 'utf8'));

var careerRowSelector = 'nav.navbar + .row > .col-lg-8 > .row';
var monthlyRowSelector = 'nav.navbar + .row > .col-lg-8 > .row + .row';
var sidebarSelector = 'nav.navbar + .row > .col-lg-4';

var tableSelector = '.statstable';
var $careerTable = $(careerRowSelector).find(tableSelector).first();
var $monthlyTable = $(monthlyRowSelector).find(tableSelector).first();

var $panel = $(fs.readFileSync(__dirname + '/templates/panel.html', 'utf8'));

$(sidebarSelector).prepend($panel);

// var games = 1000;
// var order = _.contains(constants.ascendingStats, statname) ? 'asc' : 'desc';

// var url = `/get_table.php?range=all&stat=${statname}&game=${games}&row=1&order=${order} tr:nth-child(2) td:last-child`
// $('#chartPanel .panel-body').append($(`<span>${statname} </span>`).append($('<span>').load(url)));

statsMeta = {};

function getStatsFromTable(table, injectInputs) {
	var stats = {};

	table.find('td.head').each(function() {
		var link = $(this).siblings('td.rank').find('a').attr('href');
		var stat = link.match(/stat=([^&]+)/);

		if (!stat) {
			return;
		}

		var statname = stat[1];
		var label = $(this).text();

		if (!statsMeta[statname]) {
			var [dividend, divisor] = label.split('/', 2);

			statsMeta[statname] = {
				label: label,
				labelDividend: dividend,
				labelDivisor: constants.divisorLabelMappings[divisor]
			};
		}

		stats[statname] = {
			label: label,
			value: parseFloat($(this).siblings('td.stat').first().text())
		};

		if (injectInputs) {
			var $input = $('<input type="checkbox" class="pull-right" data-bind="visible: customizeStats, checked: selectedStats">').attr('value', statname);
			$(this).prepend($input);
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
		if (!val && statsMeta[stat]) {
			var meta = statsMeta[stat];
			var statDividend = _.findKey(stats, { 'label': meta.labelDividend });
			var statDivisor = _.findKey(stats, { 'label': meta.labelDivisor });
			val = stats[statDividend].value / stats[statDivisor].value;
		}
		else {
			val = val.value;
		}

		if (_.contains(constants.ascendingStats, stat)) {
			return 0;
		}
		else {
			return ((val / constants.statMaxValues[stat]) * 100.0).toFixed(2);
		}
	});
}

function drawChart() {
	var ctx = document.getElementById('chart').getContext('2d');

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
			return statsMeta[stat].label;
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

	var chart = new Chart(ctx).Radar(data, opts);
	$('#chartLegend').html(chart.generateLegend());
}

viewModel.selectedStats.subscribe(drawChart);
viewModel.showMonthlyStats.subscribe(drawChart);
viewModel.showCareerStats.subscribe(drawChart);

drawChart();