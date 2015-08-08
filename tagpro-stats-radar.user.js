// ==UserScript==
// @name          TagPro Stats Radar Chart
// @author        Kera
// @version       0.3
// @description   Radar Chart of a TagPro player's stats. 
// @namespace     https://keratagpro.github.io
// @downloadURL   https://keratagpro.github.io/tagpro-stats-radar/tagpro-stats-radar.user.js
// @updateURL     https://keratagpro.github.io/tagpro-stats-radar/tagpro-stats-radar.meta.js
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_addStyle
// @require       https://cdnjs.cloudflare.com/ajax/libs/Chart.js/1.0.2/Chart.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js
// @include       http://tagpro-stats.com/profile.php?userid=*
// @include       http://www.tagpro-stats.com/profile.php?userid=*
// @copyright     2015, Kera
// ==/UserScript==

// Last max value update from tagpro-stats.com: 2015-08-08

GM_addStyle("\
	#radarLegend ul { list-style: none; text-align: right; }\
	#radarLegend li span { display: inline-block; width: 12px; height: 12px; margin-right: 5px }");

var options = {
	careerStats: true,
	monthlyStats: true,
	dataPoints: [
		{ dividend: "Captures", divisor: "Grabs", max: 0.5556 }, // http://tagpro-stats.com/#range=all&stat=capgrab&page=0&game=100&row=10&order=desc&active=0
		{ dividend: "Captures", divisor: "Games", max: 2.0388 }, // http://tagpro-stats.com/#range=all&stat=capgame&page=0&game=100&row=10&order=desc&active=0
		{ dividend: "Grabs", divisor: "Games", max: 7.8214 }, // http://tagpro-stats.com/#range=all&stat=grabgame&page=0&game=100&row=10&order=desc&active=0
		{ dividend: "Drops", divisor: "Games", max: 6.7652 }, // http://tagpro-stats.com/#range=all&stat=dropgame&page=0&game=100&row=10&order=desc&active=0
		{ dividend: "Popped", divisor: "Games", max: 9.4882 }, // http://tagpro-stats.com/#range=all&stat=popgame&page=0&game=100&row=10&order=desc&active=0
		{ dividend: "Prevent", divisor: "Games", max: 74.4694 }, // http://tagpro-stats.com/#range=all&stat=preventgame&page=0&game=100&row=10&order=desc&active=0
		{ dividend: "Returns", divisor: "Games", max: 11.4059 }, // http://tagpro-stats.com/#range=all&stat=returngame&page=0&game=100&row=10&order=desc&active=0
		{ dividend: "Support", divisor: "Games", max: 27.1683 }, // http://tagpro-stats.com/#range=all&stat=supportgame&page=0&game=100&row=10&order=desc&active=0
		{ dividend: "Tags", divisor: "Games", max: 12.3366 }, // http://tagpro-stats.com/#range=all&stat=taggame&page=0&game=100&row=10&order=desc&active=0
		{ dividend: "Hold", divisor: "Games", max: 108.4094 } // http://tagpro-stats.com/#range=all&stat=holdgame&page=0&game=100&row=10&order=desc&active=0
	]
};

var careerRowSelector = 'nav.navbar + .row > .col-lg-8 > .row';
var monthlyRowSelector = 'nav.navbar + .row > .col-lg-8 > .row + .row';
var sidebarSelector = 'nav.navbar + .row > .col-lg-4';

var tableSelector = '.statstable';
var $careerTable = $(careerRowSelector).find(tableSelector).first();
var $monthlyTable = $(monthlyRowSelector).find(tableSelector).first();

var $panel = $('\
	<div class="panel panel-default">\
		<div class="panel-heading text-center">Summary</div>\
		<div class="panel-body">\
			<canvas id="radarChart"></canvas>\
			<div id="radarLegend"></div>\
		</div>\
	</div>');

$(sidebarSelector).prepend($panel);

function parseStatsFromTable(table, labels) {
	var rows = $(table).find('td.head');
	var stats = {};

	_.forEach(labels, function(label) {
		var $label = rows.filter(function(_) { return $(this).text() === label; });
		stats[label] = parseInt($label.first().next().text());
	});

	return stats;
}

function calculateValues(stats) {
	return _.map(options.dataPoints, function(data) {
		var val = stats[data.dividend] / stats[data.divisor];
		return ((val / data.max) * 100.0).toFixed(2);
	});
}

function drawChart() {
	var ctx = document.getElementById('radarChart').getContext('2d');

	var labels = _.union(_.map(options.dataPoints, 'dividend'), _.map(options.dataPoints, 'divisor'));

	var datasets = [];

	if (options.careerStats) {
		var stats = parseStatsFromTable($careerTable, labels);

		var dataset = {
			label: 'Career',
			fillColor : "rgba(151,187,205,0.5)",
			strokeColor : "rgba(151,187,205,1)",
			pointColor : "rgba(151,187,205,1)",
			pointStrokeColor : "#fff",
			data : calculateValues(stats),
		};

		datasets.push(dataset);
	}

	if (options.monthlyStats) {
		var stats = parseStatsFromTable($monthlyTable, labels);

		var dataset = {
			label: 'Monthly',
			fillColor : "rgba(220,220,220,0.5)",
			strokeColor : "rgba(220,220,220,1)",
			pointColor : "rgba(220,220,220,1)",
			pointStrokeColor : "#fff",
			data : calculateValues(stats)
		}

		datasets.push(dataset);
	}

	var data = {
		labels : _.map(options.dataPoints, function(item) {
			return item.label || item.dividend + '/' + item.divisor.replace(/s$/, '');
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
	$('#radarLegend').append(chart.generateLegend());
}

drawChart();