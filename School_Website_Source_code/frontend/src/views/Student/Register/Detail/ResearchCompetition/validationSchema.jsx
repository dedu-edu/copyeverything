
import * as Yup from 'yup'
import { t } from 'i18next'

export const validateSchema = Yup.object().shape({
    year:             Yup.number().required(t('Хоосон байна')),
    competition_name: Yup.string().trim().required(t('Хоосон байна')),
    topic:            Yup.string().trim().required(t('Хоосон байна')),
    organizer:        Yup.string().trim().required(t('Хоосон байна')),
})