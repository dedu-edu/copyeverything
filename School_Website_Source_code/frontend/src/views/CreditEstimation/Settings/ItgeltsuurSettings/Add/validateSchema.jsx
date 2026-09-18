import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
    desc: Yup.string()
		.trim()
		.required('Хоосон байна'),
	itgeltsuur: Yup.string()
		.trim()
		.required('Хоосон байна'),

});
