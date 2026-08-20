import 'quill/dist/quill.snow.css';
import { useRef, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import ReactQuill from 'react-quill';
import { Col, FormFeedback, Input, Label, Row } from 'reactstrap';

import InputFile from '../InputFile';

export default function Elearn({
	t,
	control,
	errors,
	setValue
}) {
	// #region to save file
	const image = useWatch({
		control,
		name: 'image',
	});

	const [image_old, setImageOld] = useState(image)
	const [radioFileType, setRadioFileType] = useState(`image-file`)

	const handleDeleteImage = () => {
		setImageOld('')
		setValue('image', '')
	}

	const clickLogoImage = () => {
		var logoInput = document.getElementById(`image`)
		logoInput.click()
	}
	// #endregion

	// #region editor code
	const quillRef = useRef(null);

	const modules = {
		toolbar: [
			[{ 'font': [] }, { 'size': ['small', 'medium', 'large', 'huge'] }],
			[{ 'header': '1' }, { 'header': '2' }],
			[{ 'align': [] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ 'list': 'ordered' }, { 'list': 'bullet' }],
			[{ 'indent': '-1' }, { 'indent': '+1' }],
			['link'],
			[{ color: [] }, { background: [] }],
			['blockquote'],
			//   ['image'],
			['clean']
		],
	};

	const formats = [
		'header', 'bold', 'italic', 'underline', 'strike',
		'align', 'list', 'indent',
		'size', 'link',
		// 'image',
		'color', 'background',
		'clean', 'font', 'blockquote'
	];
	// #endregion

	return (
		<Row>
			<Col md={12}>
				<Label className='form-label' for='title'>
					{t('Сургалтын нэр')}
				</Label>
				<Controller
					control={control}
					id='title'
					name='title'
					render={({ field }) => (
						<Input
							{...field}
							type='text'
							name='title'
							id='title'
							bsSize='sm'
							placeholder={t('Сургалтын нэр')}
							invalid={errors[field.name] && true}
						/>
					)}
				/>
				{errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
			</Col>
			<Col md={12} className="mt-50">
				<style>
					{`
						.custom-quill .ql-container {
							min-height: 100px;
						}
					`}
				</style>
				<Label className="form-label" for="description">
					{t('Тайлбар')}
				</Label>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<ReactQuill
							{...field}
							id={field.name}
							ref={quillRef}
							placeholder={t('Тайлбар')}
							modules={modules}
							formats={formats}
							theme="snow"
							className='custom-quill'
						/>
					)}
				/>
				{errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
			</Col>
			<Col md={6} className="mt-50">
				<Controller
					control={control}
					id='is_end_exam'
					name='is_end_exam'
					render={({ field }) => {
						return (
							<Input
								{...field}
								checked={field.value}
								className='me-50'
								type='checkbox'
								name='is_end_exam'
								id='is_end_exam'
							/>
						)
					}}
				/>
				<Label className='form-label' for='is_end_exam'>
					{t('Төгсөлтийн шалгалттай эсэх')}
				</Label>
			</Col>
			<Col md={6} className="mt-50">
				<Controller
					control={control}
					id='is_certificate'
					name='is_certificate'
					render={({ field }) => {
						return (
							<Input
								{...field}
								checked={field.value}
								className='me-50'
								type='checkbox'
								name='is_certificate'
								id='is_certificate'
							/>
						)
					}}
				/>
				<Label className='form-label' for='is_certificate'>
					{t('Сертификат олгох эсэх')}
				</Label>
			</Col>
			<Col md={6} className="mt-50">
				<Label className="form-label" for="start_date">
					{t('Хичээл эхлэх хугацаа')}
				</Label>
				<Controller
					control={control}
					id="start_date"
					name="start_date"
					render={({ field }) => (
						<Input
							{...field}
							id="start_date"
							bsSize="sm"
							placeholder={t('Хичээл эхлэх хугацаа')}
							type="date"
							invalid={errors.start_date && true}
						/>
					)}
				/>
				{errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
			</Col>
			<Col md={6} className="mt-50">
				<Label className="form-label" for="end_date">
					{t('Хичээл дуусах хугацаа')}
				</Label>
				<Controller
					control={control}
					id="end_date"
					name="end_date"
					render={({ field }) => (
						<Input
							{...field}
							id="end_date"
							bsSize="sm"
							placeholder={t('Хичээл дуусах хугацаа')}
							type="date"
							invalid={errors.end_date && true}
						/>
					)}
				/>
				{errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
			</Col>
			<Col md={12} className="mt-50">
				<Label for='image' className='d-block text-center'><span>{t('Зураг')}</span></Label>
				<Controller
					control={control}
					name={'image'}
					render={({ field: { ref, ...rest } }) => {
						return (
							<Row className='mt-1'>
								<Col md={6} className='text-end'>
									<Input
										className='me-1'
										type='radio'
										value={`${rest.name}-file`}
										name={`${rest.name}-file_source`}
										id={`${rest.name}-file`}
										checked={radioFileType === `${rest.name}-file`}
										onChange={(e) => { setRadioFileType(e.target.value) }}
									/>
									<Label className='form-label' for={`${rest.name}-file`}>
										{t('Файл сонгох')}
									</Label>
								</Col>
								<Col md={6} className='text-start'>
									<Input
										className='me-1'
										type='radio'
										value={`${rest.name}-url`}
										name={`${rest.name}-file_source`}
										id={`${rest.name}-url`}
										checked={radioFileType === `${rest.name}-url`}
										onChange={(e) => { setRadioFileType(e.target.value) }}
									/>
									<Label className='form-label' for={`${rest.name}-url`}>
										{t('URL хаяг')}
									</Label>
								</Col>
								<Col md={12} className='text-center'>
									{radioFileType === `${rest.name}-file` ?
										<InputFile
											{...rest}
											placeholder={t('Файл сонгоно уу')}
											errors={errors}
											onChange={(e) => {
												rest.onChange(e?.target?.files?.[0] ?? '')
											}}
											accept={"image/*"}
											warning={'Файл оруулна уу. Зөвхөн зураг файл хүлээж авна'}
										/>
										:
										<>
											<Input
												{...rest}
												type='text'
												id={rest.name}
												bsSize='sm'
												placeholder={t('URL хаяг')}
												invalid={errors[rest.name] && true}
											/>
											{errors[rest.name] && <FormFeedback className='d-block'>{t(errors[rest.name].message)}</FormFeedback>}
										</>
									}
								</Col>
							</Row>
						)
					}}
				></Controller>
			</Col>
		</Row>
	)
}