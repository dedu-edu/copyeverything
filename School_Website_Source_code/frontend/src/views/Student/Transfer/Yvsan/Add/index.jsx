// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import SchoolContext from "@context/SchoolContext";
import ActiveYearContext from "@context/ActiveYearContext";

import { ReactSelectStyles, convertDefaultValue } from "@utils"

import classnames from "classnames";

import { useTranslation } from "react-i18next";

import { X } from "react-feather";

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
    Container,
    Spinner
} from "reactstrap";

import { validate } from "@utils"

import { validateSchema } from '../validateSchema';


const Createmodal = ({ open, handleModal, refreshDatas, edit_id }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { control, handleSubmit, reset,  setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    const { school_id } = useContext(SchoolContext)
    const { t } = useTranslation()

    // states
    const [is_loading, setLoader] = useState(false)
    const { cyear_name, cseason_id } =useContext(ActiveYearContext)
    const [school_checked, setSchoolChecked] = useState(false)


    const [ schoolOption, setSchoolOption] = useState([]);
    const [ studentOption, setStudentOption] = useState([]);
    const [ studentInfo, setStudentInfo ] = useState({})

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const studentApi = useApi().student
    const schoolApi = useApi().hrms.subschool
    const studentmovementApi = useApi().student.movement

    const { isLoading: studentLoading, fetchData: fetchStudent } = useLoader({});

    const [bottom_check, setBottomCheck] = useState(3)
    const [scroll_bottom_datas, setScrollBottomDatas] = useState([]);
    const [student_search_value, setStudentSearchValue] = useState([]);

    const SelectStudentApi = useApi().role.student


    useEffect(()=>{
        getSchoolOption()
        getSelectBottomDatas(2)
    },[])

    // Сургуулийн жагсаалт
    async function getSchoolOption() {
        setLoader(true)
        const { success, data } = await fetchData(schoolApi.get('student', 'is_org'))
        if(success) {
            setLoader(false)
            setSchoolOption(data)
        }
    }

    //  Оюутны жагсаалт хайлтаар
    async function getStudentOption(searchValue) {
        const { success, data } = await fetchStudent(SelectStudentApi.getStudent(searchValue))
        if(success) {
            setStudentOption(data)
        }
    }

    //  Оюутны жагсаалт select ашигласан
    async function getSelectBottomDatas(state){
        const { success, data } = await fetchStudent(studentApi.getList(state))
        if(success){
            setScrollBottomDatas((prev) => [...prev, ...data])
        }
    }

    function handleStudentSelect(value){
        getStudentOption(value)
    }

    async function onSubmit(cdata) {
        cdata['is_internal'] = school_checked
        cdata['school'] = school_id
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id

        if (edit_id) {
            if (!school_checked) {
                cdata['destination_school'] = ''
            }

            cdata['student'] = studentInfo?.student.id
            cdata = convertDefaultValue(cdata)
            const { success, errors } = await fetchData(studentmovementApi.put(cdata, studentInfo.id))

            if (success) {
                reset()
                handleModal()
                refreshDatas()

            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (const key in errors) {
                    setError(key, { type: 'custom', message: errors[key].join() });
                }
            }

        } else {
            const response = await fetchData(studentmovementApi.post(cdata))
            const { success, errors } = response

            if (success) {
                reset()
                handleModal()
                refreshDatas()

            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (const key in errors) {
                    setError(key, { type: 'custom', message: errors[key].join() });
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[open, edit_id, schoolOption])

    async function getDatas() {
        if(edit_id) {
            const { success, data } = await fetchData(studentmovementApi.getOne(edit_id))
            if(success) {
                setStudentInfo(data)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else
                        setValue(key,'')
                    if(key === 'student') {
                        setValue(key, data.full_name)
                    }
                    if(key === 'is_internal') {
                        setSchoolChecked(data[key])
                    }
                }
            }
        }
    }

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-lg'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                {edit_id?
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                    >
                <h4>{t('Шилжилт хөдөлгөөн засах')}</h4>
                </ModalHeader>
                :
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                    >
                <h4>{t('Шилжилт хөдөлгөөн бүртгэх')}</h4>
                </ModalHeader>
                }
                <ModalBody className="flex-grow-1">
                    {
                        is_loading &&
                            <div className='suspense-loader'>
                                <Spinner size='bg'/>
                                <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                            </div>
                    }
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        {
                        edit_id ?
                            <Col md={12}>
                                <Label className="form-label" for="student">
                                    {t('Оюутны мэдээлэл')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="student"
                                    name="student"
                                    render={({ field }) => (
                                        <Input
                                            id ="student"
                                            bsSize="sm"
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            disabled={edit_id}
                                            {...field}
                                            type="text"
                                            invalid={errors.student && true}
                                        />
                                    )}
                                />
                                {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                            </Col>
                        :
                            <Col md={12}>
                                <Label className="form-label" for="student">
                                    {t('Оюутны мэдээлэл')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="student"
                                    render={({ field: {value, onChange } }) => {
                                        return (
                                            <Select
                                                name="student"
                                                id="student"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', {'is-invalid': errors.student})}
                                                placeholder={`Хайх`}
                                                isLoading={studentLoading}
                                                loadingMessage={() => "Түр хүлээнэ үү..."}
                                                options={
                                                    student_search_value.length === 0
                                                        ? scroll_bottom_datas || []
                                                        : studentOption || []
                                                }
                                                value={
                                                    student_search_value.length === 0
                                                        ? scroll_bottom_datas.find((c) => c.id === value)
                                                        : studentOption.find((c) => c.id === value)
                                                }
                                                noOptionsMessage={() =>
                                                    student_search_value.length > 1
                                                        ? t('Хоосон байна')
                                                        : null
                                                }
                                                onMenuScrollToBottom={() => {
                                                    if(student_search_value.length === 0){
                                                        setBottomCheck(bottom_check + 1)
                                                        getSelectBottomDatas(bottom_check)
                                                    }
                                                }}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                onInputChange={(e) => {
                                                    setStudentSearchValue(e);
                                                    if(e.length > 1 && e !== student_search_value){
                                                        handleStudentSelect(e);
                                                    } else if (e.length === 0){
                                                        setStudentOption([]);
                                                    }
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.full_name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.student && <FormFeedback className='d-block'>{errors.student.message}</FormFeedback>}
                            </Col>
                        }
                        {/* <Col md={12}>
                            <Label className="form-label" for="statement">
                                {t('Тушаал')}
                            </Label>
                            <Controller
                            defaultValue=''
                            control={control}
                            id="statement"
                            name="statement"
                            render={({ field }) => (
                                <Input
                                    id ="statement"
                                    bsSize="sm"
                                    placeholder={t('Тушаалын дугаар оруулна уу...')}
                                    {...field}
                                    type="text"
                                    invalid={errors.statement && true}
                                />
                            )}
                        />
                        {errors.statement && <FormFeedback className='d-block'>{t(errors.statement.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="statement_date">
                                {t('Тушаалын огноо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='statement_date'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        bsSize='sm'
                                        id='statement_date'
                                        placeholder='Сонгох'
                                        type="date"
                                        invalid={errors.statement_date && true}
                                    />
                                )}
                            />
                            {errors.statement_date && <FormFeedback className='d-block'>{t(errors.statement_date.message)}</FormFeedback>}
                        </Col> */}
                        <Col md={12}>
                            <Label className="form-label" for="description">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                            defaultValue=''
                            control={control}
                            id="description"
                            name="description"
                            render={({ field }) => (
                                <Input
                                    id ="description"
                                    bsSize="sm"
                                    placeholder={t('Тайлбараа бичнэ үү...')}
                                    {...field}
                                    type="text"
                                    invalid={errors.description && true}
                                />
                            )}
                        />
                        {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                control={control}
                                id="is_internal"
                                name="is_internal"
                                defaultValue={school_checked}
                                render={({ field: { value, onChange, checked } }) => (
                                    <Input
                                        className='me-50'
                                        // {...field}
                                        id="is_internal"
                                        type="checkbox"
                                        onChange={(e) =>
                                            {
                                                onChange(e.target.checked)
                                                setSchoolChecked(e.target.checked)
                                            }
                                        }
                                        checked={school_checked}
                                        value={school_checked}
                                    />
                                )}
                            />
                            <Label className="form-label pe-1" for="is_internal">
								{t('Сургууль дотор шилжих эсэх')}
                            </Label>
                        </Col>
                        {
                            school_checked &&
                                <Container>
                                    <Col md={12} className='mt-1'>
                                        <Label className="form-label " for="destination_school">
                                            {t('Сургууль')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue={studentInfo.school_dep?.school_id}
                                            name="destination_school"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="destination_school"
                                                        id="destination_school"
                                                        classNamePrefix='select'
                                                        isClearable={true}
                                                        className={classnames('react-select', { 'is-invalid': errors.destination_school })}
                                                        isLoading={isLoading}
                                                        placeholder={t(`Та салбар сургуулиа сонгоно уу`)}
                                                        options={schoolOption || []}
                                                        value={value && schoolOption.find((val) => val.id === value)}
                                                        noOptionsMessage={() => t('Хоосон байна')}
                                                        onChange={(val) => {
                                                            onChange(val?.id || '')
                                                        }}
                                                        styles={ReactSelectStyles}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => option.name}
                                                    />
                                                )
                                            }}
                                        ></Controller>
                                        {errors.destination_school && <FormFeedback className='d-block'>{errors.destination_school.message}</FormFeedback>}
                                    </Col>
                                    <Col md={12}>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            name="statement"
                                            render={({ field }) => (
                                                <>
                                                    <Label className="form-label" for={field.name}>
                                                        {t('Тушаал')}
                                                    </Label>
                                                    <Input
                                                        {...field}
                                                        id={field.name}
                                                        bsSize="sm"
                                                        placeholder={t('Тушаал')}
                                                        type="text"
                                                        invalid={errors[field.name] && true}
                                                    />
                                                    {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                                </>
                                            )}
                                        />
                                    </Col>
                                    <Col md={12}>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            name="statement_date"
                                            render={({ field }) => (
                                                <>
                                                    <Label className="form-label" for={field.name}>
                                                        {t('Тушаалын огноо')}
                                                    </Label>
                                                    <Input
                                                        {...field}
                                                        id={field.name}
                                                        bsSize="sm"
                                                        placeholder={t('Тушаалын огноо')}
                                                        type="date"
                                                        invalid={errors[field.name] && true}
                                                    />
                                                    {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                                </>
                                            )}
                                        />
                                    </Col>
                                </Container>
                        }
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Createmodal;
