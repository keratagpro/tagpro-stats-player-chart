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
	showName: true,
	showLegend: true,
	showBestStats: false,
	showStoredStats: true,
	customizeStats: false,
	storedStats: null,
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

export const COLOR_SCHEMES = [
	// Stored stat career
	{
		fill: 'rgba(255, 222, 184, 0.5)',
		stroke: 'rgba(255, 222, 184, 1)',
		point: 'rgba(255, 222, 184, 1)'
	},
	// Stored stat monthly
	{
		fill: 'rgba(255, 237, 217, 0.5)',
		stroke: 'rgba(255, 237, 217, 1)',
		point: 'rgba(255, 237, 217, 1)'
	},
	// Career
	{
		fill: 'rgba(151, 187, 205, 0.5)',
		stroke: 'rgba(151, 187, 205, 1)',
		point: 'rgba(151, 187, 205, 1)'
	},
	// Monthly
	{
		fill: 'rgba(220, 220, 220, 0.5)',
		stroke: 'rgba(220, 220, 220, 1)',
		point: 'rgba(220, 220, 220, 1)'
	}
];