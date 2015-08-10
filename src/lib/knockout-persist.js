import * as storage from './storage.js';

ko.extenders.persist = (target, key) => {
	var initialValue = target();

	if (key) {
		var val = storage.getItem(key);
		
		if (val !== null) {
			initialValue = val;
		}
	}
	
	target(initialValue);

	target.subscribe(val => storage.setItem(key, val));
	
	return target;
}