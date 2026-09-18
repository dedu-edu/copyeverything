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

import classNames from 'classnames';
import { Edit } from 'react-feather';
import { Controller } from "react-hook-form";

import ScrollSelectFilter from '../ScrollSelectFilter';

export default function SubCategoryAddBlock({
	setEdit,
	edit,
	handleSubmit,
	onSubmit,
	control,
	errors,
	t,
	isValid,
	scienceApi
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Sub категорын нэмэх')}</CardTitle>
				<Edit size={20} onClick={() => setEdit(!edit)} />
			</CardHeader>
			<CardBody>
				<Form onSubmit={handleSubmit(onSubmit)}>
					<fieldset disabled={!edit}>
						<div className="mb-2">
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
										getApi={(pageLocal, searchTextLocal, recordsLimitPerPageLocal) => scienceApi.category.get(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal)}
										optionValueFieldName={'id'}
										recordsLimitPerPage={50}
										isDisabled={!edit}
									/>
								)}
							/>
							{errors.category && <FormFeedback className='d-block'>{errors.category.message}</FormFeedback>}
						</div>
						<div className="mb-2">
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
										type="text"
										placeholder={t("Шалгуурын нэршил")}
										invalid={errors[field.name] && true}
									/>
								)}
							/>
							{errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
						</div>
						<div className="mb-2">
							<Label className="form-label">
								{t('Багц цаг')}
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
						<div className="mb-2">
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
						{
							edit &&
							<Button className="me-2" color="primary" type="submit" disabled={!isValid}>
								{t('Хадгалах')}
							</Button>
						}
					</fieldset>
				</Form>
			</CardBody>
		</Card>
	)
}
