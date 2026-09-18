import { t } from 'i18next'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'react-feather'
import Flatpickr from 'react-flatpickr'
import { Controller, useForm } from 'react-hook-form'
// editor imports
import ReactQuill from 'react-quill'
import { Button, Col, Form, FormFeedback, Input, Label, Row } from 'reactstrap'
import * as Yup from 'yup'

// import ScrollSelectFilter from '@src/components/ScrollSelectFilter'
// import SimpleSelectFilter from '@src/components/SimpleSelectFilter'
import useApi from '@src/utility/hooks/useApi'
import { formatDate, validate } from '@utils'

import 'quill/dist/quill.snow.css'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
import '../style.css'

const validateSchema = Yup.object().shape({
    title: Yup.string().trim().required('Хоосон байна.'),
    description: Yup.string().trim().required('Хоосон байна.')
})

const SOUL_TYPE_TEACHERS_LESSONS = 2

const submitFieldsFromParent = ['title', 'start_date', 'end_date']

const submitFieldsFromGeneral = ['description', 'is_required', 'is_hide_employees']

const submitFields = ['soul_type', 'is_soul_all', 'soul_department', 'soul_lesson', 'soul_teacher']

const MainInfo = ({ stepper, setSubmitDatas, data, editData, editDataGeneral, editDataByType }) => {
    const {
        control,
        handleSubmit,
        setError,
        clearErrors,
        setValue,
        formState: { errors },
        watch
    } = useForm(validate(validateSchema))

    const formFieldStates = watch()

    const formFieldStatesIds = {
        soul_lesson: formFieldStates.soul_lesson?.map(item => item.id)
    }

    const departmentApi = useApi().hrms.department
    const soulSurveyApi = useApi().survey.soulTL

    const [endPicker, setEndPicker] = useState(new Date(editData?.end_date))
    const [startPicker, setStartPicker] = useState(new Date(editData?.start_date))

    function handlePreButton() {
        stepper.previous()
    }

    const onSubmit = (cdatas) => {
        let isCancel = false

        if (isNaN(startPicker)) {
            setError('start_date', { type: 'custom ', message: 'Хоосон байна' })
            isCancel = true
        }

        if (isNaN(endPicker)) {
            setError('end_date', { type: 'custom ', message: 'Хоосон байна' })
            isCancel = true
        }

        if (isCancel) return

        cdatas['start_date'] = formatDate(startPicker, 'YYYY-MM-DD HH:mm:ss')
        cdatas['end_date'] = formatDate(endPicker, 'YYYY-MM-DD HH:mm:ss')
        cdatas['is_soul_all'] = true
        cdatas['soul_type'] = SOUL_TYPE_TEACHERS_LESSONS
        setSubmitDatas({ ...data, ...cdatas })
        stepper.next()
    }

    const handleEndDate = (date) => {
        var end_date = new Date(date)

        if (!startPicker) {
            setError('start_date', { type: 'custom ', message: 'Хоосон байна' })
        } else {
            if (end_date < startPicker) {
                setError('end_date', { type: 'custom ', message: 'Эхлэх хугацаанаас өмнө байх боломжгүй' })
            } else {
                setEndPicker(end_date)
                clearErrors('start_date')
                clearErrors('end_date')
            }
        }
    }

    useEffect(() => {
        for (const key of submitFieldsFromParent) {
            if (editData && Object.prototype.hasOwnProperty.call(editData, key)) {
                const value = editData[key]

                if (![null, undefined].includes(value)) {
                    if (key === 'start_date') setStartPicker(new Date(value))
                    if (key === 'end_date') setEndPicker(new Date(value))
                    setValue(key, value)
                }
            }
        }

        for (const key of submitFieldsFromGeneral) {
            if (editDataGeneral && Object.prototype.hasOwnProperty.call(editDataGeneral, key)) {
                const value = editDataGeneral[key]

                if (![null, undefined].includes(value)) {
                    setValue(key, value)
                }
            }
        }

        for (const key of submitFields) {
            if (editDataByType && Object.prototype.hasOwnProperty.call(editDataByType, key)) {
                const value = editDataByType[key]

                if (![null, undefined].includes(value)) {
                    if (key === 'soul_type') setValue(key, value === SOUL_TYPE_TEACHERS_LESSONS)
                    else setValue(key, value)
                }
            }
        }

        setValue('is_required', true)
    }, [editData, editDataGeneral, editDataByType])

    // #region editor code
    const quillRef = useRef(null)

    const modules = {
        toolbar: [
            [{ font: [] }, { size: ['small', 'medium', 'large', 'huge'] }],
            [{ header: '1' }, { header: '2' }, { font: [] }],
            [{ align: [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            ['link'],
            [{ color: [] }, { background: [] }],
            ['blockquote'],
            //   ['image'],
            ['clean']
        ]
    }

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'align',
        'list',
        'indent',
        'size',
        'link',
        // 'image',
        'color',
        'background',
        'clean'
    ]
    // #endregion

    return (
        <Fragment>
            <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col md={6}>
                        <Label className='form-label' for='title'>
                            {t('Судалгааны нэр')}
                        </Label>
                        <Controller
                            defaultValue={''}
                            control={control}
                            id='title'
                            name='title'
                            render={({ field }) => (
                                <Input
                                    type='text'
                                    name='title'
                                    id='title'
                                    bsSize='sm'
                                    {...field}
                                    placeholder={t('Нэр')}
                                    invalid={errors.title && true}
                                />
                            )}
                        />
                        {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                    </Col>
                    <Col md={6}>
                        <Label className='form-label' for='description'>
                            {t('Тайлбар')}
                        </Label>
                        <Controller
                            defaultValue={''}
                            control={control}
                            id='description'
                            name='description'
                            render={({ field }) => (
                                <ReactQuill
                                    {...field}
                                    id={field.name}
                                    ref={quillRef}
                                    placeholder={t('Тайлбар')}
                                    modules={modules}
                                    formats={formats}
                                    theme='snow'
                                    className='custom-quill'
                                />
                            )}
                        />
                        {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                    </Col>
                    <Col md={6}>
                        <Label className='form-label' for='start_date'>
                            {t('Эхлэх хугацаа')}
                        </Label>
                        <Flatpickr
                            required
                            id='start_date'
                            name='start_date'
                            className={'form-control'}
                            onChange={(date) => {
                                setStartPicker(date[0]), clearErrors('start_date')
                            }}
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
                    <Col md={6}>
                        <Label className='form-label' for='end_date'>
                            {t('Дуусах хугацаа')}
                        </Label>
                        <Flatpickr
                            required
                            id='end_date'
                            name='end_date'
                            className='form-control'
                            onChange={(date) => handleEndDate(date[0])}
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
                    <Col md={6} sm={12} className='mt-1'>
                        <div>
                            <Controller
                                control={control}
                                id='is_required'
                                name='is_required'
                                defaultValue={true}
                                render={({ field }) => (
                                    <Input id='is_required' checked={field.value} type='checkbox' className='me-50' {...field} disabled={true} />
                                )}
                            />
                            <Label className='form-label' for='is_required'>
                                {t('Заавал бөглөх эсэх')}
                            </Label>
                        </div>
                        <div>
                            <Controller
                                control={control}
                                id='is_hide_employees'
                                name='is_hide_employees'
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input id='is_hide_employees' type='checkbox' checked={field.value} className='me-50' {...field} />
                                )}
                            />
                            <Label className='form-label' htmlFor='is_hide_employees'>
                                {t('Нэр нуух эсэх')}
                            </Label>
                        </div>
                    </Col>
                    {/* <Col md={6} sm={12} className='mt-1 rounded border p-1'>
                        <Row>
                            <Col sm={12}>
                                <Controller
                                    control={control}
                                    name='soul_type'
                                    defaultValue={false}
                                    render={({ field }) => (
                                        <>
                                            <Input {...field} id={field.name} checked={field.value} type='checkbox' className='me-50' />
                                            <Label className='form-label' for={field.name}>
                                                {t('Багш, хичээлүүдээр бөглөх эсэх')}
                                            </Label>
                                        </>
                                    )}
                                />
                            </Col>
                            {formFieldStates.soul_type && (
                                <>
                                    <Col sm={12}>
                                        <Controller
                                            control={control}
                                            name='is_soul_all'
                                            defaultValue={false}
                                            render={({ field }) => (
                                                <>
                                                    <Input {...field} id={field.name} checked={field.value} type='checkbox' className='me-50' />
                                                    <Label className='form-label' for={field.name}>
                                                        {t('Бүгд')}
                                                    </Label>
                                                </>
                                            )}
                                        />
                                    </Col>
                                    {!formFieldStates.is_soul_all && (
                                        <Col sm={12}>
                                            <Controller
                                                control={control}
                                                name='soul_department'
                                                defaultValue={''}
                                                render={({ field }) => (
                                                    <Row>
                                                        <Col sm={2} className='mt-auto'>
                                                            <Label className='form-label' for={field.name}>
                                                                {t('Тэнхим')}
                                                            </Label>
                                                        </Col>
                                                        <Col>
                                                            <SimpleSelectFilter
                                                                {...field}
                                                                getApi={departmentApi.get}
                                                                getOptionLabel={(option) => option.name}
                                                                getOptionValue={(option) => option.id}
                                                            />
                                                        </Col>
                                                    </Row>
                                                )}
                                            />
                                            <Controller
                                                control={control}
                                                name='soul_lesson'
                                                defaultValue={[]}
                                                render={({ field }) => (
                                                    <Row className='mt-50'>
                                                        <Col sm={2} className='mt-auto'>
                                                            <Label className='form-label' for={field.name}>
                                                                {t('Хичээл')}
                                                            </Label>
                                                        </Col>
                                                        <Col>
                                                            <ScrollSelectFilter
                                                                {...field}
                                                                getApi={(page, search, limit) =>
                                                                    soulSurveyApi.getTimeTableLesson({
                                                                        limit: limit,
                                                                        page: page,
                                                                        sort: '',
                                                                        search: search,
                                                                        department: formFieldStates.soul_department?.id
                                                                    })
                                                                }
                                                                getOptionLabel={(option) => option.name}
                                                                getOptionValue={(option) => option.id}
                                                                isMulti={true}
                                                                deps={[formFieldStates.soul_department]}
                                                            />
                                                        </Col>
                                                    </Row>
                                                )}
                                            />
                                            <Controller
                                                control={control}
                                                name='soul_teacher'
                                                defaultValue={[]}
                                                render={({ field }) => (
                                                    <Row className='mt-50'>
                                                        <Col sm={2} className='mt-auto'>
                                                            <Label className='form-label' for={field.name}>
                                                                {t('Багш')}
                                                            </Label>
                                                        </Col>
                                                        <Col>
                                                            <ScrollSelectFilter
                                                                {...field}
                                                                getApi={(page, search, limit) =>
                                                                    soulSurveyApi.getTimeTableTeacher({
                                                                        limit: limit,
                                                                        page: page,
                                                                        sort: '',
                                                                        search: search,
                                                                        department: formFieldStates.soul_department?.id,
                                                                        lesson: formFieldStatesIds.soul_lesson
                                                                    })
                                                                }
                                                                getOptionLabel={(option) => option.name}
                                                                getOptionValue={(option) => option.id}
                                                                isMulti={true}
                                                                deps={[formFieldStates.soul_department, formFieldStates.soul_lesson]}
                                                            />
                                                        </Col>
                                                    </Row>
                                                )}
                                            />
                                        </Col>
                                    )}
                                </>
                            )}
                        </Row>
                    </Col> */}
                </Row>
                <Col md={12} className='text-center mt-2'>
                    <div className='d-flex justify-content-between mt-3'>
                        <Button color='secondary' className='btn-prev' outline onClick={handlePreButton}>
                            <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                            <span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
                        </Button>
                        <Button color='primary' className='btn-next' type='submit'>
                            <span className='align-middle d-sm-inline-block d-none'>Дараах</span>
                            <ChevronRight size={14} className='align-middle ms-sm-25 ms-0'></ChevronRight>
                        </Button>
                    </div>
                </Col>
            </Row>
        </Fragment>
    )
}
export default MainInfo
