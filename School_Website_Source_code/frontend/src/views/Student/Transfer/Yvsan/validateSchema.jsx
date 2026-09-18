import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    // statement_date: Yup.string()
    //     .trim()
    //     .required('Хоосон байна.'),
    // statement: Yup.string()
    //     .trim()
    //     .required('Хоосон байна.'),
    student: Yup.string()
        .trim()
        .required('Хоосон байна.'),
});
