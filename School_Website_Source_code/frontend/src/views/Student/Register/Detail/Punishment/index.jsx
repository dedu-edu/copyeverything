import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import {
    Row, Col, Form, Input, Label, FormFeedback,
    CardHeader, Card, Button, CardTitle,
    Modal, ModalBody, ModalHeader,
} from 'reactstrap'
import { Trash2 } from 'react-feather'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import useModal from '@hooks/useModal'
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import { validate, convertDefaultValue } from '@utils'
import { useTranslation } from 'react-i18next'
import { validateSchema } from './validationSchema'

const Punishment = () => {
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { studentId } = useParams()
    const { t } = useTranslation()
    const { Loader, isLoading, fetchData } = useLoader({ isSmall: true })
    const { showWarning } = useModal()

    const isCopsSchool = school_id === 1

    const {
        control, handleSubmit, reset, setError,
        setValue, watch, formState: { errors }
    } = useForm(validate(validateSchema))

    const [disabled, setDisabled] = useState(true)
    const [is_edit, setEdit] = useState(false)
    const [show, setShow] = useState(false)
    const [datas, setDatas] = useState([])

    const hasPunishment = watch('has_punishment')
    const hasCrime = watch('has_crime')

    const punishmentApi = useApi().student.punishment

    const getDatas = async () => {
        const { success, data } = await fetchData(punishmentApi.get(studentId))
        if(success) {
            setDatas(data || [])
        }
    }

    useEffect(() => {
        if (Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-update')) {
            setDisabled(false)
        }
        getDatas()
    }, [user, show])

    const onModalClosed = () => {
        reset()
        setShow(false)
    }

    async function handleEdit(cdata) {
        setEdit(true)
        setShow(true)
        if (!cdata) return
        for (let key in cdata) {
            setValue(key, cdata[key] ?? '')
        }
    }

    async function handleDelete(id) {
        try {
            await fetchData(punishmentApi.delete(studentId, id))
            getDatas()
        } catch (err) {}
    }

    async function onSubmit(cdata) {
        cdata['student'] = studentId
        cdata = convertDefaultValue(cdata)
        try {
            if (is_edit) {
                const id = cdata['id']
                await fetchData(punishmentApi.put(cdata, id, studentId))
            } else {
                await fetchData(punishmentApi.post(cdata))
            }
            getDatas()
            onModalClosed()
        } catch (err) {}
    }

    return (
        <Card>
            <CardHeader className='d-flex justify-content-between py-0 px-0'>
                <CardTitle tag='h4'>{t('Ял шийтгэл тодорхойлолт')}</CardTitle>
                <Button disabled={disabled} color='primary' size='sm'
                    onClick={() => { setShow(true); setEdit(false) }}>
                    {t('Нэмэх')}
                </Button>
            </CardHeader>
            <hr />

            <div className='table-responsive'>
                <table className='table table-sm'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>{t('Ял шийтгэлтэй эсэх')}</th>
                            <th>{t('Тайлбар')}</th>
                            {isCopsSchool && <th>{t('Гэмт хэрэг зөрчилд холбогдож байсан эсэх')}</th>}
                            {isCopsSchool && <th>{t('Тайлбар')}</th>}
                            {/* {isCopsSchool && <th>{t('Зөрчил')}</th>} */}
                            {!disabled && <th>{t('Үйлдэл')}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {datas && datas?.map((data, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <Input
                                        type='checkbox'
                                        checked={!!data.has_punishment}
                                        disabled
                                        className='form-check-input'
                                    />
                                </td>
                                <td>{data.has_punishment ? (data.punishment_note || '—') : '—'}</td>
                                {isCopsSchool && (
                                    <td>
                                        <Input
                                            type='checkbox'
                                            checked={!!data.has_crime}
                                            disabled
                                            className='form-check-input'
                                        />
                                    </td>
                                )}
                                {isCopsSchool && <td>{data.has_crime ? (data.crime_note || '—') : '—'}</td>}
                                {/* {isCopsSchool && <td>{data.has_crime ? (data.violation || '—') : '—'}</td>} */}
                                {!disabled && (
                                    <td>
                                        <div className='d-flex align-items-center gap-1'>
                                            <Button size='sm' color='flat-primary' onClick={() => handleEdit(data)}>
                                                {t('Засах')}
                                            </Button>
                                            <Trash2
                                                type='button'
                                                color='red'
                                                width='15px'
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => showWarning({
                                                    question: t('Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?'),
                                                    onClick: () => handleDelete(data.id),
                                                    btnText: t('Устгах'),
                                                })}
                                            />
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={show} toggle={() => setShow(!show)} className='modal-dialog-centered' onClosed={onModalClosed}>
                <ModalHeader className='bg-transparent pb-0' toggle={() => setShow(!show)} />
                <h5 className='text-center'>{t('Ял шийтгэл тодорхойлолт')}</h5>
                <ModalBody className='px-sm-3 pb-2'>
                    <Row tag={Form} className='gy-1 pb-2' onSubmit={handleSubmit(onSubmit)}>

                        {/* Ял шийтгэлтэй эсэх */}
                        <Col lg={12}>
                            <Controller
                                control={control}
                                name='has_punishment'
                                defaultValue={false}
                                render={({ field: { value, onChange } }) => (
                                    <div className='d-flex align-items-center gap-1'>
                                        <Label className='form-label mb-0'>{t('Ял шийтгэлтэй эсэх')}</Label>
                                        <div className='d-flex gap-1 ms-1'>
                                            <Button
                                                size='sm'
                                                color={value === true ? 'success' : 'secondary'}
                                                outline={value !== true}
                                                disabled={disabled}
                                                type='button'
                                                onClick={() => onChange(true)}
                                            >
                                                {t('Тийм')}
                                            </Button>
                                            <Button
                                                size='sm'
                                                color={value === false ? 'danger' : 'secondary'}
                                                outline={value !== false}
                                                disabled={disabled}
                                                type='button'
                                                onClick={() => {
                                                    onChange(false)
                                                    setValue('punishment_note', '')
                                                }}
                                            >
                                                {t('Үгүй')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            />
                        </Col>

                        {hasPunishment === true && (
                            <Col lg={12}>
                                <Label className='form-label'>{t('Тайлбар')}</Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    name='punishment_note'
                                    render={({ field }) => (
                                        <Input
                                            bsSize='sm' {...field}
                                            placeholder={t('Тайлбар')}
                                            type='textarea'
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={!!errors.punishment_note}
                                        />
                                    )}
                                />
                                {errors.punishment_note && (
                                    <FormFeedback className='d-block'>{errors.punishment_note.message}</FormFeedback>
                                )}
                            </Col>
                        )}

                        {/* Гэмт хэрэг — зөвхөн цагдаагийн сургуульд */}
                        {isCopsSchool && (
                            <Col lg={12}>
                                <Controller
                                    control={control}
                                    name='has_crime'
                                    defaultValue={false}
                                    render={({ field: { value, onChange } }) => (
                                        <div className='d-flex align-items-center gap-1'>
                                            <Label className='form-label mb-0'>{t('Гэмт хэрэг зөрчилд холбогдож байсан эсэх')}</Label>
                                            <div className='d-flex gap-1 ms-1'>
                                                <Button
                                                    size='sm'
                                                    color={value === true ? 'success' : 'secondary'}
                                                    outline={value !== true}
                                                    disabled={disabled}
                                                    type='button'
                                                    onClick={() => onChange(true)}
                                                >
                                                    {t('Тийм')}
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    color={value === false ? 'danger' : 'secondary'}
                                                    outline={value !== false}
                                                    disabled={disabled}
                                                    type='button'
                                                    onClick={() => {
                                                        onChange(false)
                                                        setValue('crime_note', '')
                                                        // setValue('violation', '')
                                                    }}
                                                >
                                                    {t('Үгүй')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                />
                            </Col>
                        )}

                        {isCopsSchool && hasCrime === true && (
                            <>
                                <Col lg={12}>
                                    <Label className='form-label'>{t('Тайлбар')}</Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        name='crime_note'
                                        render={({ field }) => (
                                            <Input
                                                bsSize='sm' {...field}
                                                placeholder={t('Тайлбар')}
                                                type='textarea'
                                                readOnly={disabled}
                                                disabled={disabled}
                                                invalid={!!errors.crime_note}
                                            />
                                        )}
                                    />
                                    {errors.crime_note && (
                                        <FormFeedback className='d-block'>{errors.crime_note.message}</FormFeedback>
                                    )}
                                </Col>

                                {/* <Col lg={12}>
                                    <Label className='form-label'>{t('Зөрчил')}</Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        name='violation'
                                        render={({ field }) => (
                                            <Input
                                                bsSize='sm' {...field}
                                                placeholder={t('Зөрчил')}
                                                type='text'
                                                readOnly={disabled}
                                                disabled={disabled}
                                                invalid={!!errors.violation}
                                            />
                                        )}
                                    />
                                    {errors.violation && (
                                        <FormFeedback className='d-block'>{errors.violation.message}</FormFeedback>
                                    )}
                                </Col> */}
                            </>
                        )}

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

export default Punishment