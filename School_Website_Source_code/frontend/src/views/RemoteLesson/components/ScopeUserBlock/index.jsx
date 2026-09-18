import { useCallback, useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import classnames from "classnames";

import {
	Button,
	Col,
	Form,
	FormFeedback,
	Row
} from "reactstrap";

import useLoader from "@hooks/useLoader";

import ScrollSelectFilter from "../ScrollSelectFilter";
import SchoolContext from "@src/utility/context/SchoolContext";
import { useTranslation } from "react-i18next";


const ScopeFilter = ({
	scope,
	title,
	getApi,
	handleSubmit,
	onSubmit,
	control,
	errors
}) => {
	const { t } = useTranslation()

	return (
		<Form onSubmit={handleSubmit((cdata) => onSubmit(cdata, scope))} className="h-100">
			<div className='added-cards mb-0 text-center h-100'>
				<div className={classnames('cardMaster p-1 rounded border h-100 d-flex flex-column')}>
					<h4>{title}</h4>
					<div className="mt-auto">
						<Controller
							defaultValue={[]}
							control={control}
							name={scope}
							render={({ field: { ref, ...rest } }) =>
								<>
									<ScrollSelectFilter
										{...rest}
										fieldName={rest.name}
										getApi={getApi}
										getOptionLabel={(option) => `${option.code ?? ''} ${option.register_num ?? ''} ${option.last_name?.charAt(0)}. ${option.first_name}`}
										getOptionValue={(option) => option.id}
										isMulti={true}
										optionValueFieldName={'id'}
										recordsLimitPerPage={10}
									/>
									{errors[rest.name] && <FormFeedback className='d-block'>{t(errors[rest.name].message)}</FormFeedback>}
								</>
							}
						/>
						<Button
							className="me-0 mt-1"
							color="primary"
							type="submit"
						>
							{t("Хадгалах")}
						</Button>
					</div>
				</div>
			</div>
		</Form>
	)
}

export default function ScopeUserBlock({
	remoteApi,
	elearnId,
	refreshData
}) {
	const { t } = useTranslation()
	const { isLoading, Loader, fetchData } = useLoader({});
	const { control, handleSubmit, setError, formState: { errors }, watch } = useForm({})
	const formValuesOriginal = watch()

	// to get id from objects on form inputs
	const formValues = {
		teachers: formValuesOriginal?.teachers?.map(item => item.id) ?? [],
		users: formValuesOriginal?.users?.map(item => item.id) ?? [],
	}

	const { school_id } = useContext(SchoolContext)

	// to prevent getdatas every render on select inputs
	const getTeachers = useCallback((pageLocal, searchTextLocal = '', recordsLimitPerPageLocal) => remoteApi.users.getList(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal, school_id, '', '', '', true), [school_id])

	const getUsers = useCallback((pageLocal, searchTextLocal = '', recordsLimitPerPageLocal) => {
		const response = remoteApi.users.getList(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal, school_id, '', '', '', false)
		return response
	}, [school_id])

	async function onSubmit(formCdata, requestType) {
		let cdata = {}
		cdata.elearnId = elearnId
		cdata.usersIds = formValues[requestType]
		const { success, error } = await fetchData(remoteApi.users.put(cdata))
		if (success) refreshData()

		else {
			/** Алдааны мессэжийг input дээр харуулна */
			for (const key in error) {
				setError(error[key].field, { type: 'custom', message: error[key].msg });
			}
		}
	}

	return (
		<>
			{isLoading && Loader}
			<Row className="m-0">
				<Col className="p-0">
					<ScopeFilter
						scope={'teachers'}
						title={t('Багш кодоор сонгох')}
						getApi={getTeachers}
						handleSubmit={handleSubmit}
						control={control}
						errors={errors}
						onSubmit={onSubmit}
					/>
				</Col>
				<Col className="p-0">
					<ScopeFilter
						scope={'users'}
						title={t('Ажилчдыг кодоор сонгох')}
						getApi={getUsers}
						handleSubmit={handleSubmit}
						control={control}
						errors={errors}
						onSubmit={onSubmit}
					/>
				</Col>
			</Row>
		</>
	)
}