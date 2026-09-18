import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    lesson:Yup.string()
        .trim()
        .required('Хоосон байна'),
    status:Yup.string()
        .trim()
        .required('Хоосон байна'),
    begin_date: Yup.string()
            .trim()
            .required('Хоосон байна'),
    end_date: Yup
        .mixed()
        .test(
            "hoosn", "Хоосон байна", (value, context) => {
                return value
            })
        .test(
            "min", "Эхлэх цагаас их байх ёстой", (value, context) => {
                return value > context?.parent?.begin_date
            },
        )
})
