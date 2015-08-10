const DEFAULT_STATS = [
	'capgrab',
	'capgame',
	'grabgame',
	'dropgame',
	'popgame',
	'preventgame',
	'returngame',
	'supportgame',
	'taggame',
	'holdgame'
];

export default function ViewModel() {
	this.chartType = ko.observable('radar');
	this.showSettings = ko.observable(false);
	this.showCareerStats = ko.observable(true);
	this.showMonthlyStats = ko.observable(true);
	this.customizeStats = ko.observable(false);
	this.selectedStats = ko.observableArray(DEFAULT_STATS.slice(0));
	this.statsMeta = {};
	
	this.resetStats = () => {
		this.selectedStats(DEFAULT_STATS);
	};

	this.toggleSettings = () => {
		this.showSettings(!this.showSettings());
	};

	this.getStatLabel = (stat) => {
		return this.statsMeta[stat].label;
	};
};