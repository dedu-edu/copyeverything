import React, { Fragment, useState, useEffect, useContext } from "react";

import { Controller, useForm } from 'react-hook-form'

import { Row, ModalBody, ModalHeader, Col, FormFeedback, Input, Form, Modal, Label, Button} from 'reactstrap'

import { useQuill } from 'react-quilljs';

import Select from 'react-select'

import 'quill/dist/quill.snow.css'

import '../style.css'

import useLoader from '@hooks/useLoader';

import useApi from "@hooks/useApi"

import AuthContext from '@context/AuthContext'

import SchoolContext from "@context/SchoolContext"

import { validate, convertDefaultValue, ReactSelectStyles, get_news_people_type, student_course_level  } from "@utils"

import classnames from "classnames";

import { validateSchema } from "../validateSchema";

import { t } from 'i18next';

const EditModal = ({ open, handleEdit, refreshDatas, edit_id }) => {

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    // State
    // const [is_disabled, setDisabled] = useState(true)
    const [value, defaultValue] = useState('');
    const [student_levelOptions, setStudent_levelOptions] = useState(student_course_level())
    const [scopeOptions, setScopeOptions] = useState(get_news_people_type())
    const [departmentOptions, setDepartmentOption] = useState([])

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setValue, setError, watch } = useForm(validate(validateSchema))

    const { quill, quillRef } = useQuill({
        modules: {
            toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ align: [] }],

                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ indent: '-1'}, { indent: '+1' }],

                    [{ size: ['small', false, 'large', 'huge'] }],
                    ['link', 'image',],

                    [{ color: [] }, { background: [] }],

                    ['clean'],
            ],
        },
        value: value,
        theme: 'snow',
        formats: [
            'header','bold', 'italic', 'underline', 'strike',
            'align', 'list', 'indent',
            'size',
            'link', 'image',
            'color', 'background',
            'clean',
        ],
        readOnly: false,
    });

    // API
    const newsApi = useApi().service.news
    const departmentApi = useApi().hrms.department

    // Тэнхимийн жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
        if(success) {
            setDepartmentOption(data)
        }
    }

    // useEffect(() => {
    //     if(Object.keys(user).length > 0 && user.permissions.includes('lms-service-news-update')) {
    //         setDisabled(false)
    //     }
    // },[user])

    async function getDatas() {
        if (edit_id) {
            const { success, data } = await fetchData(newsApi.getOne(edit_id))
            if (success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if (data === null) return
                for (let key in data) {
                    if (data[key] !== null) {
                        setValue(key, data[key])
                    }
                    else setValue(key, '')

                    if (key === 'body' && quill) {
                        quill.pasteHTML(data[key]);
                    }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    }, [edit_id, quill])

    useEffect(() => {
        getDepartmentOption()
    }, [])

    async function onSubmit(cdata) {
        cdata['body'] = quill ? quill.root.innerHTML : ''
        cdata = convertDefaultValue(cdata)

        let is_valid = false

        if(cdata?.is_open) {
            if(!cdata?.start_date) {
                is_valid = true
                setError("start_date", { type: 'custom', message: "Эхлэх хугацаа оруулна уу"});
            }
            if(!cdata?.end_date) {
                is_valid = true
                setError("end_date", { type: 'custom', message: "Дуусах хугацаа оруулна уу"});
            }
            cdata["scope"] = cdata?.scope ? cdata?.scope : 4
        } else {
            cdata["start_date"] = null
            cdata["end_date"] = null
        }

        if(edit_id && !is_valid) {
            const formData = new FormData()

            for (let key in cdata) {
                formData.append(key, cdata[key])
            }
            delete cdata?.image
            const { success, errors } = await fetchData(newsApi.put(cdata, edit_id))
            if(success) {
                reset()
                refreshDatas()
                handleEdit()
            }
            else {
                /** Алдааны мессеж */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key]?.[0]});
                }
            }
        }
    }

    return (
        <Fragment>
            <Modal isOpen={open} toggle={handleEdit} className="modal-dialog-centered modal-lg" onClosed={handleEdit}>
            { isLoading && Loader}
                <ModalHeader className="bg-transparent pb-0" toggle={handleEdit}></ModalHeader>
                <ModalBody className="px-sm-12 pt-50 pb-3">
                    <div className="text-center">
                        <h5>{t('Мэдээ засах')}</h5>
                    </div>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className='form-label' for="title">
                                {t('Гарчиг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='title'
                                name='title'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='title'
                                        id='title'
                                        placeholder={t('Гарчиг')}
                                        bsSize='sm'
                                        invalid={errors.title && true}
                                    />
                                )}
                                />
                            {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                defaultValue={false}
                                control={control}
                                id='is_show'
                                name='is_show'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        name='is_show'
                                        id='is_show'
                                        type='checkbox'
                                        className='me-50'
                                        checked={field.value}
                                        invalid={errors.is_show && true}
                                    >
                                    </Input>
                                )}
                            />
                            <Label className='form-label' for='is_show'>
                                Шууд харуулах эсэх /Оюутан болон багшийн системд/
                            </Label>
                            {errors.is_show && <FormFeedback className='d-block'>{errors.is_show.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='is_open'
                                name='is_open'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        name='is_open'
                                        id='is_open'
                                        type='checkbox'
                                        className='me-50'
                                        checked={field.value}
                                        invalid={errors.is_open && true}
                                        onChange={(e) => {
                                            field.onChange(e.target.checked)
                                            setValue("scope", 4)
                                        }}
                                    >
                                    </Input>
                                )}
                            />
                            <Label className='form-label' for='is_open'>
                                Нээлттэй харуулах эсэх
                            </Label>
                            {errors.is_open && <FormFeedback className='d-block'>{errors.is_open.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='body'>
                                {t('Мэдээний хэсэг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='body'
                                name='body'
                                render={({field}) => (
                                    <div style={{ width: 'auto',}}>
                                        <div
                                            {...field}
                                            name='body'
                                            id='body'
                                            ref={quillRef}
                                        />
                                    </div>
                                )}
                            />
                            {errors.body && <FormFeedback className='d-block'>{t(errors.body.message)}</FormFeedback>}
                        </Col>
                        {
                            !watch("is_open")
                            ?
                                <>
                                    <Col md={12}>
                                        <Label className='form-label' for="scope">
                                            {t('Хамрах хүрээ')}
                                        </Label>
                                        <Controller
                                            defaultValue={4}
                                            control={control}
                                            name='scope'
                                            render={({field: { value, onChange }}) => {
                                                return (
                                                    <Select
                                                        name='scope'
                                                        id='scope'
                                                        classNamePrefix='select'
                                                        isClearable
                                                        className={classnames('react-select', { 'is-invalid': errors.scope })}
                                                        isLoading={isLoading}
                                                        placeholder={t('--Сонгоно уу--')}
                                                        options={scopeOptions || []}
                                                        value={value ? scopeOptions.find((c) => c.id === value) : ''}
                                                        noOptionsMessage={() => t('Хоосон байна')}
                                                        onChange={(val) => {
                                                            onChange(val?.id || '')
                                                        }}
                                                        styles={ReactSelectStyles}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => option.name}
                                                    />
                                                )
                                            }}
                                        ></Controller>
                                        {errors.scope && <FormFeedback className='d-block'>{t(errors.scope.message)}</FormFeedback>}
                                    </Col>
                                    <Col md={12}>
                                        <Label className='form-label' for="department">
                                            {t('Тэнхим')}
                                        </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                name='department'
                                                render={({field: { value, onChange }}) => {
                                                    return (
                                                        <Select
                                                            name='department'
                                                            id='department'
                                                            classNamePrefix='select'
                                                            isClearable
                                                            className={classnames('react-select', { 'is-invalid': errors.department })}
                                                            isLoading={isLoading}
                                                            placeholder={t('--Сонгоно уу--')}
                                                            options={departmentOptions || []}
                                                            value={departmentOptions.find((c) => c.id === value)}
                                                            noOptionsMessage={() => t('Хоосон байна')}
                                                            onChange={(val) => {
                                                                onChange(val?.id || '')
                                                            }}
                                                            styles={ReactSelectStyles}
                                                            getOptionValue={(option) => option.id}
                                                            getOptionLabel={(option) => option.name}
                                                        />
                                                    )
                                                }}
                                            ></Controller>
                                        {errors.department && <FormFeedback className='d-block'>{t(errors.department.message)}</FormFeedback>}
                                    </Col>
                                </>
                            :

                                <>
                                    <Col xl={12}>
                                        <Label className='form-label' for='start_date'>
                                            {t('Эхлэх хугацаа')}
                                        </Label>
                                        <Controller
                                            defaultValue={''}
                                            control={control}
                                            name='start_date'
                                            render={({ field }) => (
                                                <Input
                                                    bsSize="sm"
                                                    placeholder={t('Сонгох')}
                                                    {...field}
                                                    type="datetime-local"
                                                    invalid={errors.start_date}
                                                />
                                            )}
                                        />
                                        {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                                    </Col>
                                    <Col>
                                        <Label className='form-label' for='end_date'>
                                            Дуусах хугацаа
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            className={classnames({ 'is-invalid': errors.end_date })}
                                            name='end_date'
                                            render={({ field }) => (
                                                <Input
                                                    bsSize="sm"
                                                    placeholder={t('Сонгох')}
                                                    {...field}
                                                    type="datetime-local"
                                                    invalid={errors.end_date}
                                                />
                                            )}
                                            />
                                        {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                                    </Col>
                                </>
                        }
                        {
                            watch("scope") === 1 && !watch("is_open") &&
                            <Col md={12}>
                                <Label className='form-label' for="student_level">
                                    {t('Курс')}
                                </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        name='student_level'
                                        render={({field: { value, onChange }}) => {
                                            return (
                                                <Select
                                                    name='student_level'
                                                    id='student_level'
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.student_level })}
                                                    isLoading={isLoading}
                                                    placeholder={t('--Сонгоно уу--')}
                                                    options={student_levelOptions || []}
                                                    value={student_levelOptions.find((c) => c.id === value)}
                                                    noOptionsMessage={() => t('Хоосон байна')}
                                                    onChange={(val) => {
                                                        onChange(val?.id || '')
                                                    }}
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => option.name}
                                                />
                                            )
                                        }}
                                    ></Controller>
                                {errors.student_level && <FormFeedback className='d-block'>{t(errors.student_level.message)}</FormFeedback>}
                            </Col>
                        }
                       <Col md={12} className="text-center mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleEdit}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}


export default EditModal
