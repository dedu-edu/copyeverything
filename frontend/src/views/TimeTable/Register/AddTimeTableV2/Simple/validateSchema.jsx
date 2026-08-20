import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	type: Yup.string()
		.trim()
		.required('Хоосон байна'),
	// st_count: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	odd_even: Yup.string()
		.trim()
		.required('Хоосон байна'),
	study_type: Yup.string()
		.trim()
		.required('Хоосон байна'),
	room: Yup.string()
		.trim()
		.required('Хоосон байна'),
	day: Yup.string()
		.trim()
		.required('Хоосон байна'),
	begin_week: Yup.string()
		.trim()
		.required('Хоосон байна'),
	end_week: Yup.string()
		.trim()
		.required('Хоосон байна'),
	time: Yup.string()
		.trim()
		.required('Хоосон байна'),
	lesson: Yup.string()
		.trim()
		.required('Хоосон байна'),
	// potok: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	teacher: Yup.string()
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
});
