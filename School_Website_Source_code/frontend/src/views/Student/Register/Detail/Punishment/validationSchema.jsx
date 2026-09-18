
import * as Yup from 'yup'
import { t } from 'i18next'

export const validateSchema = Yup.object().shape({
    has_punishment: Yup.boolean(),
    punishment_note: Yup.string().when('has_punishment', {
        is: true,
        then: (s) => s.trim().required(t('Хоосон байна')),
        otherwise: (s) => s.notRequired(),
    }),
    has_crime: Yup.boolean(),
    crime_note: Yup.string().when('has_crime', {
        is: true,
        then: (s) => s.trim().required(t('Хоосон байна')),
        otherwise: (s) => s.notRequired(),
    }),
    // violation: Yup.string().when('has_crime', {
    //     is: true,
    //     then: (s) => s.trim().required(t('Хоосон байна')),
    //     otherwise: (s) => s.notRequired(),
    // }),
})