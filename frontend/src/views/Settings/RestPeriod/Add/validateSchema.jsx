import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    lesson_year: Yup.string()
        .trim()
        .required('Хоосон байна'),
    lesson_season: Yup.string()
        .trim()
        .required('Хоосон байна'),
    start_date: Yup.string()
        .trim()
        .required('Хоосон байна')
        .test('is-monday', 'Эхлэх огноо Даваа гараг байх ёстой', (value) => {
            if (!value) return true;
            const date = new Date(value);
            return date.getDay() === 1; // 1 = Даваа
        }),
    end_date: Yup.string()
        .trim()
        .required('Хоосон байна')
        .test('is-sunday', 'Дуусах огноо Ням гараг байх ёстой', (value) => {
            if (!value) return true;
            const date = new Date(value);
            return date.getDay() === 0; // 0 = Ням
        })
        .test('is-after-start', 'Дуусах огноо эхлэх огнооноос хойш байх ёстой', function (value) {
            const { start_date } = this.parent;
            if (!start_date || !value) return true;
            return new Date(value) > new Date(start_date);
        }),
});