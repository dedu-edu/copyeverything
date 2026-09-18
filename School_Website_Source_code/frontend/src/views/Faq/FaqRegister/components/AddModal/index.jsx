import { t } from 'i18next'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
	Button,
	Form,
	FormFeedback,
	Input,
	Label,
	Modal,
	ModalBody,
	ModalHeader,
	Spinner,
} from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

import { CSelect } from '@src/components/CSelect'
import { CReactQuill } from '@src/components/CReactQuill'

export default function AddModal({
	open,
	handleModal,
	refreshDatas,
	editData,
}) {

	// states
	const [faqGroupsOptions, setFaqGroupsOptions] = useState([])

	// Other hooks
	const {
		control,
		handleSubmit,
		reset,
		setValue,
		setError,
		formState: { errors },
	} = useForm()

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({})
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({ isFullScreen: true })
	const isAnyLoading = isLoading || postLoading

	// API
	const faqApi = useApi().faq

	// #region quill
	const quillRef = useRef()

	// Хадгалах
	async function onSubmit(cdata) {
		cdata.group = cdata.group.id

		const formData = new FormData()
		for (const key in cdata) formData.append(key, cdata[key])

		let apiMethod = () => faqApi.post(formData)
		if (editData?.id) apiMethod = () => faqApi.put(formData, editData?.id)

		const { success, errors } = await postFetch(apiMethod())

		if (success) {
			reset()
			refreshDatas()
			handleModal()
		} else {
			/** Алдааны мессэжийг input дээр харуулна */
			for (const key in errors) {
				setError(key, {
					type: 'custom',
					message: errors[key].join('. '),
				})
			}
		}
	}

	async function getFaqGroupsOptions() {
		const { success, data } = await fetchData(faqApi.faqGroup.get())

		if (success) {
			setFaqGroupsOptions(data.results)
			if (editData?.group)
				setValue(
					'group',
					data.results?.find((item) => item.id === editData.group)
				)
		}
	}

	useEffect(() => {
		if (Object.keys(editData).length > 0)
			for (const key in editData) setValue(key, editData[key] ?? '')
	}, [editData])

	useEffect(() => {
		getFaqGroupsOptions()
	}, [])

	return (
		<Modal
			isOpen={open}
			toggle={handleModal}
			className='modal-dialog-centered modal-lg'
			contentClassName='pt-0'
			backdrop='static'
		>
			<ModalHeader className="bg-transparent pb-0" toggle={handleModal}>
				{`${t('Нийтлэг асуулт хариулт')} ${editData?.id ? t('засах') : t('үүсгэх')}`}
			</ModalHeader>

			<ModalBody>
				{isAnyLoading && Loader}
				<Form onSubmit={handleSubmit(onSubmit)}>
					<Controller
						defaultValue=''
						control={control}
						name='group'
						render={({ field }) => {
							return (
								<div className='mt-50'>
									<CSelect
										{...field}
										id="group"
										options={faqGroupsOptions}
										label={t('Нийтлэг асуултын бүлэг')}
										getOptionValue={(option) => option.id}
										getOptionLabel={(option) => option.name}
										error={errors[field.name]}
									/>
									{errors[field.name] && (
										<FormFeedback className='d-block'>
											{errors[field.name].message}
										</FormFeedback>
									)}
								</div>
							)
						}}
					/>
					<Controller
						defaultValue=''
						control={control}
						name='question'
						render={({ field }) => {
							return (
								<div className='mt-50'>
									<Label
										className='form-label'
										for={field.name}
									>
										{t('Асуулт')}
									</Label>
									<Input
                                        {...field}
                                        type='textarea'
                                        name='question'
                                        id='question'
                                        rows='1'
                                        bsSize="sm"
                                        placeholder='Асуулт'
                                    />
									{errors[field.name] && (
										<FormFeedback className='d-block'>
											{errors[field.name].message}
										</FormFeedback>
									)}
								</div>
							)
						}}
					/>
					<Controller
						defaultValue=''
						control={control}
						name='answer'
						render={({ field }) => {
							return (
								<div className='mt-50'>
									<Label
										className='form-label'
										for={field.name}
									>
										{t('Хариулт')}
									</Label>
									<CReactQuill
										{...field}
										ref={quillRef}
										error={errors.answer}
									/>
									{errors[field.name] && (
										<FormFeedback className='d-block'>
											{errors[field.name].message}
										</FormFeedback>
									)}
								</div>
							)
						}}
					/>
					<div className='mt-2 text-center'>
						<Button
							className='me-2'
							color='primary'
							type='submit'
							disabled={postLoading}
						>
							{postLoading && (
								<Spinner size='sm' className='me-1' />
							)}
							{t('Хадгалах')}
						</Button>
						<Button color='secondary' onClick={handleModal}>
							{t('Буцах')}
						</Button>
					</div>
				</Form>
			</ModalBody>
		</Modal>
	)
}
