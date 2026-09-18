import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Form, FormFeedback, Input, Label, Col, Row, Spinner } from 'reactstrap';
import useApi from '@src/utility/hooks/useApi';

const WTeacherFilesForm = ({ teacher }) => {
	const yearops = [
		{ name: "2024-2025" },
		{ name: "2023-2024" },
		{ name: "2025-2026" }
	];

	const wapi = useApi().w_time;

	const [subCategoryOptions, setSubCategoryOptions] = useState([]);
	const [years, setYears] = useState(yearops);
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm({
		defaultValues: {
		file: null,
		category: '',
		lesson_year: '2024-2025',
		teacher: teacher
		}
	});

	const getSubCategoryOptions = async () => {
		try {
		const res = await wapi.category.sub.get()
		setSubCategoryOptions(res?.results || []);
		} catch (err) {
		console.error('Failed to fetch subcategories', err);
		}
	};

	const onSubmit = async (data) => {
		try {
		const formData = new FormData();
		Object.keys(data).forEach((key) => {
			if (key === 'file' && data[key]) {
			formData.append(key, data[key][0]);
			} else {
			formData.append(key, data[key]);
			}
		});

		const response = await wapi?.teacher.post(formData);
		} catch (err) {
			alert('Upload failed!');
		}
	};

	useEffect(() => {
		getSubCategoryOptions();
	}, []);

	return (
		<div>
			<Form onSubmit={handleSubmit(onSubmit)}>
					<Row className='soft-border p-0' style={{ margin: 0, overflow: 'hidden' }}>
					<h5 className="mb-2 header-gradient">Багц цаг тооцуулах</h5>
					<Col md={12}>
						<Label for="file">Файл (зөвхөн PDF)</Label>
						<Controller
							control={control}
							name="file"
							rules={{
							required: 'Файл заавал оруулах шаардлагатай',
							validate: (files) => {
								if (!files || files.length === 0) return 'Файл оруулна уу';
								const file = files[0];
								const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
								return isPDF || 'Зөвхөн PDF файл зөвшөөрөгдөнө';
							}
							}}
							render={({ field }) => (
							<Input
								type="file"
								id={field.name}
								accept=".pdf,application/pdf"
								onChange={(e) => field.onChange(e.target.files)}
								invalid={!!errors.file}
							/>
							)}
						/>
						{errors.file && <FormFeedback>{errors.file.message}</FormFeedback>}
					</Col>
					<Col md={12}>
						<Label for="category">Багц цагийн шалгуур сонгох (сонгосон шалгуурын оноогоор тооцно)</Label>
						<Controller
							control={control}
							name="category"
							rules={{ required: 'Дэд категор заавал оруулах шаардлагатай' }}
							render={({ field }) => (
								<Input
									type="select"
									id={field.name}
									invalid={!!errors.category}
								{...field}
							>
								<option value="">-- Сонгох --</option>
									{subCategoryOptions.map((item) => (
										<option key={item.id} value={item.id}>
											{`${item.name} | ${item.value} | Score: ${item.score}`}
										</option>
									))}
							</Input>
						)}
						/>
						{errors.category && <FormFeedback>{errors.category.message}</FormFeedback>}
					</Col>

					<Col md={12}>
						<Label for="lesson_year">Хичээлийн жил</Label>
						<Controller
							control={control}
							name="lesson_year"
							render={({ field }) => (
							<Input type="select" id={field.name} {...field}>
								{years.map((y, index) => (
									<option key={index} value={y.name}>
									{y.name}
									</option>
								))}
							</Input>
						)}
						/>
					</Col>
					<Col md={12} className="m-2 d-flex justify-content-end">
						<Button color="primary" type="submit" disabled={isSubmitting}>
						{isSubmitting ? <Spinner size="sm" /> : 'Илгээх'}
						</Button>
					</Col>
				</Row>
			</Form>
		</div>
  );
};

export default WTeacherFilesForm;
