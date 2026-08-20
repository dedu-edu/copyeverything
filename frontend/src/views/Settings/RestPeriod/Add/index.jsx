// ** React imports
import React, { Fragment, useState, useContext, useEffect } from 'react'

import { X } from "react-feather";

import { t } from 'i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate, generateLessonYear, convertDefaultValue, ReactSelectStyles } from "@utils"

import { validateSchema } from './validateSchema';

import Select from "react-select"
import classNames from 'classnames';

import ActiveYearContext from '@context/ActiveYearContext';

const Addmodal = ({ open, handleModal, refreshDatas, editId }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { cyear_name, cseason_id } = useContext(ActiveYearContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue, watch } = useForm(validate(validateSchema));

    const [ seasonOption, setSeason] = useState([])
    const [ yearOption, setYear] = useState([])
    const [ weeksList, setWeeksList ] = useState([])
    const [ allSettings, setAllSettings ] = useState([])

    const watchedYear = watch('lesson_year')
    const watchedSeason = watch('lesson_season')

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const seasonApi = useApi().settings.season
    const restPeriodApi = useApi().settings.rest_period
    const activeYearApi = useApi().settings.activeyear
    const settingsApi = useApi().settings

    async function fetchSystemSettings() {
        try {
            const { success, data } = await fetchData(activeYearApi.get())
            if (success && Array.isArray(data)) {
                setAllSettings(data)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        async function fetchWeeks() {
            const yearStr = watchedYear || '';
            const seasonStr = watchedSeason || '';

            if (yearStr && seasonStr) {
                const { success, data } = await fetchData(
                    settingsApi.getWeekList(yearStr, seasonStr)
                )
                if (success && Array.isArray(data)) {
                    setWeeksList(data)
                } else {
                    setWeeksList([])
                }
            } else {
                setWeeksList([])
            }
        }
        fetchWeeks()
    }, [watchedYear, watchedSeason])

    // улирлын жагсаалт авах
    async function getSeason () {
        const { success, data } = await fetchData(seasonApi.get())
        if (success) {
            setSeason(data)
            setValue("lesson_year", cyear_name)
            setValue("lesson_season", cseason_id)
        }
    }

    // Хадгалах
    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId){
            const { success, errors } = await fetchData(restPeriodApi.put(cdata, editId))
            if(success) {
                reset()
                handleModal()
                refreshDatas()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key][0]});
                }
            }
        }
        else{
            const { success, errors } = await postFetch(restPeriodApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                if(errors && Object.keys(errors).length > 0) {
                    /** Алдааны мессэжийг input дээр харуулна */
                    for (let key in errors) {
                        setError(key, { type: 'custom', message: errors[key][0]});
                    }
                }
            }
        }
    }

    useEffect(() => {
        getSeason()
        setYear(generateLessonYear(5))
        fetchSystemSettings()
    },[])

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(restPeriodApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')
                }
            }
        }
    }

    useEffect(() => {
        if(editId) getDatas()
    }, [editId])

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{ editId ?  t('Хичээлийн жилийн амрах хугацаа засах'): t('Хичээлийн жилийн амрах хугацаа оруулах')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="lesson_year">
                                {t('Хичээлийн жил')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="lesson_year"
                                name="lesson_year"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson_year"
                                            id="lesson_year"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classNames('react-select', { 'is-invalid': errors.lesson_year })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={yearOption || []}
                                            value={yearOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.lesson_year && <FormFeedback className='d-block'>{t(errors.lesson_year.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="lesson_season">
                                {t('Улирал')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='lesson_season'
                                name='lesson_season'
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson_season"
                                            id="lesson_season"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classNames('react-select', { 'is-invalid': errors.lesson_season })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={seasonOption || []}
                                            value={seasonOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.season_name}
                                        />
                                    )
                                }}
                            />
                            {errors.lesson_season && <FormFeedback className='d-block'>{t(errors.lesson_season.message)}</FormFeedback>}
                        </Col>
                       <Col md={12}>
                            <Label className="form-label" for="start_week_preset">
                                {t('Эхлэх хугацаа (Даваа)')}
                            </Label>
                            <Controller
                                control={control}
                                name="start_date"
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        name="start_week_preset"
                                        id="start_week_preset"
                                        classNamePrefix='select'
                                        isClearable
                                        isDisabled={!weeksList.length}
                                        className={classNames('react-select', { 'is-invalid': errors.start_date })}
                                        placeholder={t(weeksList.length ? '-- Даваа гараг сонгох --' : '-- Жил болон улирал сонгоно уу --')}
                                        options={weeksList || []}
                                        value={weeksList.find(w => w.start_date === value) || null}
                                        noOptionsMessage={() => t('Тохиргоо олдсонгүй.')}
                                        onChange={(selectedOption) => {
                                            onChange(selectedOption ? selectedOption.start_date : "")
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.start_date}
                                        getOptionLabel={(option) => `${option.start_date}`}
                                    />
                                )}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="end_week_preset">
                                {t('Дуусах хугацаа (Ням)')}
                            </Label>
                            <Controller
                                control={control}
                                name="end_date"
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        name="end_week_preset"
                                        id="end_week_preset"
                                        classNamePrefix='select'
                                        isClearable
                                        isDisabled={!weeksList.length}
                                        className={classNames('react-select', { 'is-invalid': errors.end_date })}
                                        placeholder={t(weeksList.length ? '-- Ням гараг сонгох --' : '-- Жил болон улирал сонгоно уу --')}
                                        options={weeksList || []}
                                        value={weeksList.find(w => w.end_date === value) || null}
                                        noOptionsMessage={() => t('Тохиргоо олдсонгүй.')}
                                        onChange={(selectedOption) => {
                                            onChange(selectedOption ? selectedOption.end_date : "")
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.end_date}
                                        getOptionLabel={(option) => `${option.end_date}`}
                                    />
                                )}
                            />
                            {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col>
                        {/* <Col xs={12} md={12}>
                            <Label className="form-label" for="start_date">
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='start_date'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        bsSize='sm'
                                        id='start_date'
                                        placeholder='Сонгох'
                                        type="date"
                                        invalid={errors.start_date && true}
                                    />
                                )}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col xs={12} md={12}>
                            <Label className="form-label" for="end_date">
                                {t('Дуусах хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='end_date'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        bsSize='sm'
                                        id='end_date'
                                        placeholder='Сонгох'
                                        type="date"
                                        invalid={errors.end_date && true}
                                    />
                                )}
                            />
                            {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col> */}
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            {
                                editId ?
                                    null
                                :
                                <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                    {t('Буцах')}
                                </Button>
                            }
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};
export default Addmodal;
