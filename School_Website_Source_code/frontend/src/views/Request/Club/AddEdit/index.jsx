import React, { Fragment, useContext, useEffect, useState } from 'react'

import { Download, Trash2, X } from 'react-feather'

import { Controller, useForm } from 'react-hook-form'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner, CardText, UncontrolledTooltip, Badge } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next'
import classnames from 'classnames'

import { convertDefaultValue, validate, ReactSelectStyles, club_type_option } from '@utils'

import { validateSchema } from '../validateSchema'
import SchoolContext from '@src/utility/context/SchoolContext';
import InputSelectDatas from '../helpers/InputSelectDatas';
import useModal from '@src/utility/hooks/useModal';


const boolToCapitalized = b => String(b)[0].toUpperCase() + String(b).slice(1);
const fieldsToSave = ['name', 'name_short', 'name_eng', 'type', 'purpose', 'start_year', 'is_active', 'leader', 'teacher', 'phone_number1', 'phone_number2', 'email', 'facebook', 'sub_org', 'salbar', 'image', 'logo']

const AddEditmodal = ({ isOpen, handleModal, refreshDatas, editData }) => {
	const { school_id: currentSchool } = useContext(SchoolContext)
	const { t } = useTranslation()
	const { showWarning } = useModal()

	const closeBtn = (
		<X className='cursor-pointer' size={15} onClick={handleModal} />
	)

	// ** Hook
	const { control, handleSubmit, formState: { errors }, reset, setError, setValue, watch } = useForm(validate(validateSchema));

	const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: true })
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

	// Api
	const clubApi = useApi().request.club
	const studentApi = useApi().student.get
	const teacherApi = useApi().hrms.teacher
	const subOrgApi = useApi().hrms.subschool.getList
	const salbarApi = useApi().hrms.department.getList

	// to catch field registrations
	const [deleteFiles, setDeleteFiles] = useState([])
	const [teacherDatas, setTeacherDatas] = useState([])
	const [isFormReady, setIsFormReady] = useState(false)

	async function getTeacherDatas() {
		const salbarVal = watch("salbar")
		const subOrgVal = watch("sub_org")
		
		let sub_org = typeof subOrgVal === 'object' ? subOrgVal?.id || "" : subOrgVal || ""
		let department = typeof salbarVal === 'object' ? salbarVal?.id || "" : salbarVal || ""
		
		const { success, data } = await fetchData(teacherApi.getAll(sub_org, department))
		if (success) {
			setTeacherDatas(data)
			
			// fetch дууссаны дараа editData.teacher-г options-оос олж дахин set хийнэ
			const currentTeacher = watch("teacher")
			if (currentTeacher) {
				const teacherId = currentTeacher?.id || currentTeacher
				const found = data.find(t => t.id === teacherId)
				if (found) setValue("teacher", found)
			}
		}
	}

	// to send data to API
	async function onSubmit(cdata) {
		cdata = convertDefaultValue(cdata)

		const formData = new FormData()
		const fileKeys = ['image', 'logo']
		const objectKeys = ['leader', 'teacher', 'sub_org', 'salbar']
		const booleanKeys = ['is_active']

		for (let key in cdata) {
			const value = cdata[key]

			// to include files in request if key in fileKeys
			if (fileKeys.indexOf(key) !== -1) {
				// to avoid formData error about value is not file. Because it can be string if modal in edit mode and file not changed
				if (value instanceof FileList) {
					const file = value[0]
					formData.append(key, file, file.name);
					continue
				} else {
					formData.append(key, (value ?? ''))
				}
			}

			if (objectKeys.indexOf(key) !== -1) {
				if (value) {
					formData.append(key, parseInt(value.id ?? value));  // integer болгоно
					continue
				}
			}

			if (booleanKeys.indexOf(key) !== -1) {
				// to avoid django's serializer's validation error: django.core.exceptions.ValidationError: ['“true” value must be either True or False.']
				formData.append(key, boolToCapitalized(value))
				continue
			}

			formData.append(key, (value ?? ''))
		}

		let modalModeApiResult = null

		if (editData) {
			// to edit data for edit modal mode
			modalModeApiResult = await postFetch(clubApi.put(formData, editData.id))
		} else {
			// to add data for add modal mode
			modalModeApiResult = await postFetch(clubApi.post(formData))
		}

		const { success, errors } = modalModeApiResult

		if (success) {
			reset()
			refreshDatas()
			handleModal()
		}
		else {
			/** Алдааны мессеж */
			for (let key in errors) {
				setError(key, { type: 'custom', message:  errors[key].join()});
			}
		}
	}

	// Устгах
	function handleDelete(fileField) {
		setValue(fileField, '')
		setDeleteFiles([...deleteFiles, fileField])
	}

	useEffect(() => {
		if (!isFormReady) return
		getTeacherDatas()
	}, [watch("salbar"), watch("sub_org"), isFormReady])

	useEffect(() => {
		if (editData && Object.keys(editData).length > 0) {
			for (let key in editData) {
				if (fieldsToSave.includes(key)) {
					setValue(key, editData[key] ?? '')
				}
			}
		}
		setIsFormReady(true)
	}, [editData])

	return (
		<Fragment>
			{isLoading && Loader}
			<Modal
				isOpen={isOpen}
				toggle={handleModal}
				className="sidebar-xl hr-register"
				modalClassName="modal-slide-in "
				contentClassName="pt-0"
				backdrop='static'
			>
				<ModalHeader
					className="mb-1"
					toggle={handleModal}
					close={closeBtn}
					tag="div"
				>
					<h5 className="modal-title">{t('Клуб нэмэх')}</h5>
				</ModalHeader>
				<ModalBody className='flex-grow-1'>
					<Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
						<Col xl={6} sm={12}>
							<Label className='form-label' for='name'>
								{t('Нэр')}
							</Label>
							<Controller
								defaultValue=''
								control={control}
								id='name'
								name='name'
								render={({ field }) => (
									<Input
										{...field}
										type='text'
										name='name'
										id='name'
										bsSize='sm'
										placeholder={t('Нэр')}
										invalid={errors.name && true}
									/>
								)}
							/>
							{errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className='form-label' for='name_short'>
								{t('Товч нэр')}
							</Label>
							<Controller
								defaultValue=''
								control={control}
								name='name_short'
								render={({ field }) => (
									<Input
										{...field}
										type='text'
										id={field.name}
										bsSize='sm'
										placeholder={t('Товч нэр')}
										invalid={errors[field.name] && true}
									/>
								)}
							/>
							{errors.name_short && <FormFeedback className='d-block'>{t(errors.name_short.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className='form-label' for='name_eng'>
								{t('Англи нэр')}
							</Label>
							<Controller
								defaultValue=''
								control={control}
								name='name_eng'
								render={({ field }) => (
									<Input
										{...field}
										type='text'
										id={field.name}
										bsSize='sm'
										placeholder={t('Англи нэр')}
										invalid={errors[field.name] && true}
									/>
								)}
							/>
							{errors.name_eng && <FormFeedback className='d-block'>{t(errors.name_eng.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className='form-label' for='type'>
								{t('Үйл ажиллагааны чиглэл')}
							</Label>
							<Controller
								control={control}
								defaultValue=''
								name="type"
								render={({ field: { value, onChange } }) => {
									return (
										<Select
											name="type"
											id="type"
											classNamePrefix='select'
											isClearable
											className={classnames('react-select', { 'is-invalid': errors.type && true })}
											isLoading={isLoading}
											placeholder={t('-- Сонгоно уу --')}
											options={club_type_option ?? []}
											value={club_type_option.find((c) => c.id === value)}
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
						<Col xl={12}>
							<Label className='form-label' for='purpose'>
								{t('Зорилго')}
							</Label>
							<Controller
								defaultValue=''
								control={control}
								id='purpose'
								name='purpose'
								render={({ field }) => (
									<Input
										{...field}
										type='textarea'
										name='purpose'
										id='purpose'
										bsSize='sm'
										rows="4"
										placeholder={t('Зорилго')}
										invalid={errors.purpose && true}
									/>
								)}
							/>
							{errors.purpose && <FormFeedback className='d-block'>{t(errors.purpose.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className='form-label' for='start_year'>
								{t('Байгуулагдсан он')}
							</Label>
							<Controller
								defaultValue=''
								control={control}
								id='start_year'
								name='start_year'
								render={({ field }) => (
									<Input
										{...field}
										type='number'
										name='start_year'
										id='start_year'
										bsSize='sm'
										placeholder={t('Байгуулагдсан он')}
										invalid={errors.start_year && true}
										onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
									/>
								)}
							/>
							{errors.start_year && <FormFeedback className='d-block'>{t(errors.start_year.message)}</FormFeedback>}
						</Col>
						<Col>
							<Label className='form-label'>
								{t('Идэвхтэй эсэх')}
							</Label>
							<Controller
								defaultValue={true}
								control={control}
								name="is_active"
								render={({ field }) => (
									<div>
										<Input
											{...field}
											id={`${field.name}-true`}
											type="radio"
											invalid={errors[field.name] && true}
											bsSize="md"
                                    		onChange={(e) => field.onChange(e.target.checked)}
											checked={field.value}
										/>
										<Label for={`${field.name}-true`} className='form-label mx-1'>{t('Тийм')}</Label>
										<Input
											{...field}
											id={`${field.name}-false`}
											type="radio"
											invalid={errors[field.name] && true}
											bsSize="md"
                                    		onChange={(e) => field.onChange(!e.target.checked)}
											checked={!field.value}
										/>
										<Label for={`${field.name}-false`} className='form-label mx-1'>{t('Үгүй')}</Label>
									</div>
								)
								}
							/>
							{errors.is_active && <FormFeedback className='d-block'>{errors.is_active.message}</FormFeedback>}
						</Col>
						<hr />
						<Col xl={6} sm={12}>
							<Label className='form-label' for='phone_number1'>
								{t('Утасны дугаар 1')}
							</Label>
							<Controller
								defaultValue=''
								control={control}
								id='phone_number1'
								name='phone_number1'
								render={({ field: { name }, field }) => (
									<Input
										{...field}
										type='number'
										id={name}
										bsSize='sm'
										placeholder={t('Утасны дугаар 1')}
										invalid={errors[name] && true}
									/>
								)}
							/>
							{errors.phone_number1 && <FormFeedback className='d-block'>{t(errors.phone_number1.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className='form-label' for='phone_number2'>
								{t('Утасны дугаар 2')}
							</Label>
							<Controller
								defaultValue=''
								control={control}
								id='phone_number2'
								name='phone_number2'
								render={({ field: { name }, field }) => (
									<Input
										{...field}
										type='number'
										id={name}
										bsSize='sm'
										placeholder={t('Утасны дугаар 2')}
										invalid={errors[name] && true}
									/>
								)}
							/>
							{errors.phone_number2 && <FormFeedback className='d-block'>{t(errors.phone_number2.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className='form-label' for='email'>
								{t('Email')}
							</Label>
							<Controller
								defaultValue=''
								control={control}
								name='email'
								render={({ field }) => (
									<Input
										{...field}
										type='email'
										id={field.name}
										bsSize='sm'
										placeholder={t('Email')}
										invalid={errors[field.name] && true}
									/>
								)}
							/>
							{errors.email && <FormFeedback className='d-block'>{t(errors.email.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className='form-label' for='facebook'>
								{t('Facebook хаяг')}
							</Label>
							<Controller
								defaultValue=''
								control={control}
								id='facebook'
								name='facebook'
								render={({ field: { name }, field }) => (
									<Input
										{...field}
										type='text'
										id={name}
										bsSize='sm'
										placeholder={t('Facebook хаяг')}
										invalid={errors[name] && true}
									/>
								)}
							/>
							{errors.facebook && <FormFeedback className='d-block'>{t(errors.facebook.message)}</FormFeedback>}
						</Col>
						<hr />
						<Col xl={6} sm={12}>
							<Label className="form-label" for="sub_org">
								{t('Харьяа бүрэлдэхүүн сургууль')}
							</Label>
							<InputSelectDatas
								name='sub_org'
								control={control}
								errors={errors}
								getApi={subOrgApi}
							/>
							{errors.sub_org && <FormFeedback className='d-block'>{t(errors.sub_org.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className="form-label" for="salbar">
								{t('Харьяа тэнхим')}
							</Label>
							<InputSelectDatas
								name='salbar'
								control={control}
								errors={errors}
								getApi={salbarApi}
								getApiArgs={[currentSchool]}
							/>
							{errors.salbar && <FormFeedback className='d-block'>{t(errors.salbar.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className="form-label" for="leader">
								{t('Удирдагчийн мэдээлэл')}
							</Label>
							<InputSelectDatas
								name='leader'
								control={control}
								errors={errors}
								getApi={studentApi}
								labelPattern={1}
								getApiArgs={['', '', '', '', '', 1, '']}
							/>
							{errors.leader && <FormFeedback className='d-block'>{t(errors.leader.message)}</FormFeedback>}
						</Col>
						<Col xl={6} sm={12}>
							<Label className="form-label" for="teacher">
								{t('Хариуцсан багш')}
							</Label>
							<Controller
								control={control}
								defaultValue={null}
								name="teacher"
								render={({ field: { value, onChange } }) => (
									<Select
										id="teacher"
										name="teacher"
										isClearable
										classNamePrefix='select'
										className={classnames('react-select', { 'is-invalid': errors.teacher })}
										placeholder={`-- Сонгоно уу --`}
										options={teacherDatas || []}
										value={value || null}
										noOptionsMessage={() => 'Хоосон байна'}
										onChange={(val) =>
											onChange(val || null)}
										styles={ReactSelectStyles}
										getOptionValue={(option) => option.id}
										getOptionLabel={(option) => option.full_name}
									/>
								)}
							/>
							{errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
						</Col>
						<hr />
						<Col md={12} className="mt-50">
							<Label className='form-label' for='image'>
								{t('Нүүр зураг')}
							</Label>
							<Controller
								name='image'
								control={control}
								render={({ field: { value, ...rest } }) => {
									value = value ? value : ''
									return (
										<>
											<Input
												{...rest}
												id={rest.name}
												type="file"
												bsSize='sm'
												accept="image/*"
												onChange={(e) => {
													rest.onChange(e.target.files)
													setDeleteFiles([...deleteFiles, rest.name])
												}}
											/>
											{
												// to hide this info if user changed a file
												editData && editData[rest.name] && deleteFiles.indexOf(rest.name) === -1
													?
													<>
														<Label className='form-label'>Файл: {editData[rest.name].split('/').pop()}</Label>
														<a
															href={editData[rest.name]}
															className={`ms-1`}

															id={`complaintListDatatableDownload${rest.name}`}
														>
															<Badge color="light-info" pill><Download width={"15px"} /></Badge>
														</a>

														<UncontrolledTooltip placement='top' target={`complaintListDatatableDownload${rest.name}`}>Татах</UncontrolledTooltip>

														<a
															role="button"
															className={`ms-1`}
															onClick={() => showWarning({
																question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
																onClick: () => handleDelete(rest.name),
																btnText: t("Устгах")
															})}
															id={`complaintListDatatableDelete${rest.name}`}
														>
															<Badge color="light-danger" pill><Trash2 width={"15px"} /></Badge>
														</a>

														<UncontrolledTooltip placement='top' target={`complaintListDatatableDelete${rest.name}`}>Устгах</UncontrolledTooltip>
													</>
													: ''
											}
										</>
									)
								}}
							/>
							{errors.image && <FormFeedback className='d-block'>{t(errors.image.message)}</FormFeedback>}
						</Col>
						<Col md={12} className="mt-50">
							<Label className='form-label' for='logo'>
								{t('Клубийн logo')}
							</Label>
							<Controller
								name='logo'
								control={control}
								// to remove value attribute from "rest" because it is not permitted by browsers for security
								render={({ field: { value, ...rest } }) => {
									value = value ? value : ''
									return (
										<>
											<Input
												{...rest}
												id={rest.name}
												type="file"
												bsSize='sm'
												accept="image/*"
												onChange={(e) => {
													rest.onChange(e.target.files)
													setDeleteFiles([...deleteFiles, rest.name])
												}}
											/>
											{
												editData && editData[rest.name] && deleteFiles.indexOf(rest.name) === -1
													?
													<>
														<Label className='form-label'>Файл: {editData[rest.name].split('/').pop()}</Label>
														<a
															href={editData[rest.name]}
															className={`ms-1`}

															id={`complaintListDatatableDownload${rest.name}`}
														>
															<Badge color="light-info" pill><Download width={"15px"} /></Badge>
														</a>

														<UncontrolledTooltip placement='top' target={`complaintListDatatableDownload${rest.name}`}>Татах</UncontrolledTooltip>

														<a
															role="button"
															className={`ms-1`}
															onClick={() => showWarning({
																question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
																onClick: () => handleDelete(rest.name),
																btnText: t("Устгах")
															})}
															id={`complaintListDatatableDelete${rest.name}`}
														>
															<Badge color="light-danger" pill><Trash2 width={"15px"} /></Badge>
														</a>

														<UncontrolledTooltip placement='top' target={`complaintListDatatableDelete${rest.name}`}>Устгах</UncontrolledTooltip>
													</>
													: ''
											}
										</>
									)
								}}
							/>
							{errors.logo && <FormFeedback className='d-block'>{t(errors.logo.message)}</FormFeedback>}
						</Col>
						<Col md={12} className="mt-2">
							<Button className="me-2" color="primary" type="submit" disabled={postLoading}>
								{postLoading && <Spinner size='sm' className='me-1' />}
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

export default AddEditmodal

