import './knockout-persist.js';
import { DEFAULT_OPTIONS, NON_PERSISTENT_OPTIONS } from './constants.js';
import * as storage from './storage.js';

export default function ViewModel(options) {
	ko.mapping.fromJS(options, {
		'storedStats': {
			create: (options) => ko.observable(options.data)
		}
	}, this);

	var persistableKeys = Object.keys(DEFAULT_OPTIONS)
		.filter((key) => NON_PERSISTENT_OPTIONS.indexOf(key) == -1);

	persistableKeys.forEach((key) => {
		this[key].extend({ persist: key });
	});

	this.statsMeta = {};
	
	this.resetStats = () => {
		this.selectedStats(DEFAULT_OPTIONS.selectedStats.slice(0));
	};

	this.resetAll = () => {
		persistableKeys.forEach((key) => {
			this[key](DEFAULT_OPTIONS[key]);
		});

		storage.deleteAll();
	}

	this.toggleSettings = () => {
		this.showSettings(!this.showSettings());
	};

	this.getStatLabel = (stat) => {
		return this.statsMeta[stat].label;
	};

	this.storeStats = () => {
		this.storedStats({
			name: this.name,
			statsCareer: this.statsCareer,
			statsMonthly: this.statsMonthly
		});
	};

	this.resetStoredStats = () => {
		this.storedStats(null);
	};

	this.hasStoredStats = ko.computed(() => {
		return !!this.storedStats();
	});
};