// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import { t } from 'i18next';

import AuthContext from '@context/AuthContext'

import SchoolContext from "@context/SchoolContext"

import { validate } from "@utils"

import { validateSchema } from '../validateSchema';
import { student_course_level } from '@src/utility/Utils';

const UpdateModal = ({ open, handleUpdate, refreshDatas, editDatas, editId }) => {

    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    const [department_option, setDepartmentOption] = useState([])
    const [professionOption, setProfessionOption] = useState([])
    const [groupOption, setGroup] = useState([])

    var values = {
        group: '',
        student_level: '',
        profession: '',
        department: '',
    }

    const { user } = useContext(AuthContext)
    const [is_disabled, setDisabled] = useState(true)

    const { school_id } = useContext(SchoolContext)

	// Loader
	const { isLoading, fetchData } = useLoader({});

    // Эрэмбэлэлт
    const [select_value, setSelectValue] = useState(values)

    // Api
    const departmentApi = useApi().hrms.department
    const professionDefApi = useApi().hrms.department
    const [student_levelOptions, setStudent_levelOptions] = useState(student_course_level())
    const groupApi = useApi().student.group
    const studentmovementApi = useApi().student.arrived

     // Хөтөлбөрийн багын жагсаалт
     async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
        if(success) {
            setDepartmentOption(data)
        }
    }

    // Мэргэжил
    async function getProfessionDefOption() {
        if (select_value.department){
            const { success, data } = await fetchData(professionDefApi.getProfList(select_value.department))
            if(success) setProfessionOption(data)
        }
    }

     // Ангийн жагсаалт
     async function getGroup() {
        if (!select_value.student_level || !select_value.profession) return
        let level = select_value.student_level
        if (level === 7) level = '' // bugd id
        const { success, data } = await fetchData(groupApi.getList('', '', select_value.profession, '', level))
        if(success) setGroup(data)
    }

    useEffect(() =>
    {
        for(let key in editDatas) {
            if (key == 'now_group') {
                setSelectValue({
                    group: editDatas[key]?.id
                })

                setValue('group', editDatas[key]?.id)
        }}

    }, [editDatas])

    useEffect(() => {
        getDepartmentOption()
        getProfessionDefOption()
        getGroup()
    },[select_value])

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-movement-update')&& school_id) {
            setDisabled(false)
        }
    },[user])

    async function onSubmit(cdata) {
        const { success, data } = await fetchData(studentmovementApi.postArrive(cdata, editId))
        if(success)
        {
            refreshDatas()
            handleUpdate({})
        }
	}

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleUpdate} className="modal-dialog-centered modal-sm" onClosed={handleUpdate} backdrop='static'>
                <ModalHeader className='bg-transparent pb-0' toggle={handleUpdate} ></ModalHeader>
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <div className='text-center'>
                        <h4>{t('Оюутны шилжилт хөдөлгөөн хийх')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="department">
                                {t('Хөтөлбөрийн баг')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="department"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="department"
                                            id="department"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.department })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={department_option || []}
                                            value={value && department_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')

                                                if (val?.id) {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            department: val?.id
                                                        }
                                                    })

                                                } else {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            department: ''
                                                        }
                                                    })
                                                }

                                                setValue('group', '')
                                                setValue('student_level', '')
                                                setValue('profession', '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.department && <FormFeedback className='d-block'>{t(errors.department.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className='mt-1'>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="profession"
                                render={({ field: { value, onChange, ...rest } }) => {
                                    return (
                                        <>
                                            <Label className="form-label mb-0" for={rest.name}>
                                                {t('Мэргэжил')}
                                            </Label>
                                            <Select
                                                name={rest.name}
                                                id={rest.name}
                                                classNamePrefix='select'
                                                isClearable={true}
                                                className={classnames('react-select', { 'is-invalid': errors[rest.name] })}
                                                isLoading={isLoading}
                                                placeholder={t(`Та мэргэжлээ сонгоно уу`)}
                                                options={professionOption}
                                                value={value && professionOption.find((val) => val.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')

                                                    if (val?.id) {
                                                        setSelectValue(current => {
                                                            return {
                                                                ...current,
                                                                [rest.name]: val?.id
                                                            }
                                                        })

                                                    } else {
                                                        setSelectValue(current => {
                                                            return {
                                                                ...current,
                                                                [rest.name]: ''
                                                            }
                                                        })
                                                    }

                                                    setValue('group', '')
                                                    setValue('student_level', '')
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                            {errors[rest.name] && <FormFeedback className='d-block'>{errors[rest.name].message}</FormFeedback>}
                                        </>
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col md={12}>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='student_level'
                                render={({ field: { value, onChange, ...rest } }) => {
                                    return (
                                        <>
                                            <Label className='form-label' for={rest.name}>
                                                {t('Курс')}
                                            </Label>
                                            <Select
                                                name={rest.name}
                                                id={rest.name}
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors[rest.name] })}
                                                isLoading={isLoading}
                                                placeholder={t('--Сонгоно уу--')}
                                                options={student_levelOptions || []}
                                                value={value && student_levelOptions.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')

                                                    if (val?.id) {
                                                        setSelectValue(current => {
                                                            return {
                                                                ...current,
                                                                [rest.name]: val?.id
                                                            }
                                                        })

                                                    } else {
                                                        setSelectValue(current => {
                                                            return {
                                                                ...current,
                                                                [rest.name]: ''
                                                            }
                                                        })
                                                    }

                                                    setValue('group', '')
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                            {errors[rest.name] && <FormFeedback className='d-block'>{t(errors[rest.name].message)}</FormFeedback>}
                                        </>
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="group">
                                {t("Анги")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={select_value.group}
                                name="group"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="group"
                                            id="group"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.group })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={groupOption || []}
                                            value={groupOption.find((c) => c.id === select_value.group)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                if (val?.id) {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            group: val?.id
                                                        }
                                                    })
                                                } else {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            group: ''
                                                        }
                                                    })
                                                }
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.group && <FormFeedback className='d-block'>{t(errors.group.message)}</FormFeedback>}
                        </Col>
                        <small className='fw-bolder'>{t('Шинэ оюутны код автоматаар үүсгэгдэнэ.')}</small>
                        {/* <Col md={12}>
                            <Label className="form-label" for="code">
                                {t('Оюутны шинэ код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="code"
                                name="code"
                                render={({ field }) => (
                                    <Input
                                        id ="code"
                                        bsSize="sm"
                                        placeholder={t('Оюутны шинэ код')}
                                        {...field}
                                        type="text"
                                        invalid={errors.code && true}
                                    />
                                )}
                            />
                            {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
                        </Col> */}
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleUpdate}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default UpdateModal;

