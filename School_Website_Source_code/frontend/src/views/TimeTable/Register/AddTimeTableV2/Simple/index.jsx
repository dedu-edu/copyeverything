// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from '@context/ActiveYearContext'

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Label,
    Input,
	Button,
    Spinner,
	FormFeedback,
    Card,
    CardHeader,
    CardBody,
} from "reactstrap";

import { get_day, get_time, ReactSelectStyles, get_lesson_type, get_potok, get_oddeven_type, convertDefaultValue, validate } from "@utils"

import { useTranslation } from 'react-i18next';

import CTable from '../../Table';
import { validateSchema } from './validateSchema';
import { get_week } from '@src/utility/Utils';
import ScrollSelectFilter from '@src/components/ScrollSelectFilter';

const Simple = ({ handleRoomModal, editValues, handleModal, roomModal, is_loading, setLoader, refreshDatas }) => {

    var values = {
        lesson: '',
        teacher: '',
        potok: '',
    }

    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)
    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, watch, setError, clearErrors, setValue, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { Loader: groupLoader, isLoading: groupLoading, fetchData: groupFetchData } = useLoader({});

    const defaultOddEven = 3

    const [select_value, setSelectValue] = useState(values);
    const [tdata, setTimeData] = useState([])
    const [lesson_name, setLesson] = useState('')

    const [studyType, setStudyType] = useState(1)
    const [colorName, setColorName] = useState('#eeeeee')
    const [oddEvenOption, setOddEvenOption] =useState([])
    const [teacherOption, setTeacher] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [potokOption, setPotokOption] = useState([])
    const [timeOption, setTime] = useState([])
    const [dayOption, setDay] = useState([])
    const [groupOption, setGroup] = useState([])
    const [typeOption, setType] =useState([])
    const [studentOption, setStudent] =useState([])
    const [excludeStudentsOption, setExcludeStudent] = useState([])
    const [onlineOption, setOnlineOption] = useState([])

    const [selectedGroups, setSelectedGroups] = useState([])
    const [roomOption, setRoom] = useState([])

    // Api
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const groupApi = useApi().student.group
    const timetableApi = useApi().timetable.register
    const studentApi = useApi().student
    const roomApi = useApi().timetable.room
    const subGroupApi = useApi().student.subGroup
    const levelGroupApi = useApi().student.levelGroup

    // Өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList())
        if(success) {
            setRoom(data)
        }
    }

    useEffect(
        () =>
        {
            getRoom()
        },
        [roomModal]
    )

    // Багшийн жагсаалт
    async function getTeacher() {
        const { success, data } = await fetchData(teacherApi.getTeacher(select_value.lesson))
        if(success) {
            setTeacher(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await groupFetchData(groupApi.getTimetableList(select_value.lesson))
        if(success) {
            setGroup(data)
        }
    }

    // Шивэгдсэн хичээлийн хуваарь
    async function getTimeTableData() {
        const { success, data } = await fetchData(timetableApi.getPotok(select_value.lesson, select_value.potok))
        if (success) {
            setTimeData(data)
        }
    }

    function selectChange(value, stype) {
        setSelectValue(current => {
            return {
                ...current,
                [stype]: value,
            }
        })
    }

    function getAll() {
        Promise.all(
            [
                fetchData(fetchData(lessonApi.getTimetableList())),
            ]
        ).then((values) => {
            setLessonOption(values[0]?.data)
        })
    }

    useEffect(() => {
        getAll()
        setOnlineOption(get_lesson_type())
        setOddEvenOption(get_oddeven_type())
        setPotokOption(get_potok())
        setTime(get_time())
        setDay(get_day())
    },[])

    useEffect(() => {
        setValue('day', editValues?.day),
        setValue('lesson', editValues?.lesson),
        setValue('time', editValues?.time),
        // setValue('group', editValues?.group)
        setValue('teacher', editValues?.teacher)
        setSelectValue(current => {
            return {
                ...current,
                lesson: editValues?.lesson,
            }
        })
    }, [editValues])

    // Тухайн хичээлийн багц цагийн задаргаанаас хичээлийн төрөл авах хэсэг
    async function getLessonType() {
        const { success, data } = await fetchData(lessonApi.getType(select_value.lesson))
        if(success)
        {
            if(data.length == 0) {
                setError('type', { type: 'custom', message: 'Багц цагийн тохиргоогоо оруулна уу'})
            } else {
                setType(data)
                clearErrors('type')

            }
        }
    }

    function getStudents() {

        var group_ids = []
        if (selectedGroups) {
            selectedGroups.forEach(element => {
                if (element) group_ids.push(element?.id)
            })
        }

        Promise.all(
            [
                groupFetchData(studentApi.getGroup(group_ids, true)),
                groupFetchData(studentApi.getRemoveGroup(group_ids, false))
            ]
        ).then((values) => {
            setStudent(values[0]?.data)
            setExcludeStudent(values[1]?.data)
        })
    }

    useEffect(
        () =>
        {
            if(selectedGroups.length > 0) {
                const timeoutId = setTimeout(() => {
                    getStudents();
                }, 1000);

                return () => clearTimeout(timeoutId);
            }
        },
        [selectedGroups]
    )

    useEffect(
        () =>
        {
            if (select_value.potok) {
                getTimeTableData()
            }
            if (select_value?.lesson) {
                getLessonType()
                getGroup()
            } else {
                setType([])
                setGroup([])
            }
        },
        [select_value.lesson]
    )

    useEffect(
        () =>
        {
            getTeacher()
        },
        [select_value?.lesson]
    )

    async function onSubmit(cdata) {
        cdata['is_simple'] = true
        cdata['color'] = colorName
        cdata['school'] = school_id || ''
        cdata.sub_group = cdata.sub_group ? cdata.sub_group.map(item => item.id) : []
        cdata.level_group = cdata.level_group ? cdata.level_group.map(item => item.id) : []

        cdata = convertDefaultValue(cdata)

        console.log('cdata simple', cdata)

        const { success, error } = await fetchData(timetableApi.postSchedule(cdata, 'is_simple'))
        if(success) {
            // handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    // Өнгө onchange
    const handleColorChange = (e) => {
        setColorName(e.target.value)
    }

	return (
        <Fragment>
            <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                <div className='mt-1'>
                    <Row className='mb-1'>
                        <Col md={3} sm={12}>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={''}
                                name="lesson"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson"
                                            id="lesson"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={lessonOption || []}
                                            value={value ? lessonOption.find((c) => c.id == value) : ''}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setValue("type", "")
                                                setValue("teacher", "")
                                                selectChange(val?.id || '', 'lesson')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                )}}
                            />
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={3} sm={12} >
                            <Label for="study_type">
                                {t('Хичээл орох хэлбэр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={studyType}
                                name="study_type"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="study_type"
                                            id="study_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.study_type })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={onlineOption || []}
                                            value={value ? onlineOption?.find((c) => c.id === value) : ""}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setStudyType(val?.id || "")
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                        </Col>
                        {/* <Col md={3} sm={12}>
                            <Label className="form-label" for="potok">
                                {t('Потокийн дугаар')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="potok"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="potok"
                                            id="potok"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.potok })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={potokOption || []}
                                            value={potokOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                selectChange(val?.id || '', 'potok')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.potok && <FormFeedback className='d-block'>{t(errors.potok.message)}</FormFeedback>}
                        </Col> */}
                        <Col md={3} sm={12}>
                            <Label className="form-label" for="teacher">
                                {t("Багш")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="teacher"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="teacher"
                                            id="teacher"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={teacherOption || []}
                                            value={value ? teacherOption.find((c) => c.id === value) : ""}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                selectChange(val?.id || '', 'teacher')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            />
                            {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                        </Col>
                        <Col md={3} sm={12}>
                            <Label className="form-label" for="type">
                                {t('Хичээлийн хэлбэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='type'
                                name='type'
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="type"
                                            id="type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.type })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={typeOption || []}
                                            value={value ? typeOption?.find((c) => c.id === value) : ""}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
                        </Col>
                    </Row>
                </div>
                {
                    (select_value.potok && tdata.length > 0 && select_value.lesson)
                    &&
                        <div>
                            <hr/>
                            <Card className='mb-0'>
                                <CardHeader>
                                    <h5>{`${lesson_name} хичээлийн Поток ${select_value.potok}-д шивэгдсэн хуваарь `}</h5>
                                </CardHeader>
                                <CardBody>
                                    <CTable datas={tdata}/>
                                </CardBody>
                            </Card>
                            <hr className='mt-0'/>
                        </div>
                }
                <Col md={3} sm={12}>
                    <Label className="form-label" for="odd_even">
                        {t('Хичээллэх 7 хоногийн төрөл')}
                    </Label>
                    <Controller
                        control={control}
                        defaultValue={defaultOddEven}
                        name="odd_even"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="odd_even"
                                    id="odd_even"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select', { 'is-invalid': errors.odd_even })}
                                    isLoading={isLoading}
                                    placeholder={t(`-- Сонгоно уу --`)}
                                    options={oddEvenOption || []}
                                    value={oddEvenOption.find((c) => c.id === (value || defaultOddEven))}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                    }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                                />
                            )
                        }}
                    />
                    {errors.odd_even && <FormFeedback className='d-block'>{t(errors.odd_even.message)}</FormFeedback>}
                </Col>
                <Col md={3} sm={12}>
                    <Label className="form-label" for="begin_week">
                        {t('Эхлэх 7 хоног')}
                    </Label>
                    <Controller
                        control={control}
                        defaultValue={1}
                        name="begin_week"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="begin_week"
                                    id="begin_week"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select', { 'is-invalid': errors.begin_week })}
                                    isLoading={isLoading}
                                    placeholder={t(`-- Сонгоно уу --`)}
                                    options={get_week() || []}
                                    value={value ? get_week().find((c) => c.id === value) : ""}
                                    noOptionsMessage={() => t('Хоосон байна.')}
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
                    {errors.begin_week && <FormFeedback className='d-block'>{t(errors.begin_week.message)}</FormFeedback>}
                </Col>
                <Col md={3} sm={12}>
                    <Label className="form-label" for="end_week">
                        {t('Дуусах 7 хоног')}
                    </Label>
                    <Controller
                        control={control}
                        defaultValue={16}
                        name="end_week"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="end_week"
                                    id="end_week"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select', { 'is-invalid': errors.end_week })}
                                    isLoading={isLoading}
                                    placeholder={t(`-- Сонгоно уу --`)}
                                    options={get_week() || []}
                                    value={value ? get_week().find((c) => c.id === value) : ""}
                                    noOptionsMessage={() => t('Хоосон байна.')}
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
                    {errors.end_week && <FormFeedback className='d-block'>{t(errors.end_week.message)}</FormFeedback>}
                </Col>
                <Col md={3} sm={12}>
                    <Label for="color" onClick={() => setIsColor(!isColor)}>
                        {t('Өнгө')}
                    </Label>
                    <div className='d-flex justify-content-between'>
                        <Input
                            id='color'
                            type='color'
                            bsSize='sm'
                            value={colorName}
                            onChange={handleColorChange}
                        />
                        <Input
                            id='color'
                            type='text'
                            bsSize='sm'
                            className='ms-1'
                            value={colorName}
                            onChange={handleColorChange}
                        />
                    </div>
                </Col>
                <Col md={5}  sm={12}>
                    <Label className="form-label" for="room">
                        {t('Өрөө')}
                    </Label>
                    <Controller
                        control={control}
                        defaultValue=''
                        name="room"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <>
                                    <Select
                                        name="room"
                                        id="room"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.room })}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={roomOption || []}
                                        value={value ? roomOption.find((c) => c.id === value) : ""}
                                        noOptionsMessage={() => {
                                            return (
                                                <a role='button' className="link-primary" onClick={handleRoomModal}>
                                                    {t('Өрөө шинээр үүсгэх')}
                                                </a>
                                            )
                                        }}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.full_name}
                                    />
                                </>
                            )
                        }}
                    />
                    {errors.room && <FormFeedback className='d-block'>{t(errors.room.message)}</FormFeedback>}
                </Col>
                <Col md={4} sm={12}>
                    <Label className="form-label" for="day">
                        {t('Өдөр')}
                    </Label>
                    <Controller
                        control={control}
                        defaultValue=""
                        name="day"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="day"
                                    id="day"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select', { 'is-invalid': errors.day })}
                                    isLoading={isLoading}
                                    placeholder={t(`-- Сонгоно уу --`)}
                                    options={dayOption || []}
                                    value={value ? dayOption.find((c) => c.id === value) : ""}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                    }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                                />
                            )
                        }}
                    />
                    {errors.day && <FormFeedback className='d-block'>{t(errors.day.message)}</FormFeedback>}
                </Col>
                <Col md={3} sm={12}>
                    <Label className="form-label" for="time">
                        {t('Цаг')}
                    </Label>
                    <Controller
                        control={control}
                        defaultValue=""
                        name="time"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="time"
                                    id="time"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select', { 'is-invalid': errors.time })}
                                    isLoading={isLoading}
                                    placeholder={t(`-- Сонгоно уу --`)}
                                    options={timeOption || []}
                                    value={value ? timeOption.find((c) => c.id === value) : ""}
                                    noOptionsMessage={() => t('Хоосон байна.')}
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
                    {errors.time && <FormFeedback className='d-block'>{t(errors.time.message)}</FormFeedback>}
                </Col>
                {/* <Col className='d-flex align-items-center justify-content-start ms-0 mt-1' md={6} sm={12} >
                    <Input
                        id="is_optional"
                        className="dataTable-check mb-50 me-1"
                        type="checkbox"
                        bsSize="sm-5"
                        onChange={(e) => handleCheck(e)}
                        checked={checked}
                    />
                    <Label className="checkbox-wrapper" for="is_optional">
                        {t('Сонгон хичээл')}
                    </Label>
                </Col> */}
                <Col className='d-flex align-items-center justify-content-start ms-0 mt-1' md={6} sm={12} >
                    <Controller
                        control={control}
                        id="is_optional"
                        name="is_optional"
                        defaultValue={false}
                        render={({ field }) => {
                            return (
                                <Input
                                    {...field}
                                    className='me-50'
                                    id="is_optional"
                                    type="checkbox"
                                    checked={field.value}
                                />
                            )
                        }}
                    />
                    <Label className="form-label pe-1" for="is_optional">
                        {t('Сонгон хичээл')}
                    </Label>
                </Col>
                {/* <Col md={3} xs={12} sm={12}>
                    <Label className="form-label" for="st_count">
                        {t('Суралцагчийн тоо')}
                    </Label>
                    <Controller
                        control={control}
                        defaultValue=''
                        name="st_count"
                        render={({ field }) => {
                        return (
                            <Input
                                {...field}
                                name='st_count'
                                id='st_count'
                                type='number'
                                bsSize='sm'
                                invalid={errors.st_count ? true : false}
                                placeholder='Суралцагчийн тоо'
                            />
                        )
                    }}
                    />
                    {errors.st_count && <FormFeedback className='d-block'>{t(errors.st_count.message)}</FormFeedback>}
                </Col> */}
                {
                    !watch("is_optional") &&
                    <>
                        <Col sm={12}>
                            <Label className="form-label" for="group">
                                {t("Анги")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={[]}
                                name="group"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="group"
                                            id="group"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.group })}
                                            isLoading={groupLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={groupOption || []}
                                            value={value ? groupOption.filter((c) => value?.includes(c.id)) : ''}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.map((item) => item?.id) || [])
                                            }}
                                            isMulti
                                            isSearchable={true}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.group && <FormFeedback className='d-block'>{t(errors.group.message)}</FormFeedback>}
                        </Col>
                        {
                            studyType === 3
                            &&
                                <Col sm={12}>
                                    <Label className="form-label" for="addgroup">
                                        {t("Онлайн хичээллэх анги")}
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="addgroup"
                                        render={({ field: { value, onChange} }) => {
                                            return (
                                                <Select
                                                    name="addgroup"
                                                    id="addgroup"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.addgroup })}
                                                    isLoading={groupLoading}
                                                    placeholder={t(`-- Сонгоно уу --`)}
                                                    options={groupOption || []}
                                                    value={value ? groupOption.filter((c) => value?.includes(c.id)) : ''}
                                                    noOptionsMessage={() => t('Хоосон байна.')}
                                                    onChange={(val) => {
                                                        onChange(val?.map((item) => item?.id) || [])
                                                    }}
                                                    isMulti
                                                    isSearchable={true}
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => option.name}
                                                />
                                            )
                                        }}
                                    ></Controller>
                                    {errors.addgroup && <FormFeedback className='d-block'>{t(errors.addgroup.message)}</FormFeedback>}
                                </Col>
                        }
                        {/* <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="students">
                                {t("Нэмэлтээр судалж буй оюутан")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="students"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="students"
                                            id="students"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.students })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={studentOption || []}
                                            value={value ? studentOption.filter((c) => value?.includes(c.id)) : ''}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.map((item) => item?.id) || [])
                                            }}
                                            isMulti
                                            isSearchable={true}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option?.id}
                                            getOptionLabel={(option) => option?.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.students && <FormFeedback className='d-block'>{t(errors.students.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="remove_students">
                                {t("Хасалт хийгдэж буй оюутан")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="remove_students"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="remove_students"
                                            id="remove_students"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.remove_students })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={excludeStudentsOption || []}
                                            value={value ? excludeStudentsOption.filter((c) => value?.includes(c.id)) : ''}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.map((item) => item?.id) || [])
                                            }}
                                            isMulti
                                            isSearchable={true}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option?.id}
                                            getOptionLabel={(option) => option?.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.remove_students && <FormFeedback className='d-block'>{errors.remove_students.message}</FormFeedback>}
                        </Col> */}
                        <Col sm={12}>
                            <Controller
                                defaultValue={[]}
                                control={control}
                                name='sub_group'
                                render={({ field }) => {
                                    return (
                                        <>
                                            <Label className='form-label' for={field.name}>
                                                {t('Дэд бүлэг')}
                                            </Label>
                                            <ScrollSelectFilter
                                                {...field}
                                                getApi={(page, search, limit) => subGroupApi.get(limit, page, '', search)}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                                isMulti
                                            />
                                            {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                        </>
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col sm={12}>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='level_group'
                                render={({ field }) => {
                                    return (
                                        <>
                                            <Label className='form-label' for={field.name}>
                                                {t('Түвшин бүлэг')}
                                            </Label>
                                            <ScrollSelectFilter
                                                {...field}
                                                getApi={(page, search, limit) => levelGroupApi.get(limit, page, '', search)}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                                isMulti
                                            />
                                            {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                        </>
                                    )
                                }}
                            ></Controller>
                        </Col>
                    </>
                }
                <Col md={12} sm={12} className="mt-2 d-flex justify-content-start mb-0">
                    <Button color="primary" type="submit" disabled={is_loading}>
                        {is_loading && <i className={`fas fa-spinner-third fa-spin me-2`}></i>}
                        {t('Хадгалах')}
                    </Button>
                    <Button className='ms-1' color="secondary" type="reset" outline  onClick={handleModal}>
                        {t("Буцах")}
                    </Button>
                </Col>
            </Row>
        </Fragment>
	);
};
export default Simple;
