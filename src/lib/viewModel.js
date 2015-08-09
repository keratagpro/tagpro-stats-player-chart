export default {
	showCareerStats: ko.observable(true),
	showMonthlyStats: ko.observable(true),
	customizeStats: ko.observable(false),
	selectedStats: ko.observableArray([
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
	])
};