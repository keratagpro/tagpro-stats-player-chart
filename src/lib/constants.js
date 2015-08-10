export const NEGATIVE_STATS = [
	'drops',
	'dropgame',
	'drophour',
	'popped',
	'popgame',
	'pophour',
	'dcs'
];

export const DIVISOR_LABEL_MAPPINGS = {
	'Game': 'Games',
	'Hour': 'Hours',
	'Grab': 'Grabs',
	'Pop': 'Popped'
};

export const DEFAULT_OPTIONS = {
	chartType: 'radar',
	showSettings: false,
	showCareerStats: true,
	showMonthlyStats: true,
	showBestStats: false,
	customizeStats: false,
	selectedStats: [
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
	]
};

export const NON_PERSISTENT_OPTIONS = [
	'showSettings',
	'customizeStats'
];