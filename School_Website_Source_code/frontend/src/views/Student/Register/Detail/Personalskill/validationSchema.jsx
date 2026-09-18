
import * as Yup from 'yup'
import { t } from 'i18next'

export const validateSchema = Yup.object().shape({
    skill_name: Yup.string().trim().required(t('Хоосон байна')),
    level:      Yup.string().trim().required(t('Хоосон байна')),
})