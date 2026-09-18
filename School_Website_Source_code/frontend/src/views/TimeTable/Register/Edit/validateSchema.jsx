import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	odd_even: Yup.string()
        .test('required', 'Хоосон байна', (val, context) => {
            if (context?.parent?.is_kurats) return true
            else return val
        }),
	begin_week: Yup.string()
        .test('required', 'Хоосон байна', (val, context) => {
            if (context?.parent?.is_kurats) return true
            else return val
        }),
	end_week: Yup.string()
        .test('required', 'Хоосон байна', (val, context) => {
            if (context?.parent?.is_kurats) return true
            else return val
        }),
	begin_date: Yup.string()
        .test('required', 'Хоосон байна', (val, context) => {
            if (!context?.parent?.is_kurats) return true
            else return val
        }),
	end_date: Yup.string()
        .test('required', 'Хоосон байна', (val, context) => {
            if (!context?.parent?.is_kurats) return true
            else return val
        }),
	type: Yup.string()
		.trim()
		.required('Хоосон байна'),
	study_type: Yup.string()
		.trim()
		.required('Хоосон байна'),
	group: Yup.array()
        .test('is-group-required', 'Анги оруулна уу', function(val) {
            const { is_optional, sub_group, level_group } = this.parent; // context-оос илүү parent-аас авах нь найдвартай

            // Хэрэв сонгон БИШ бол массив дотор дор хаяж 1 утга байх ёстой
            if (!is_optional && !sub_group?.length && !level_group?.length) {
                return val && val.length > 0;
            }

            // Бусад тохиолдолд (сонгон бол) зүгээр
            return true;
        }),
	room: Yup.string()
        .test('required', 'Хоосон байна', (val, context) => {
            if (context?.parent?.study_type !== 2) return true
            else return val
        }),
	kurats_room: Yup.string()
        .test('required', 'Хоосон байна', (val, context) => {
            if (!context?.parent?.is_kurats) return true
            else return val
        }),
	day: Yup.string()
        .test('required', 'Хоосон байна', (val, context) => {
            if (context?.parent?.is_kurats) return true
            else return val
        }),
	time: Yup.string()
		.trim()
		.required('Хоосон байна'),
	lesson: Yup.string()
		.trim()
		.required('Хоосон байна'),
});
