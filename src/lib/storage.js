export function getItem(name) {
	return JSON.parse(GM_getValue(name) || null);
}

export function setItem(name, value) {
	GM_setValue(name, JSON.stringify(value));
}

export function getAll() {
	var values = {};
	GM_listValues().forEach((key) => {
		values[key] = getItem(key);
	});
	return values;
}

export function deleteAll() {
	GM_listValues().forEach(GM_deleteValue);
}