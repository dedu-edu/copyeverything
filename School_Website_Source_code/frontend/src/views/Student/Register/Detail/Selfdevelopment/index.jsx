
import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import {
    Row, Col, Form, Input, Label, FormFeedback,
    CardHeader, Card, Button, CardTitle,
    Modal, ModalBody, ModalHeader,
} from 'reactstrap'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { Mongolian } from 'flatpickr/dist/l10n/mn.js'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import AuthContext from '@context/AuthContext'
import { validate, convertDefaultValue ,ReactSelectStyles} from '@utils'
import { validateSchema } from './validationSchema'
import { useTranslation } from 'react-i18next'
import Tables from './Tables'

const SelfDevelopment = () => {

    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema))
    const { Loader, isLoading, fetchData } = useLoader({ isSmall: true })
    const { user } = useContext(AuthContext)
    const { studentId } = useParams()
    const { t } = useTranslation()

    const [disabled, setDisabled] = useState(true)
    const [is_edit, setEdit] = useState(false)
    const [show, setShow] = useState(false)
    const [datas, setDatas] = useState([])

    const selfDevelopmentApi = useApi().student.selfDevelopment

    async function handleDelete(id) {
        const { success } = await fetchData(selfDevelopmentApi.delete(studentId, id))
        if (success) getDatas()
    }

    const onModalClosed = () => {
        reset()
        setShow(false)
    }

    const getDatas = async () => {
        const { success, data } = await fetchData(selfDevelopmentApi.get(studentId))
        if (success) setDatas(data)
    }

    useEffect(() => {
        if (Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-update')) {
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
            const { success, error } = await fetchData(selfDevelopmentApi.put(cdata, id, studentId))
            if (success) {
                getDatas()
                onModalClosed()
            } else {
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg })
                }
            }
        } else {
            const { success, error } = await fetchData(selfDevelopmentApi.post(cdata))
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
                <CardTitle tag='h4'>{t('Өөрийгөө хөгжүүлсэн байдал')}</CardTitle>
                <Button disabled={disabled} color='primary' size='sm' onClick={() => { setShow(true); setEdit(false) }}>
                    {t('Нэмэх')}
                </Button>
            </CardHeader>
            <hr />
            <Tables datas={datas} handleDelete={handleDelete} handleEdit={handleEdit} is_role={disabled} />
            <Modal isOpen={show} toggle={() => setShow(!show)} className='modal-dialog-centered' onClosed={onModalClosed}>
                <ModalHeader className='bg-transparent pb-0' toggle={() => setShow(!show)}></ModalHeader>
                <h5 className='text-center'>{t('Өөрийгөө хөгжүүлсэн байдал')}</h5>
                <ModalBody className='px-sm-3 pb-2'>
                    <Row tag={Form} className='gy-1 pb-2' onSubmit={handleSubmit(onSubmit)}>

                        <Col lg={12}>
                            <Label className='form-label' for='year'>{t('Он')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='year'
                                render={({ field }) => (
                                    <Input
                                        id='year'
                                        bsSize='sm'
                                        {...field}
                                        placeholder={t('Он')}
                                        type='number'
                                        readOnly={disabled}
                                        disabled={disabled}
                                        invalid={errors.year && true}
                                    />
                                )}
                            />
                            {errors.year && <FormFeedback className='d-block'>{errors.year.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label' for='course_name'>{t('Суралцсан сургалт, клуб, дугуйлан')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='course_name'
                                render={({ field }) => (
                                    <Input
                                        id='course_name'
                                        bsSize='sm'
                                        {...field}
                                        placeholder={t('Суралцсан сургалт, клуб, дугуйлан')}
                                        type='textarea'
                                        readOnly={disabled}
                                        disabled={disabled}
                                        invalid={errors.course_name && true}
                                    />
                                )}
                            />
                            {errors.course_name && <FormFeedback className='d-block'>{errors.course_name.message}</FormFeedback>}
                        </Col>

                       <Col lg={12}>
                            <Label className='form-label'>{t('Элссэн, төгссөн он, сар')}</Label>

                            <Controller
                                defaultValue=''
                                control={control}
                                name='elssen_togsson_year'
                                render={({ field: { value, onChange } }) => {

                                    const parts = value ? value.split(' - ') : ['', '']

                                    const start = parts[0]?.split('-') || ['', '']
                                    const end = parts[1]?.split('-') || ['', '']

                                    return (
                                        <div className='d-flex flex-column gap-1'>

                                            {/* Элссэн */}
                                            <div className='d-flex align-items-center gap-1'>
                                                <Input
                                                    bsSize='sm'
                                                    type='number'
                                                    placeholder='Элссэн он'
                                                    value={start[0] || ''}
                                                    min={1990}
                                                    max={2100}
                                                    onChange={(e) =>
                                                        onChange(`${e.target.value}-${start[1] || ''} - ${parts[1] || ''}`)
                                                    }
                                                />

                                                <Input
                                                    bsSize='sm'
                                                    type='number'
                                                    placeholder='Сар'
                                                    value={start[1] || ''}
                                                    min={1}
                                                    max={12}
                                                    onChange={(e) =>
                                                        onChange(`${start[0] || ''}-${e.target.value} - ${parts[1] || ''}`)
                                                    }
                                                />
                                            </div>

                                            {/* Төгссөн */}
                                            <div className='d-flex align-items-center gap-1'>
                                                <Input
                                                    bsSize='sm'
                                                    type='number'
                                                    placeholder='Төгссөн он'
                                                    value={end[0] || ''}
                                                    min={1990}
                                                    max={2100}
                                                    onChange={(e) =>
                                                        onChange(`${parts[0] || ''} - ${e.target.value}-${end[1] || ''}`)
                                                    }
                                                />

                                                <Input
                                                    bsSize='sm'
                                                    type='number'
                                                    placeholder='Сар'
                                                    value={end[1] || ''}
                                                    min={1}
                                                    max={12}
                                                    onChange={(e) =>
                                                        onChange(`${parts[0] || ''} - ${end[0] || ''}-${e.target.value}`)
                                                    }
                                                />
                                            </div>

                                        </div>
                                    )
                                }}
                            />

                            {errors.elssen_togsson_year && (
                                <FormFeedback className='d-block'>
                                    {errors.elssen_togsson_year.message}
                                </FormFeedback>
                            )}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label' for='degree_level'>{t('Эзэмшсэн зэрэг, цол, түвшин')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='degree_level'
                                render={({ field }) => (
                                    <Input
                                        id='degree_level'
                                        bsSize='sm'
                                        {...field}
                                        placeholder={t('Эзэмшсэн зэрэг, цол, түвшин')}
                                        type='text'
                                        readOnly={disabled}
                                        disabled={disabled}
                                        invalid={errors.degree_level && true}
                                    />
                                )}
                            />
                            {errors.degree_level && <FormFeedback className='d-block'>{errors.degree_level.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label' for='diploma_number'>{t('Гэрчилгээ, дипломын дугаар')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='diploma_number'
                                render={({ field }) => (
                                    <Input
                                        id='diploma_number'
                                        bsSize='sm'
                                        {...field}
                                        placeholder={t('Гэрчилгээ, дипломын дугаар')}
                                        type='text'
                                        readOnly={disabled}
                                        disabled={disabled}
                                        invalid={errors.diploma_number && true}
                                    />
                                )}
                            />
                            {errors.diploma_number && <FormFeedback className='d-block'>{errors.diploma_number.message}</FormFeedback>}
                        </Col>

                        <Col className='text-center' md={12}>
                            <Button disabled={disabled} size='sm' className='me-2' color='primary' type='submit'>
                                {isLoading && Loader}
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

export default SelfDevelopment