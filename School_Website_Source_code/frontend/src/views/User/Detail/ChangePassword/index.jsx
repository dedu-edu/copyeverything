import React, { Fragment, useContext } from "react";
import { CardTitle, Row, Col, CardBody, Card,CardHeader,Button,Form,FormFeedback,Label } from "reactstrap";
import { CheckCircle, XCircle } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

//import classes
import classnames from "classnames";

import {useForm, Controller } from "react-hook-form"

import { validate, convertDefaultValue} from "@utils"
import { validatePassSchema } from "./validationSchema.jsx"


import { Navigate, useNavigate } from "react-router-dom";

import InputPasswordToggle from "@components/input-password-toggle"
import AuthContext from '@context/AuthContext'

const ChangePassword = (props) => {

	const navigate = useNavigate()
	const { user } = useContext(AuthContext)

    // API
    const userApi = useApi().user

	// ** Hooks
	const { control, handleSubmit, reset, watch, formState: { errors }} = useForm(validate(validatePassSchema))
	const oldPassword = watch('old_password', '')
	const newPassword = watch('password', '')
	const confirmPassword = watch('confirm_password', '')
	const passwordRequirements = [
		{
			label: 'Хамгийн багадаа 8 тэмдэгттэй',
			valid: newPassword.length >= 8,
		},
		{
			label: 'Зөвхөн тооноос бүрдээгүй',
			valid: newPassword.length > 0 && !/^\d+$/.test(newPassword),
		},
		{
			label: 'Хуучин нууц үгээс ялгаатай',
			valid: oldPassword.length > 0 && newPassword.length > 0 && newPassword !== oldPassword,
		},
		{
			label: 'Давтан оруулсан нууц үгтэй ижил',
			valid: confirmPassword.length > 0 && newPassword === confirmPassword,
		},
	]

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

	// Superuser-ийн нууц үг солих хэсгийг түр хаав.
	if (user.is_superuser) {
		return <Navigate replace to="/auth/not-auth" />
	}

	async function onSubmit(values) {
		const data = convertDefaultValue(values)
		try {
			const { success } = await fetchData(userApi.changePassword(data))
			if (success) {
				reset()
				navigate('/login')
			}
		} catch (error) {
			// API hook алдааны мэдээллийг toast-аар харуулна.
		}
	}

	return (
		<Fragment>
		<Row className="justify-content-start">
			<Col xs={12} md={8} lg={6} xl={5}>
				<Card>
				<CardBody className=" p-1 " >
					<div className={classnames("p-1")}>
						<CardHeader className="pb-0 pt-0 px-0 mb-1 text-center">
							<CardTitle tag="h4">Хэрэглэгчийн нууц үг солих</CardTitle>
						</CardHeader>
						<Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
							<div className={classnames("cardMaster rounded border p-1")}>
								<Col xs={12} md={12}>
									<Label className="form-label" for="old_password">
										Хуучин нууц үг
									</Label>
									<Controller
										defaultValue=''
										control={control}
										id='old_password'
										name='old_password'
										render={({ field }) => <InputPasswordToggle className="input-group-merge" invalid={errors.old_password && true} {...field} />} />
									{errors.old_password && <FormFeedback>{errors.old_password.message}</FormFeedback>}
									<Label className="form-label" for="password">
										Шинэ нууц үг
									</Label>
									<Controller
										defaultValue=''
										control={control}
										id='password'
										name='password'
									render={({ field }) => <InputPasswordToggle className="input-group-merge" invalid={errors.password && true} {...field} />} />
									{errors.password && <FormFeedback>{errors.password.message}</FormFeedback>}
									<div className="mt-50 mb-1">
										{passwordRequirements.map(requirement => {
											const Icon = requirement.valid ? CheckCircle : XCircle
											return (
												<div
													key={requirement.label}
													className={`d-flex align-items-center mb-25 ${requirement.valid ? 'text-success' : 'text-danger'}`}
													style={{ fontSize: '12px' }}
												>
													<Icon size={14} className="me-50" />
													<span>{requirement.label}</span>
												</div>
											)
										})}
									</div>
									<Label className="form-label" for="confirm-password">
										Нууц үгээ давтана уу
									</Label>
									<Controller
										defaultValue=''
										control={control}
										id='confirm_password'
										name='confirm_password'
										render={({ field }) => <InputPasswordToggle className="input-group-merge" invalid={errors.confirm_password && true} {...field} />} />
									{errors.confirm_password && <FormFeedback>{errors.confirm_password.message}</FormFeedback>}
									<div className="text-center">
										<Button className="mt-1 me-1" color="primary" type="submit" disabled={isLoading}>
											Хадгалах
										</Button>
									</div>
								</Col>
							</div>
						</Row>
					</div>
			</CardBody>
			</Card>
		</Col>
		</Row>
		</Fragment>
	);
};

export default ChangePassword;
