import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	name: Yup.string()
		.trim()
		.nullable()
		.required('Хоосон байна'),
	type: Yup.number()
		.transform(value => (isNaN(value) ? undefined : value))
		.required('Хоосон байна'),
});
