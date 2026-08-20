
import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import {
    Row, Col, Form, Input, Label, FormFeedback,
    CardHeader, Card, Button, CardTitle,
    Modal, ModalBody, ModalHeader,
} from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import AuthContext from '@context/AuthContext'
import { validate, convertDefaultValue } from '@utils'
import Tables from './Tables'
import { validateSchema } from './validationSchema'
import { useTranslation } from 'react-i18next'
import SchoolContext from '@context/SchoolContext'

import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'

const mnLocale = {
    firstDayOfWeek: 1,
    weekdays: {
        shorthand: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'],
        longhand:  ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'],
    },
    months: {
        shorthand: ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'],
        longhand:  ['Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар', 'Тавдугаар сар', 'Зургаадугаар сар', 'Долоодугаар сар', 'Наймдугаар сар', 'Есдүгээр сар', 'Аравдугаар сар', 'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'],
    },
}


const Discipline = () => {

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

    const disciplineApi = useApi().student.discipline

    async function handleDelete(id) {
        const { success } = await fetchData(disciplineApi.delete(studentId, id))
        if (success) getDatas()
    }

    const onModalClosed = () => {
        reset()
        setShow(false)
    }

    const getDatas = async () => {
        const { success, data } = await fetchData(disciplineApi.get(studentId))
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
            const { success, error } = await fetchData(disciplineApi.put(cdata, id, studentId))
            if (success) {
                getDatas()
                onModalClosed()
            } else {
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg })
                }
            }
        } else {
            const { success, error } = await fetchData(disciplineApi.post(cdata))
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
                <CardTitle tag='h4'>{t('Сахилга, ёс зүйн байдал')}</CardTitle>
                <Button disabled={disabled} color='primary' size='sm' onClick={() => { setShow(true); setEdit(false) }}>
                    {t('Нэмэх')}
                </Button>
            </CardHeader>
            <hr />
            <Tables datas={datas} handleDelete={handleDelete} handleEdit={handleEdit} is_role={disabled} />
            <Modal isOpen={show} toggle={() => setShow(!show)} className='modal-dialog-centered' onClosed={onModalClosed}>
                <ModalHeader className='bg-transparent pb-0' toggle={() => setShow(!show)}></ModalHeader>
                <h5 className='text-center'>{t('Сахилга, ёс зүйн байдал')}</h5>
                <ModalBody className='px-sm-3 pb-2'>
                    <Row tag={Form} className='gy-1 pb-2' onSubmit={handleSubmit(onSubmit)}>

                        <Col lg={12}>
                            <Label className='form-label'>{t('Он, сар, өдөр')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='date'
                                render={({ field: { value, onChange } }) => (
                                    <Flatpickr
                                        className={`form-control form-control-sm ${errors.date ? 'is-invalid' : ''}`}
                                        value={value}
                                        disabled={disabled}
                                        placeholder={t('Он, сар, өдөр')}
                                        options={{
                                            dateFormat: 'Y-m-d',
                                            locale: mnLocale,
                                        }}
                                        onChange={(dates, dateStr) => onChange(dateStr)}
                                    />
                                )}
                            />
                            {errors.date && <FormFeedback className='d-block'>{errors.date.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label'>{t('Сахилгын арга хэмжээ, шийтгэлийн төрөл')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='type'
                                render={({ field }) => (
                                    <Input
                                        bsSize='sm' {...field}
                                        placeholder={t('Сахилгын арга хэмжээ, шийтгэлийн төрөл')} type='textarea'
                                        readOnly={disabled} disabled={disabled}
                                        invalid={errors.type && true}
                                    />
                                )}
                            />
                            {errors.type && <FormFeedback className='d-block'>{errors.type.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label'>{t('Шалтгаан')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='reason'
                                render={({ field }) => (
                                    <Input
                                        bsSize='sm' {...field}
                                        placeholder={t('Шалтгаан')} type='textarea'
                                        readOnly={disabled} disabled={disabled}
                                        invalid={errors.reason && true}
                                    />
                                )}
                            />
                            {errors.reason && <FormFeedback className='d-block'>{errors.reason.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label'>{t('Шийдвэрийн дугаар')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='decision_no'
                                render={({ field }) => (
                                    <Input
                                        bsSize='sm' {...field}
                                        placeholder={t('Шийдвэрийн дугаар')} type='text'
                                        readOnly={disabled} disabled={disabled}
                                        invalid={errors.decision_no && true}
                                    />
                                )}
                            />
                            {errors.decision_no && <FormFeedback className='d-block'>{errors.decision_no.message}</FormFeedback>}
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

export default Discipline