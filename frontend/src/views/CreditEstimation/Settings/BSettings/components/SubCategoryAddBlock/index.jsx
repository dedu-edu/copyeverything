import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardTitle,
	Form,
	FormFeedback,
	Input,
	Label
} from 'reactstrap';
import { ChevronDown, ChevronUp } from "react-feather";

import classNames from 'classnames';
import { Controller } from "react-hook-form";

import ScrollSelectFilter from '../ScrollSelectFilter';
import { useState } from 'react';

export default function SubCategoryAddBlock({
	handleSubmit,
	onSubmit,
	control,
	errors,
	t,
	isValid,
	professionalActivityApi
}) {
	const [isvisible, setIsvisible] = useState(false)

	const toggle = () =>{
		setIsvisible(!isvisible)
	}

	return (
		<>
		  <div
				onClick={toggle}
				className="d-flex justify-content-between align-items-center p-1 cursor-pointer border rounded bg-light"
				style={{
					background: "linear-gradient(135deg, #e3f2fd, #bbdefb)"
				}}
			>
				<h5 className="mb-0">
					{t("Б цагийг тооцох онооны шалгуур нэмэх")}
				</h5>

				{isvisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
			</div>
		{
			isvisible &&
			<Card>
				<CardBody className='p-1'>
					<Form onSubmit={handleSubmit(onSubmit)}>
						<fieldset>
							<div className="mb-1">
								<Label className="form-label">
									{t('Үндсэн категор')}
								</Label>
								<Controller
									defaultValue=""
									control={control}
									name="category"

									// to exclude "ref" because message in browser's console: 'Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?"'
									render={({ field: { ref, ...rest } }) => (
										<ScrollSelectFilter
											{...rest}
											className={classNames('react-select', { 'is-invalid': errors[rest.name] })}
											getOptionValue={(option) => option.id}
											getOptionLabel={(option) => option.name}
											fieldName={rest.name}
											getApi={(pageLocal, searchTextLocal, recordsLimitPerPageLocal) => professionalActivityApi.category.get(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal)}
											optionValueFieldName={'id'}
											recordsLimitPerPage={50}
										/>
									)}
								/>
								{errors.category && <FormFeedback className='d-block'>{errors.category.message}</FormFeedback>}
							</div>
							<div className="mb-1">
								<Label className="form-label">
									{t('Шалгуурын нэршил')}
								</Label>
								<Controller
									defaultValue=""
									control={control}
									name="name"
									render={({ field }) => (
										<Input
											{...field}
											id={field.name}
											type="textarea"
											placeholder={t("Шалгуурын нэршил")}
											invalid={errors[field.name] && true}
										/>
									)}
								/>
								{errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
							</div>
							<div className="mb-1">
								<Label className="form-label">
									{t('Хэмжих нэгж')}
								</Label>
								<Controller
									defaultValue=""
									control={control}
									name="value"
									render={({ field }) => (
										<Input
											{...field}
											id={field.value}
											type="text"
											invalid={errors[field.value] && true}
										/>
									)}
								/>
								{errors.value && <FormFeedback className='d-block'>{errors.value.message}</FormFeedback>}
							</div>
							<div className="mb-1">
								<Label className="form-label">
									{t('Оноо')}
								</Label>
								<Controller
									defaultValue=""
									control={control}
									name="score"
									render={({ field }) => (
										<Input
											{...field}
											id={field.name}
											type="number"
											placeholder={t("Оноо")}
											invalid={errors[field.name] && true}
										/>
									)}
								/>
								{errors.score && <FormFeedback className='d-block'>{errors.score.message}</FormFeedback>}
							</div>
							<div className="mb-1">
								<Label className="form-label">
									{t('Дараалал')}
								</Label>
								<Controller
									defaultValue=""
									control={control}
									name="order_no"
									render={({ field }) => (
										<Input
											{...field}
											id={field.name}
											type="number"
											placeholder={t("Дараалал")}
											invalid={errors[field.name] && true}
										/>
									)}
								/>
								{errors.order_no && <FormFeedback className='d-block'>{errors.order_no.message}</FormFeedback>}
							</div>
							<Button className="me-2" color="primary" type="submit" disabled={!isValid}>
								{t('Хадгалах')}
							</Button>
						</fieldset>
					</Form>
				</CardBody>
			</Card>
		}
		</>
	)
}
