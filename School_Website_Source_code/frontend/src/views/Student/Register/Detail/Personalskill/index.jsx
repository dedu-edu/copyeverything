
import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import {
    Row, Col, Form, Input, Label, FormFeedback,
    CardHeader, Card, Button, CardTitle,
    Modal, ModalBody, ModalHeader,
} from 'reactstrap'

import Select from 'react-select'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import AuthContext from '@context/AuthContext'
import { validate, convertDefaultValue, ReactSelectStyles } from '@utils'
import Tables from './Tables'
import { validateSchema } from './validationSchema'
import { useTranslation } from 'react-i18next'
import SchoolContext from '@context/SchoolContext'

const PersonalSkill = () => {

    const { school_id } = useContext(SchoolContext)
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema))
    const { Loader, isLoading, fetchData } = useLoader({ isSmall: true })
    const { user } = useContext(AuthContext)
    const { studentId } = useParams()
    const { t } = useTranslation()

    const [disabled, setDisabled] = useState(true)
    const [is_edit, setEdit] = useState(false)
    const [show, setShow] = useState(false)
    const [datas, setDatas] = useState([])

    const personalSkillApi = useApi().student.personalSkill

    const levelOptions = [
        { value: 'good', label: t('Сайн') },
        { value: 'avg',  label: t('Дунд') },
        { value: 'bad',  label: t('Муу')  },
    ]

    const skillOptions = [
        { value: 'Харилцаа, багаар ажиллах чадвар',        label: t('Харилцаа, багаар ажиллах чадвар') },
        { value: 'Шийдвэр гаргах чадвар',                  label: t('Шийдвэр гаргах чадвар') },
        { value: 'Сахилга, хариуцлага, үүрэг хүлээх чадвар', label: t('Сахилга, хариуцлага, үүрэг хүлээх чадвар') },
        { value: 'Манлайлал, нийгмийн идэвхи',             label: t('Манлайлал, нийгмийн идэвхи') },
        { value: 'Шинийг санаачлага гаргах чадвар',        label: t('Шинийг санаачлага гаргах чадвар') },
        { value: 'Ачаалал даах чадвар',                    label: t('Ачаалал даах чадвар') },
    ]

    async function handleDelete(id) {
        const { success } = await fetchData(personalSkillApi.delete(studentId, id))
        if (success) getDatas()
    }

    const onModalClosed = () => {
        reset()
        setShow(false)
    }

    const getDatas = async () => {
        const { success, data } = await fetchData(personalSkillApi.get(studentId))
        if (success) setDatas(data)
    }

    useEffect(() => {
        if (Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-update') && school_id) {
            setDisabled(false)
        }
        getDatas()
    }, [user, show])

    async function handleEdit(cdata) {
        setEdit(true)
        setShow(true)
        if (cdata === null) return
        for (let key in cdata) {
            if (cdata[key] === null) setValue(key, '')
            else setValue(key, cdata[key])
        }
    }

    async function onSubmit(cdata) {
        cdata['student'] = studentId
        cdata = convertDefaultValue(cdata)

        if (is_edit) {
            var id = cdata['id']
            const { success, error } = await fetchData(personalSkillApi.put(cdata, id, studentId))
            if (success) {
                getDatas()
                onModalClosed()
            } else {
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg })
                }
            }
        } else {
            const { success, error } = await fetchData(personalSkillApi.post(cdata))
            if (success) {
                getDatas()
                onModalClosed()
            } else {
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg })
                }
            }
        }
    }

    return (
        <Card>
            <CardHeader className='d-flex justify-content-between py-0 px-0'>
                <CardTitle tag='h4'>{t('Хувь хүний ур чадвар, чадамж')}</CardTitle>
                <Button disabled={disabled} color='primary' size='sm' onClick={() => { setShow(true); setEdit(false) }}>
                    {t('Нэмэх')}
                </Button>
            </CardHeader>
            <hr />
            <Tables datas={datas} handleDelete={handleDelete} handleEdit={handleEdit} is_role={disabled} levelOptions={levelOptions} />
            <Modal isOpen={show} toggle={() => setShow(!show)} className='modal-dialog-centered' onClosed={onModalClosed}>
                <ModalHeader className='bg-transparent pb-0' toggle={() => setShow(!show)}></ModalHeader>
                <h5 className='text-center'>{t('Хувь хүний ур чадвар, чадамж')}</h5>
                <ModalBody className='px-sm-3 pb-2'>
                    <Row tag={Form} className='gy-1 pb-2' onSubmit={handleSubmit(onSubmit)}>

                        <Col lg={12}>
                            <Label className='form-label'>{t('Ур чадвар, зан байдал')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='skill_name'
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={skillOptions}
                                        styles={ReactSelectStyles}
                                        value={skillOptions.find(o => o.value === value) || null}
                                        isDisabled={disabled}
                                        onChange={(val) => onChange(val?.value || '')}
                                        className={errors.skill_name ? 'is-invalid' : ''}
                                    />
                                )}
                            />
                            {errors.skill_name && <FormFeedback className='d-block'>{errors.skill_name.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label'>{t('Үнэлгээ')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='level'
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={levelOptions}
                                        styles={ReactSelectStyles}
                                        value={levelOptions.find(o => o.value === value) || null}
                                        isDisabled={disabled}
                                        onChange={(val) => onChange(val?.value || '')}
                                        className={errors.level ? 'is-invalid' : ''}
                                    />
                                )}
                            />
                            {errors.level && <FormFeedback className='d-block'>{errors.level.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label'>{t('Тайлбар')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='note'
                                render={({ field }) => (
                                    <Input
                                        bsSize='sm' {...field}
                                        placeholder={t('Тайлбар')} type='textarea'
                                        readOnly={disabled} disabled={disabled}
                                        invalid={errors.note && true}
                                    />
                                )}
                            />
                            {errors.note && <FormFeedback className='d-block'>{errors.note.message}</FormFeedback>}
                        </Col>

                        <Col className='d-flex justify-content-center gap-2' md={12}>
                            {isLoading && Loader}
                            <Button size='sm' color='primary' type='submit'>
                                {is_edit ? t('Засах') : t('Хадгалах')}
                            </Button>
                            <Button color='secondary' size='sm' type='reset' outline onClick={onModalClosed}>
                                {t('Буцах')}
                            </Button>
                        </Col>

                    </Row>
                </ModalBody>
            </Modal>
        </Card>
    )
}

export default PersonalSkill