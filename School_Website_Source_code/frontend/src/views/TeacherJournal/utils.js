export function isValue(value, falsyValues = []) {
	return [undefined, null, ...falsyValues].includes(value) ? false : true
}

export function getValueFromDict(dict, keys, defaultValue, falsyValues = []) {
	let result = defaultValue

	for (let i = 0; i < keys.length; i++) {
		const key = `${keys[i]}`

		if (i === 0) {
			if (!isValue(dict, falsyValues)) return defaultValue
			result = dict[key]

		} else result = result[key]

		if (!isValue(result, falsyValues)) return defaultValue
	}

	return result
}

export function generateDictStructure(dict, keys, lastDictFieldValue) {
	for (let i = 0; i < keys.length; i++) {
		const key = `${keys[i]}`

		if (!Object.keys(dict).includes(key)) {
			if (i === keys.length - 1) {
				dict[key] = lastDictFieldValue
				return
			}

			dict[key] = {}
		}

		dict = dict[key]
	}
}

export function getWeekNumber(startDate, targetDate) {
	if (!startDate || !targetDate) return null

	const start = new Date(startDate);
	const target = new Date(targetDate);

	const diffMs = target - start;
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	const weekNumber = Math.floor(diffDays / 7) + 1;
	return weekNumber;
}