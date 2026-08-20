
import * as Yup from 'yup'
import { t } from 'i18next'

export const validateSchema = Yup.object().shape({
    text: Yup.string().trim().required(t('Хоосон байна')),
})