
import * as Yup from 'yup'
import { t } from 'i18next'

export const validateSchema = Yup.object().shape({
    year:               Yup.string().trim().required(t('Хоосон байна')),
    name:               Yup.string().trim().required(t('Хоосон байна')),
    participation_type: Yup.string().trim().required(t('Хоосон байна')),
    organizer:          Yup.string().trim().required(t('Хоосон байна')),
})