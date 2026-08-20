import { t } from 'i18next'
import { useEffect } from 'react'
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

import { faqGroupTypes } from '@utils'
import { CSelect } from '@src/components/CSelect'

export default function AddModal({
	open,
	handleModal,
	refreshDatas,
	editData,
}) {
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
	const {
		Loader,
		isLoading: postLoading,
		fetchData: postFetch,
	} = useLoader({})

	// API
	const faqGroupApi = useApi().faq.faqGroup

	// Хадгалах
	async function onSubmit(cdata) {
		cdata.type = cdata.type.id

		const formData = new FormData()
		for (const key in cdata) formData.append(key, cdata[key])

		let apiMethod = () => faqGroupApi.post(formData)
		if (editData?.id)
			apiMethod = () => faqGroupApi.put(formData, editData?.id)

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

	useEffect(() => {
		if (Object.keys(editData).length > 0) {
			for (const key in editData) {
				if (key === 'type')
					setValue(
						key,
						faqGroupTypes.find((item) => item.id === editData[key])
					)
				else setValue(key, editData[key] ?? '')
			}
		}
	}, [editData])

	return (
		<Modal
			isOpen={open}
			toggle={handleModal}
			className='modal-dialog-centered'
			contentClassName='pt-0'
			backdrop='static'
		>
			<ModalHeader className="bg-transparent pb-0" toggle={handleModal}>
				{t('Нийтлэг асуултын бүлгийг')}{' '}
				{editData?.id ? t('засах') : t('үүсгэх')}
			</ModalHeader>
			<ModalBody>
				{postLoading && Loader}
				<Form onSubmit={handleSubmit(onSubmit)}>
					<Controller
						defaultValue=''
						control={control}
						name='name'
						render={({ field }) => {
							return (
								<div>
									<Label
										className='form-label'
										for={field.name}
									>
										{t('Бүлэг асуултын нэр')}
									</Label>
									<Input
										{...field}
										type='text'
										id={field.name}
										placeholder={t('Бүлэг асуултын нэр')}
										bsSize='sm'
										invalid={errors[field.name] && true}
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
						name='type'
						render={({ field }) => {
							return (
								<div className='mt-2'>
									<CSelect
										{...field}
										label={t('Хэнд харагдах төрөл')}
										id={field.name}
										error={errors[field.name]}
										options={faqGroupTypes}
										getOptionValue={(option) => option.id}
										getOptionLabel={(option) => option.name}
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
