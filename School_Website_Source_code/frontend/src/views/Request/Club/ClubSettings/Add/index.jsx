import React, { Fragment, useState, useEffect } from 'react'

import { X } from 'react-feather'

import { Controller, useForm } from 'react-hook-form'

import { convertDefaultValue, validate, ReactSelectStyles } from '@utils'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import classnames from 'classnames'
import { useTranslation } from 'react-i18next'

import '@styles/react/libs/flatpickr/flatpickr.scss'
import Flatpickr from 'react-flatpickr'

import { validateSchema } from './validateSchema'
import ActiveYearContext from "@context/ActiveYearContext"
import { useContext } from 'react'
import { formatDate } from '@src/utility/Utils'
import moment from 'moment'

const Addmodal = ({open, handleModal, refreshDatas, editId }) => {

    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue, getValues } = useForm(validate(validateSchema));

    const { isLoading, Loader, fetchData } = useLoader({})

    const [buildingOption, setBuildingOption] = useState([])
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)
    const [endPicker, setEndPicker] = useState(new Date())
    const [startPicker, setStartPicker] = useState(new Date())

    // Api
    const clubSettingsApi = useApi().request.club.settings

    async function getOneDatas() {
        const { success, data } = await fetchData(clubSettingsApi.getOne(editId))
        if(success) {
            for (let key in data) {
                setValue(key, data[key])
                if (key === 'start_date') {
                    setStartPicker(data[key])
                }
                if (key === 'finish_date') {
                    setEndPicker(data[key])
                }
            }
        }
    }

    useEffect(() => {
        if(editId) getOneDatas()
    },[])

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['start_date'] = formatDate(startPicker, 'YYYY-MM-DD HH:mm:ss')
        cdata['finish_date'] = formatDate(endPicker, 'YYYY-MM-DD HH:mm:ss')
        console.log('cdata', cdata)
        if(editId) {
            const { success, errors } = await fetchData(clubSettingsApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            }
            else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                    setError(errors[key].field, { type: 'custom', message:  errors[key].msg});
                }
            }
        } else {
            const { success, errors } = await fetchData(clubSettingsApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            }
            else {
               /** Алдааны мессэжийг input дээр харуулна */
               for (let key in errors) {
                    setError(errors[key].field, { type: 'custom', message:  errors[key].msg});
                }
            }
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in"
                contentClassName="pt-0"
            >
            {
                isLoading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t(`Клубийн бүртгэлийн хуваарь ${editId ? 'засах' : 'нэмэх'}`)}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="limit">
                                {t("Бүртгүүлж болох клубийн тоо")}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="limit"
                                name="limit"
                                render={({ field }) => (
                                    <Input
                                        id ="limit"
                                        bsSize="sm"
                                        placeholder={t("Бүртгүүлж болох клубийн тоо")}
                                        {...field}
                                        type='number'
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        invalid={errors.limit && true}
                                    />
                                )}
                            />
                            {errors.limit && <FormFeedback className='d-block'>{errors.limit.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="start_date">
                                {t('Бүртгэл эхлэх өдөр')}
                            </Label>
                            <Controller
                                defaultValue={formatDate(new Date())}
                                control={control}
                                name='start_date'
                                className="form-control"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Flatpickr
                                            id='start_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(formatDate(dates[0], 'YYYY-MM-DD HH:mm:ss'));
                                                setStartPicker(dates[0])
                                            }}
                                            value={startPicker}
                                            style={{ height: "30px" }}
                                            options={{
                                                dateFormat: 'Y-m-d H:i',
                                                utc: true,
                                                time_24hr: true,
                                                enableTime: true,
                                            }}
                                        />
                                    )
                                }}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="finish_date">
                                {t('Бүртгэл дуусах өдөр')}
                            </Label>
                            <Controller
                                defaultValue={formatDate(new Date())}
                                control={control}
                                name='finish_date'
                                className="form-control"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Flatpickr
                                            id='finish_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(formatDate(dates[0], 'YYYY-MM-DD HH:mm:ss'));
                                                setEndPicker(dates[0])
                                            }}
                                            value={endPicker}
                                            style={{ height: "30px" }}
                                            options={{
                                                dateFormat: 'Y-m-d H:i',
                                                utc: true,
                                                time_24hr: true,
                                                enableTime: true,
                                                minDate: getValues("start_date"),
                                            }}
                                        />
                                    )
                                }}
                            />
                            {errors.finish_date && <FormFeedback className='d-block'>{t(errors.finish_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                defaultValue={true}
                                control={control}
                                id='is_active'
                                name='is_active'
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            checked={field.value}
                                            className='me-50'
                                            type='checkbox'
                                            name='is_active'
                                            id='is_active'
                                        />
                                    )
                                }}
                            />
                            <Label className='form-label' for='is_active'>
                                {t('Идэвхтэй эсэх')}
                            </Label>
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleModal}>
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

