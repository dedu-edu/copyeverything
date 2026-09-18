
import * as Yup from 'yup'
import { t } from 'i18next'

export const validateSchema = Yup.object().shape({
    date: Yup.string().trim().required(t('Хоосон байна')),
    type: Yup.string().trim().required(t('Хоосон байна')),
})