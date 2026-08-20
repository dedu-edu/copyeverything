import { t } from 'i18next'
import { Fragment, useEffect, useState } from 'react'
import Flatpickr from 'react-flatpickr'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'
import { Button, Col, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { convertDefaultValue, ReactSelectStyles, validate } from '@utils'

import { oralExam } from '../../constants'
import { validateSchema } from './validationSchema'

import '@styles/react/libs/flatpickr/flatpickr.scss'

const HUNGUN = 1
const DUND = 2
const HUND = 3

const Addmodal = ({ open, handleModal, refreshDatas, select_datas, editData }) => {
    const {
        control,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { errors }
    } = useForm(validate(validateSchema))

    const selected = watch()
    const { fetchData } = useLoader({ isFullScreen: true })

    const [endPicker, setEndPicker] = useState(new Date(editData?.end_date))
    const [startPicker, setStartPicker] = useState(new Date(editData?.start_date))

    const [select_data, setSelectDatas] = useState([])

    const challengeAPI = useApi().challenge

    async function getSelectDatas() {
        const { success, data } = await fetchData(challengeAPI.oralExam.title.get('Бүгд', 1, '', '', 0, selected.lesson || ''))
        if (success) {
            setSelectDatas(data.results)
        }
    }

    async function getQuestionCardStat() {
        if (!editData?.id) return
        const { success, data } = await fetchData(challengeAPI.questionCard.get(editData.id))

        if (success) {
            setValue('question_title', data.question_title?.[0])
            setValue('card_count', data.card_count)
            setValue('question_per_card_count', data.question_per_card_count)
            setValue('levels_count', data.levels_count)
        }
    }

    useEffect(() => {
        getSelectDatas()
    }, [selected.lesson])

    useEffect(() => {
        if (editData && Object.keys(editData).length > 0) {
            for (let key in editData) {
                if (editData[key] !== null && editData[key] !== undefined) {
                    setValue(key, editData[key])
                } else {
                    setValue(key, '')
                }
                if (key === 'lesson') {
                    setValue(key, editData[key]?.id || '')
                }
            }
        }

        setValue('isRegenerateCards', !editData?.id)
        getQuestionCardStat()
    }, [editData])

    async function onSubmit(cdata) {
        cdata['start_date'] = new Date(startPicker)
        cdata['end_date'] = new Date(endPicker)
        cdata['start_date'].setHours(cdata['start_date'].getHours() + 8)
        cdata['end_date'].setHours(cdata['end_date'].getHours() + 8)

        if (cdata.question_title) cdata.question_title = cdata.question_title?.id || ''
        if (!editData?.id) cdata['challenge_type'] = oralExam.id

        cdata = convertDefaultValue(cdata)

        let response = null
        if (editData?.id) response = await fetchData(challengeAPI.putSelectedTest(cdata, editData?.id))
        else response = await fetchData(challengeAPI.postTest(cdata))
        const { success, errors, error } = response

        if (success) {
            handleModal()
            refreshDatas()
        } else {
            if (editData?.id) {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg })
                }
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key]?.[0] })
                }
            }
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='modal-dialog-centered modal-lg'
                contentClassName='pt-0'
                fade={true}
                backdrop='static'
            >
                <ModalHeader toggle={handleModal}></ModalHeader>
                {editData !== undefined ? (
                    <ModalHeader className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }}>
                        <h4>{t('Шалгалт засах')}</h4>
                    </ModalHeader>
                ) : (
                    <ModalHeader className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }}>
                        <h4>{t('Шалгалт нэмэх')}</h4>
                    </ModalHeader>
                )}
                <ModalBody className='flex-grow-50 mb-3 t-0'>
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className='form-label' for='title'>
                                {t('Гарчиг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='title'
                                name='title'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id='title'
                                        bsSize='sm'
                                        placeholder={editData?.title}
                                        type='text'
                                        invalid={errors.title && true}
                                    />
                                )}
                            />
                            {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className='mt-50'>
                            <Label className='form-label' for='description'>
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue={''}
                                control={control}
                                id='description'
                                name='description'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id='description'
                                        bsSize='sm'
                                        placeholder={editData?.description}
                                        type='textarea'
                                        invalid={errors.description && true}
                                        rows={'5'}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className='form-label' for='lesson'>
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name='lesson'
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            id='lesson'
                                            name='lesson'
                                            isClearable
                                            classNamePrefix='select'
                                            className='react-select'
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            value={select_datas.find((c) => c.id === value)}
                                            options={select_datas || []}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.code + ' ' + option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className='form-label' for='question_title'>
                                {t('Асуултын сан, сэдэв сонгох')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name='question_title'
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        id='question_title'
                                        name='question_title'
                                        isClearable
                                        classNamePrefix='select'
                                        className='react-select'
                                        placeholder={`-- Сонгоно уу --`}
                                        options={select_data || []}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name + ' (' + (option.question_count || 0) + ') (' + option.created_by_last_name?.charAt(0)?.toUpperCase() + '. ' + option.created_by_first_name + ')'}
                                        isDisabled={!selected.isRegenerateCards}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className='form-label' for='start_date'>
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Flatpickr
                                required
                                id='start_date'
                                name='start_date'
                                className='form-control'
                                onChange={setStartPicker}
                                value={startPicker}
                                style={{ height: '30px' }}
                                options={{
                                    enableTime: true,
                                    dateFormat: 'Y-m-d H:i',
                                    time_24hr: true
                                }}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className='form-label' for='end_date'>
                                {t('Дуусах хугацаа')}
                            </Label>
                            <Flatpickr
                                required
                                id='end_date'
                                name='end_date'
                                className='form-control'
                                onChange={setEndPicker}
                                value={endPicker}
                                style={{ height: '30px' }}
                                options={{
                                    enableTime: true,
                                    dateFormat: 'Y-m-d H:i',
                                    time_24hr: true
                                }}
                            />
                            {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className='form-label' for='duration'>
                                {t('Үргэлжлэх хугацаа (минутаар)')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='duration'
                                name='duration'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id='duration'
                                        bsSize='sm'
                                        placeholder={editData?.duration}
                                        type='number'
                                        invalid={errors.duration && true}
                                    />
                                )}
                            />
                            {errors.duration && <FormFeedback className='d-block'>{t(errors.duration.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className='form-label' for='card_count'>
                                {t('Нийт билетийн тоо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='card_count'
                                render={({ field }) => (
                                    <Input {...field} bsSize='sm' type='number' placeholder={editData?.card_count} invalid={errors.card_count && true} disabled={!selected.isRegenerateCards} />
                                )}
                            />
                            {errors.card_count && <FormFeedback className='d-block'>{t(errors.card_count.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className='form-label' for='card_per_student_count'>
                                {t('Оюутан бүрийн билетийн тоо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='card_per_student_count'
                                name='card_per_student_count'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id='card_per_student_count'
                                        bsSize='sm'
                                        placeholder={editData?.card_per_student_count}
                                        type='number'
                                        invalid={errors.card_per_student_count && true}
                                        disabled={!selected.isRegenerateCards}
                                    />
                                )}
                            />
                            {errors.card_per_student_count && <FormFeedback className='d-block'>{t(errors.card_per_student_count.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className='form-label' for='question_per_card_count'>
                                {t('Нэг билет дэх асуултын тоо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='question_per_card_count'
                                render={({ field }) => (
                                    <Input {...field} bsSize='sm' type='number' placeholder={editData?.question_per_card_count}
                                        invalid={errors.question_per_card_count && true} disabled={!selected.isRegenerateCards} />
                                )}
                            />
                            {errors.question_per_card_count && <FormFeedback className='d-block'>{t(errors.question_per_card_count.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Controller
                                control={control}
                                name='has_shuffle'
                                defaultValue={false}
                                render={({ field }) => <Input {...field} id={field.name} type='checkbox' checked={field.value} className='me-50' disabled={!selected.isRegenerateCards} />}
                            />
                            <Label className='form-label' for='has_shuffle'>
                                {t('Шалгалтын асуултыг оюутан бүрээр холих эсэх')}
                            </Label>
                            {errors.has_shuffle && <FormFeedback className='d-block'>{t(errors.has_shuffle.message)}</FormFeedback>}
                            {!!editData?.id &&
                                <div>
                                    <Controller
                                        control={control}
                                        name='isRegenerateCards'
                                        defaultValue={false}
                                        render={({ field }) => {
                                            return (
                                                <>
                                                    <Input {...field} id={field.name} type='checkbox' checked={field.value} className='me-50' />
                                                    <Label className='form-label' for={field.name}>
                                                        {t('Билетүүдийг дахин үүсгэх эсэх')}
                                                    </Label>
                                                </>
                                            )
                                        }}
                                    />
                                </div>
                            }
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='levels_count'
                                render={({ field }) => (
                                    <>
                                        <Label className='form-label' for={field.name}>
                                            {t('Асуултын түвшин бүрээр тоо (Нэг билет дэх)')}
                                        </Label>
                                        <Row>
                                            <Col>
                                                <Label className='form-label'>
                                                    {t('Хөнгөн')}
                                                </Label>
                                                <Input value={field.value?.[HUNGUN] || ''} onChange={(e) => field.onChange({ ...(field.value || {}), [HUNGUN]: Number(e.target.value) })} bsSize='sm' type='number' placeholder={t('Хөнгөн')}
                                                    disabled={!selected.isRegenerateCards} />
                                            </Col>
                                            <Col>
                                                <Label className='form-label'>
                                                    {t('Дүнд')}
                                                </Label>
                                                <Input value={field.value?.[DUND] || ''} onChange={(e) => field.onChange({ ...(field.value || {}), [DUND]: Number(e.target.value) })} bsSize='sm' type='number' placeholder={t('Дүнд')}
                                                    disabled={!selected.isRegenerateCards} />
                                            </Col>
                                            <Col>
                                                <Label className='form-label'>
                                                    {t('Хүнд')}
                                                </Label>
                                                <Input value={field.value?.[HUND] || ''} onChange={(e) => field.onChange({ ...(field.value || {}), [HUND]: Number(e.target.value) })} bsSize='sm' type='number' placeholder={t('Хүнд')}
                                                    disabled={!selected.isRegenerateCards} />
                                            </Col>
                                        </Row>
                                        {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                    </>
                                )}
                            />
                        </Col>
                        <Col md={12} className='text-center mt-2'>
                            <Button className='me-2' color='primary' type='submit'>
                                {t('Хадгалах')}
                            </Button>
                            <Button color='secondary' outline type='reset' onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
export default Addmodal
