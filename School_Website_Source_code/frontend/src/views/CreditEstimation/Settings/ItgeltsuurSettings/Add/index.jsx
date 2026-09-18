// ** React imports
import React, { Fragment , useEffect, useState, useContext} from 'react'

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { convertDefaultValue, validate, get_lesson_types, ReactSelectStyles, degree_type, day_type, student_count, hutulbur_student_type} from "@utils"

import { validateSchema } from './validateSchema';
import { t } from 'i18next';
import Select from 'react-select'
import classnames from 'classnames'
import SchoolContext from '@context/SchoolContext'

const Addmodal = ({ open, handleModal, refreshDatas, editId,  handleEdit }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue} = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
    const [lesson_type_option, setLessonTypeOption] = useState(get_lesson_types())
    const { school_id } = useContext(SchoolContext)
    // Api
    const itgeltsuurApi = useApi().credit.itgeltsuur

	async function onSubmit(cdata) {

        cdata = convertDefaultValue(cdata)

        cdata['sub_org'] = school_id
        if(editId) {
            const { success, errors } = await fetchData(itgeltsuurApi.put(editId, cdata))
            if(success) {
                reset()
                refreshDatas()
                handleEdit()
            }
            else {
                /** Алдааны мессеж */
                setError(errors.field, { type: 'custom', message: errors.msg});
            }
        }
        else{

            const { success, errors } = await postFetch(itgeltsuurApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                setError(errors.field, { type: 'custom', message:  errors.msg});
            }
        }
	}

	useEffect(() => {
        getDatas()
    },[editId])

    // засах үйлдэл
    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(itgeltsuurApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

					if (key === 'degree_type') {
                       setValue(data[key]);
                    }
					if (key === 'lesson_type') {
                       setValue(data[key]);
                    }
					if (key === 'day_type') {
                       setValue(data[key]);
                    }
					if (key === 'student_type') {
                       setValue(data[key]);
                    }
					if (key === 'hutul_student_type') {
                       setValue(data[key]);
                    }
                }
            }
        }
    }

	return (
        <Fragment>
            <Modal
                isOpen={ open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
                backdrop='static'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{ editId ?  t('Итгэлцүүр засах'): t('Итгэлцүүр нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={ handleSubmit(onSubmit) }>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name"
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="name"
                                        bsSize="sm"
                                        type="textarea"
                                        placeholder={t('Нэр')}
                                        invalid={errors.name && true}
                                        onKeyDown={(e) =>["+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="desc">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="desc"
                                name="desc"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="desc"
                                        bsSize="sm"
                                        placeholder={t('Тайлбар')}
                                        type="textarea"
                                        invalid={errors.desc && true}
                                    />
                                )}
                            />
                            {errors.desc && <FormFeedback className='d-block'>{t(errors.desc.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12}>
							<Label className='form-label' for='degree_type'>
								{t('Зэрэг')}
							</Label>
							<Controller
								control={control}
								defaultValue=''
								name="degree_type"
								render={({ field: { value, onChange } }) => {
									return (
										<Select
											name="degree_type"
											id="degree_type"
											classNamePrefix='select'
											isClearable
											className={classnames('react-select', { 'is-invalid': errors.degree_type && true })}
											isLoading={isLoading}
											placeholder={t('-- Сонгоно уу --')}
											options={degree_type ?? []}
											value={degree_type.find((c) => c.id === value)}
											noOptionsMessage={() => t('Хоосон байна')}
											onChange={(val) => {
												onChange(val?.id ?? '')
											}}
											styles={ReactSelectStyles}
											getOptionValue={(option) => option.id}
											getOptionLabel={(option) => option.name}
										/>
									)
								}}
							/>
							{errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
						</Col>
                        <Col sm={12}>
							<Label className='form-label' for='lesson_type'>
								{t('Хичээлийн хэлбэр')}
							</Label>
							<Controller
								control={control}
								defaultValue=''
								name="lesson_type"
								render={({ field: { value, onChange } }) => {
									return (
										<Select
											name="lesson_type"
											id="lesson_type"
											classNamePrefix='select'
											isClearable
											className={classnames('react-select', { 'is-invalid': errors.lesson_type && true })}
											isLoading={isLoading}
											placeholder={t('-- Сонгоно уу --')}
											options={lesson_type_option ?? []}
											value={lesson_type_option.find((c) => c.id === value)}
											noOptionsMessage={() => t('Хоосон байна')}
											onChange={(val) => {
												onChange(val?.id ?? '')
											}}
											styles={ReactSelectStyles}
											getOptionValue={(option) => option.id}
											getOptionLabel={(option) => option.name}
										/>
									)
								}}
							/>
							{errors.lesson_type && <FormFeedback className='d-block'>{t(errors.lesson_type.message)}</FormFeedback>}
						</Col>
                        <Col sm={12}>
							<Label className='form-label' for='day_type'>
								{t('Сургалтын хэлбэр')}
							</Label>
							<Controller
								control={control}
								defaultValue=''
								name="day_type"
								render={({ field: { value, onChange } }) => {
									return (
										<Select
											name="day_type"
											id="day_type"
											classNamePrefix='select'
											isClearable
											className={classnames('react-select', { 'is-invalid': errors.day_type && true })}
											isLoading={isLoading}
											placeholder={t('-- Сонгоно уу --')}
											options={day_type ?? []}
											value={day_type.find((c) => c.id === value)}
											noOptionsMessage={() => t('Хоосон байна')}
											onChange={(val) => {
												onChange(val?.id ?? '')
											}}
											styles={ReactSelectStyles}
											getOptionValue={(option) => option.id}
											getOptionLabel={(option) => option.name}
										/>
									)
								}}
							/>
							{errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
						</Col>
                        <Col sm={12}>
							<Label className='form-label' for='student_type'>
								{t('Суралцагчийн тоо')}
							</Label>
							<Controller
								control={control}
								defaultValue=''
								name="student_type"
								render={({ field: { value, onChange } }) => {
									return (
										<Select
											name="student_type"
											id="student_type"
											classNamePrefix='select'
											isClearable
											className={classnames('react-select', { 'is-invalid': errors.student_type && true })}
											isLoading={isLoading}
											placeholder={t('-- Сонгоно уу --')}
											options={student_count ?? []}
											value={student_count.find((c) => c.id === value)}
											noOptionsMessage={() => t('Хоосон байна')}
											onChange={(val) => {
												onChange(val?.id ?? '')
											}}
											styles={ReactSelectStyles}
											getOptionValue={(option) => option.id}
											getOptionLabel={(option) => option.name}
										/>
									)
								}}
							/>
							{errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
						</Col>
                        <Col sm={12}>
							<Label className='form-label' for='hutul_student_type'>
								{t('Сургалтын түвшин')}
							</Label>
							<Controller
								control={control}
								defaultValue=''
								name="hutul_student_type"
								render={({ field: { value, onChange } }) => {
									return (
										<Select
											name="hutul_student_type"
											id="hutul_student_type"
											classNamePrefix='select'
											isClearable
											className={classnames('react-select', { 'is-invalid': errors.hutul_student_type && true })}
											isLoading={isLoading}
											placeholder={t('-- Сонгоно уу --')}
											options={hutulbur_student_type ?? []}
											value={hutulbur_student_type.find((c) => c.id === value)}
											noOptionsMessage={() => t('Хоосон байна')}
											onChange={(val) => {
												onChange(val?.id ?? '')
											}}
											styles={ReactSelectStyles}
											getOptionValue={(option) => option.id}
											getOptionLabel={(option) => option.name}
										/>
									)
								}}
							/>
							{errors.hutul_student_type && <FormFeedback className='d-block'>{t(errors.hutul_student_type.message)}</FormFeedback>}
						</Col>
                        <Col md={12}>
                            <Label className="form-label" for="itgeltsuur">
                                {t('Итгэлцүүр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="itgeltsuur"
                                name="itgeltsuur"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="itgeltsuur"
                                        bsSize="sm"
                                        placeholder={t('Итгэлцүүр')}
                                        type="number"
										onKeyDown={(e) =>["-"].includes(e.key) && e.preventDefault()}
										rules={{
											min: {
												value: 0,
												message: t('Утга 0-ээс бага байж болохгүй') // "Value cannot be less than 0"
											}
										}}
                                        invalid={errors.itgeltsuur && true} // -1 авахгүй
                                    />
                                )}
                            />
                            {errors.itgeltsuur && <FormFeedback className='d-block'>{t(errors.itgeltsuur.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className=" text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                            {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Addmodal;
