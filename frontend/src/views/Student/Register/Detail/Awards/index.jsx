
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

const Award = () => {

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

    const awardApi = useApi().student.award

    async function handleDelete(id) {
        const { success } = await fetchData(awardApi.delete(studentId, id))
        if (success) getDatas()
    }

    const onModalClosed = () => {
        reset()
        setShow(false)
    }

    const getDatas = async () => {
        const { success, data } = await fetchData(awardApi.get(studentId))
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
            const { success, error } = await fetchData(awardApi.put(cdata, id, studentId))
            if (success) {
                getDatas()
                onModalClosed()
            } else {
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg })
                }
            }
        } else {
            const { success, error } = await fetchData(awardApi.post(cdata))
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
                <CardTitle tag='h4'>{t('Тэмдэг, медаль, шагнал, урамшуулал')}</CardTitle>
                <Button disabled={disabled} color='primary' size='sm' onClick={() => { setShow(true); setEdit(false) }}>
                    {t('Нэмэх')}
                </Button>
            </CardHeader>
            <hr />
            <Tables datas={datas} handleDelete={handleDelete} handleEdit={handleEdit} is_role={disabled} />
            <Modal isOpen={show} toggle={() => setShow(!show)} className='modal-dialog-centered' onClosed={onModalClosed}>
                <ModalHeader className='bg-transparent pb-0' toggle={() => setShow(!show)}></ModalHeader>
                <h5 className='text-center'>{t('Тэмдэг, медаль, шагнал, урамшуулал')}</h5>
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
                                        id='year' bsSize='sm' {...field}
                                        placeholder={t('Он')} type='number'
                                        readOnly={disabled} disabled={disabled}
                                        invalid={errors.year && true}
                                    />
                                )}
                            />
                            {errors.year && <FormFeedback className='d-block'>{errors.year.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label' for='name'>{t('Шагнал, урамшууллын нэр')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='name'
                                render={({ field }) => (
                                    <Input
                                        id='name' bsSize='sm' {...field}
                                        placeholder={t('Шагнал, урамшууллын нэр')} type='text'
                                        readOnly={disabled} disabled={disabled}
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label' for='organizer'>{t('Олгосон байгууллага')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='organizer'
                                render={({ field }) => (
                                    <Input
                                        id='organizer' bsSize='sm' {...field}
                                        placeholder={t('Олгосон байгууллага')} type='text'
                                        readOnly={disabled} disabled={disabled}
                                        invalid={errors.organizer && true}
                                    />
                                )}
                            />
                            {errors.organizer && <FormFeedback className='d-block'>{errors.organizer.message}</FormFeedback>}
                        </Col>

                        <Col lg={12}>
                            <Label className='form-label' for='description'>{t('Үндэслэл, тайлбар')}</Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='description'
                                render={({ field }) => (
                                    <Input
                                        id='description' bsSize='sm' {...field}
                                        placeholder={t('Үндэслэл, тайлбар')} type='textarea'
                                        readOnly={disabled} disabled={disabled}
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{errors.description.message}</FormFeedback>}
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

export default Award