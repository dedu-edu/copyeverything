export const onChangeFile = (e, setImageOld) => {
	const reader = new FileReader()
	const files = e.target.files

	if (files.length > 0) {
		reader.onload = function () {
			setImageOld(reader.result)
		}
		reader.readAsDataURL(files[0])
	}
}

// OnlineSubInfo file_type choices
export const PDF = 1
export const VIDEO = 2
export const TEXT = 3
export const AUDIO = 4
export const QUIZ = 5

// QuezQuestions kind choices
export const KIND_ONE_CHOICE = 1
export const KIND_MULTI_CHOICE = 2
export const KIND_BOOLEAN = 3
export const KIND_RATING = 4
export const KIND_TEXT = 5
export const KIND_SHORT_CHOICE = 6
export const KIND_JISHIH_CHOICE = 7
export const KIND_ESTIMATE_CHOICE = 8
export const KIND_PROJECT_CHOICE = 9
export const KIND_TOVCH_CHOICE = 10

export function nullifySpecifiedValues(dictData, excludedValues) {
	if ([null, undefined].includes(dictData)) return null
	if (!Array.isArray(excludedValues)) return null

	Object.keys(dictData).forEach(field => {
		if (excludedValues.includes(dictData[field]))
			dictData[field] = null
	})

	return dictData
}

export function nullifyLackFields(dictData, fields) {
	if ([null, undefined].includes(dictData)) return null
	if (!Array.isArray(fields)) return null

	fields.forEach(field => {
		if (!Object.prototype.hasOwnProperty.call(dictData, field))
			dictData[field] = null
	})

	return dictData
}

export function getOnlySpecifiedFields(allFieldsDict, gettingFieldNames) {
	return Object.fromEntries(
		Object.entries(allFieldsDict).filter(([key]) => gettingFieldNames.includes(key))
	)
}

export const kindOptions = [
	{ id: KIND_ONE_CHOICE, name: 'Нэг сонголт' },
	{ id: KIND_SHORT_CHOICE, name: 'Богино нөхөх хариулт' },
	{ id: KIND_JISHIH_CHOICE, name: 'Харгалзуулах, жиших' },
	{ id: KIND_ESTIMATE_CHOICE, name: 'Тооцоолж бодох' },
	{ id: KIND_PROJECT_CHOICE, name: 'Төсөл боловсруулах' },
	{ id: KIND_TOVCH_CHOICE, name: 'Товч хариулт' },
	{ id: KIND_MULTI_CHOICE, name: 'Олон сонголт' },
	{ id: KIND_BOOLEAN, name: 'Үнэн, Худлыг олох' },
	{ id: KIND_TEXT, name: 'Эссэ бичих' },
	{ id: KIND_RATING, name: 'Үнэлгээ' },
]

export const formFieldNames = {
	quezQuestions: {
		kind: 'kind',
		question: 'question',
		image: 'image',
		score: 'score',
		yes_or_no: 'yes_or_no',
		rating_max_count: 'rating_max_count',
		low_rating_word: 'low_rating_word',
		high_rating_word: 'high_rating_word',
		max_choice_count: 'max_choice_count',
	},
	quezChoices: {
		choices: 'choices',
		image: 'image',
		score: 'score',
	}
}

// to convert string e.g. "questions[0].question" to parsed [full_name, index, key] (example result is: ['questions[0].question', 0, 'question'])
export function parseObjectPath(path) {
	const regex = /([^\[\].]+)|\[(\d+)\]/g
	const result = []
	let match

	while ((match = regex.exec(path)) !== null) {
		result.push(match[1] !== undefined ? match[1] : Number(match[2]))
	}

	return result
}

export function buildFilePath(filePath) {
	return filePath
	if (typeof filePath !== 'string') return null

	function isAbsoluteUrl(str) {
		try {
			new URL(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	return isAbsoluteUrl(filePath) ? filePath : process.env.REACT_APP_CDN_URL + '' + filePath
}
