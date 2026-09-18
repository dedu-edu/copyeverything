// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { X } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
    Form,
    Modal,
    Label,
    Input,
    Button,
    Spinner,
    ModalBody,
    ModalHeader,
    FormFeedback,
} from "reactstrap";

import { validateSchema } from './validateSchema';

import { get_day, get_time, ReactSelectStyles, get_lesson_type, get_week, get_oddeven_type, convertDefaultValue, validate } from "@utils"

import { useTranslation } from 'react-i18next';

import useModal from "@hooks/useModal";

import useUpdateEffect from '@src/utility/hooks/useUpdateEffect';
import ScrollSelectFilter from '@src/components/ScrollSelectFilter';

const EditModal = ({ open, handleModal, editDatas, refreshDatas }) => {
    var values = {
        lesson: '',
        teacher: '',
        potok: '',
    }

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { showWarning } = useModal()

    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, reset, setError, clearErrors, watch, setValue, formState: { errors } } = useForm(validate(validateSchema));

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({});

    const [roomModal, setRoomModal] = useState(false)
    const [timeTableId, setTimeTableId] = useState('')
    const [is_disabled, setDisabled] = useState(false)
    const [datas, setDatas] = useState({})

    const [radioName, setRadio] = useState('simple')

    const [colorName, setColorName] = useState('#eeeeee')
    const [is_loading, setLoader] = useState(false)
    const [beginWeekOption, setBeginWeek] = useState(get_week())
    const [oddEvenOption, setOddEvenOption] = useState(get_oddeven_type())
    const [endWeekOption, setEndWeek] = useState(get_week())
    const [lessonOption, setLessonOption] = useState([])
    const [timeOption, setTime] = useState(get_time())
    const [dayOption, setDay] = useState(get_day())
    const [groupOption, setGroup] = useState([])
    const [roomOption, setRoom] = useState([])
    const [typeOption, setType] = useState([])
    const [studentOption, setStudent] = useState([])
    const [excludeStudentsOption, setExcludeStudent] = useState([])
    const [onlineOption, setOnlineOption] = useState(get_lesson_type())

    const [selectedGroups, setSelectedGroups] = useState([])
    const [selectedAddGroups, setSelectedAddGroups] = useState([])
    const [selectedGroupStudent, setSelectedGroupStudent] = useState([])
    const [removeStudents, setRemoveStudent] = useState([])
    const [selectedTimes, setSelectedTimes] = useState([])

    const [teacherOption, setTeacher] = useState([])

    const [checked, setOnlyCheck] = useState(false)

    const studyType = (watch("study_type") || 2)
    const lessonId = watch("lesson") || ""

    // Api
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const groupApi = useApi().student.group
    const timetableApi = useApi().timetable.register
    const roomApi = useApi().timetable.room
    const studentApi = useApi().student
    const subGroupApi = useApi().student.subGroup
    const levelGroupApi = useApi().student.levelGroup

    // Багшийн жагсаалт
    async function getTeacher() {
        const { success, data } = await fetchData(teacherApi.getTeacher(lessonId))
        if(success) {
            setTeacher(data)
        }
    }

    useEffect(() => {
        getTeacher()
    }, [lessonId])

    // Хичээлийн жагсаалт
    async function getLesson() {
        const { success, data } = await fetchData(lessonApi.getListAll())
        if (success) {
            setLessonOption(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroupDatas() {
        const { success, data } = await fetchData(groupApi.getTimetableList())
        if (success) {
            setGroup(data)
        }
    }

    async function getOneData() {
        if (!editDatas.event_id) return
        const { success, data } = await fetchData(timetableApi.getOne(editDatas?.event_id))
        if (success) {
            setDatas(data)
            if (data && Object.keys(data)?.length > 0) {
                for (let key in data) {
                    if (data[key] !== null) {
                        if (key === 'is_kurats' && data[key]) {
                            setRadio('kurats')
                            setValue(key, data[key])
                        }

                        if (key === 'room' || key === 'teacher' || key === 'lesson') {
                            setValue(key, data[key]?.id)
                        }
                        else setValue(key, data[key])

                    } else setValue(key, '')

                    if (key === 'event_id') {
                        setTimeTableId(data[key])
                    }

                    if (key === 'color') {
                        setColorName(data[key])
                    }

                    if (key === 'group_list') {
                        setValue('group', data[key])
                        setSelectedGroups(data[key])
                    }

                    if (key === 'online_group_list') {
                        setValue("addgroup", data[key])
                        setSelectedAddGroups(data[key])
                    }
                }
            }
        }
    }

    // Курац хуваарийн хичээллэх цагууд
    function timeSelect(data) {
        setSelectedTimes(data);
    }

    // Өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList())
        if (success) {
            setRoom(data)
        }
    }

    // Нэмэлтээр сонгох оюутны жагсаалт
    const getStudent = async () => {
        var group_ids = []
        if (selectedGroups) {
            selectedGroups.forEach(element => {
                if (element) group_ids.push(element?.id)
            })
        }

        const { success, data } = await fetchData(studentApi.getGroup(group_ids, true))
        if (success) {
            setStudent(data)
            var student_ids = []
            datas?.student_add_list?.map((student, idx) => {
                var selected = data.find((e) => e.id === student?.id)
                student_ids.push(selected)

                setSelectedGroupStudent(student_ids)
            })
        }
    }

    // Хасах оюутны жагсаалт
    const getExcludeStudent = async () => {
        var group_ids = []
        if (selectedGroups) {
            selectedGroups.forEach(element => {
                if (element) group_ids.push(element?.id)
            })
        }

        const { success, data } = await fetchData(studentApi.getRemoveGroup(group_ids, false))
        if (success) {
            setExcludeStudent(data)
            var student_ids = []
            datas?.student_rm_list?.map((student, idx) => {
                var selected = data.find((e) => e.id === student?.id)
                student_ids.push(selected)
                setRemoveStudent(student_ids)
            })
        }

    }

    useEffect(() => {
        getRoom()
        getLesson()
        getGroupDatas()
    }, [])

    // Хичээл үзэх анги
    function groupSelect(data) {
        setSelectedGroups(data);
    }

    // Хосолсон ангийн онлайнаар хичээл үзэх анги
    function groupAddSelect(data) {
        setSelectedAddGroups(data);
    }

    // Нэмэлтээр үзэх гэж байгаа оюутнууд
    function studentSelect(data) {
        setSelectedGroupStudent(data);
    }

    // Хасалт хийлгэж байгаа оюутнууд
    function excludeSelect(data) {
        setRemoveStudent(data);
    }

    // Тухайн хичээлийн багц цагийн задаргаанаас хичээлийн төрөл авах хэсэг
    async function getLessonType() {
        const { success, data } = await fetchData(lessonApi.getType(lessonId))
        if (success) {
            setType(data)
        }
    }

    useEffect(() => {
        getOneData()
    }, [editDatas])

    useUpdateEffect(
        () => {
            if (lessonId) {
                getLessonType()
            }
        },
        [lessonId]
    )

    async function onSubmit(cdata) {
        if (!checked && !cdata?.group && !cdata?.sub_group && !cdata?.level_group) {
            setError('group', { type: 'custom', message: 'Хоосон байна' })
        }
        if (Object.keys(errors).length === 0) {
            setLoader(true)

            cdata['group'] = !checked ? cdata?.group?.map((item) => item?.id) : []
            cdata['addgroup'] = !checked ? cdata?.addgroup?.map((item) => item?.id) : []
            cdata['students'] = !checked ? cdata?.students?.map((item) => item?.id) : []
            cdata['remove_students'] = !checked ? cdata?.remove_students?.map((item) => item?.id) : []

            cdata.sub_group = cdata.sub_group?.map(item => item.id) || []
            cdata.level_group = cdata.level_group?.map(item => item.id) || []

            cdata['color'] = colorName

            cdata = convertDefaultValue(cdata)
            const { success, error } = await fetchData(timetableApi.putSchedule(cdata, timeTableId))
            if (success) {
                reset()
                handleModal()
                refreshDatas(radioName == 'kurats')
            } else {
                setLoader(false)
                // /** Алдааны мессэжийг input дээр харуулна */
                // for (let key in error) {
                //     setError(error[key].field, { type: 'custom', message: error[key].msg });
                // }
            }
            setLoader(false)
        }
    }

    const handleRoomModal = () => {
        setRoomModal(!roomModal)
    }

    // Өнгө onchange
    const handleColorChange = (e) => {
        setColorName(e.target.value)
    }

    async function handleDeleteEvent() {
        const { success, error } = await fetchData(timetableApi.delete(timeTableId))
        if (success) {
            refreshDatas(radioName == 'kurats')
            handleModal()
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-xl custom-80'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                fullscreen='xl'
            >
                <ModalHeader
                    className="mb-1"
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t("Хичээлийн хуваарь засах")}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    {
                        is_loading &&
                        <div className='suspense-loader'>
                            <Spinner size='bg' />
                            <span className='ms-50'>{t("Түр хүлээнэ үү...")}</span>
                        </div>
                    }
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={3} sm={6}>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="lesson"
                                            id="lesson"
                                            classNamePrefix='select'
                                            isDisabled
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={lessonOption || []}
                                            value={lessonOption.find((c) => c.id == value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            />
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={3} sm={6}>
                            <Label className="form-label" for="type">
                                {t('Хичээлийн хэлбэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='type'
                                name='type'
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="type"
                                            id="type"
                                            classNamePrefix='select'
                                            isClearable
                                            isDisabled={is_disabled}
                                            className={classnames('react-select', { 'is-invalid': errors.type })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={typeOption || []}
                                            value={typeOption.find((c) => c.id === value)}
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
                        <Col md={3} sm={6}>
                            <Label for="study_type">
                                {t('Хичээл орох хэлбэр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="study_type"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="study_type"
                                            id="study_type"
                                            classNamePrefix='select'
                                            isDisabled={is_disabled}
                                            className={classnames('react-select', { 'is-invalid': errors.study_type })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={onlineOption || []}
                                            value={onlineOption.find((c) => c.id === value)}
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
                        </Col>
                        <Col md={3} sm={6}>
                            <Label for="color" onClick={() => setIsColor(!isColor)}>
                                {t('Өнгө')}
                            </Label>
                            <div className='d-flex justify-content-between'>
                                <Input
                                    id='color'
                                    type='color'
                                    bsSize='sm'
                                    disabled={is_disabled}
                                    value={colorName}
                                    onChange={handleColorChange}
                                />
                                <Input
                                    id='color'
                                    type='text'
                                    disabled={is_disabled}
                                    bsSize='sm'
                                    className='ms-1'
                                    value={colorName}
                                    onChange={handleColorChange}
                                />
                            </div>
                        </Col>
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
                                            isDisabled={is_disabled}
                                            className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={teacherOption || []}
                                            value={teacherOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                // selectChange(val?.id || '', 'teacher')
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
                        {
                            radioName == 'kurats'
                            ?
                                <>
                                    <Col md={3} sm={12}>
                                        <Label className="form-label" for="begin_date">
                                            {t('Эхлэх өдөр')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue=''
                                            name="begin_date"
                                            render={({ field }) => {
                                                return (
                                                    <Input
                                                        {...field}
                                                        type='date'
                                                        bsSize='sm'
                                                        isDisabled={is_disabled}
                                                        invalid={errors.begin_date ? true : false}
                                                    />
                                                )
                                            }}
                                        ></Controller>
                                        {errors.begin_date && <FormFeedback className='d-block'>{t(errors.begin_date.message)}</FormFeedback>}
                                    </Col>
                                    <Col md={3} sm={12}>
                                        <Label className="form-label" for="end_date">
                                            {t('Дуусах өдөр')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue=''
                                            name="end_date"
                                            render={({ field }) => {
                                                return (
                                                    <Input
                                                        {...field}
                                                        type='date'
                                                        bsSize='sm'
                                                        invalid={errors.end_date ? true : false}
                                                    />
                                                )
                                            }}
                                        ></Controller>
                                        {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                                    </Col>
                                    <Col md={3} xs={12} sm={12}>
                                        <Label className="form-label" for="kurats_room">
                                            {t('Түр сургалтын хичээл орох байрлал')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue=''
                                            name="kurats_room"
                                            render={({ field }) => {
                                                return (
                                                    <Input
                                                        {...field}
                                                        name='kurats_room'
                                                        id='kurats_room'
                                                        type='text'
                                                        disabled={is_disabled}
                                                        bsSize='sm'
                                                        invalid={errors.kurats_room ? true : false}
                                                        placeholder='Хичээл орох байрлал'
                                                    />
                                                )
                                            }}
                                        />
                                        {errors.kurats_room && <FormFeedback className='d-block'>{t(errors.kurats_room.message)}</FormFeedback>}
                                    </Col>
                                </>
                            :
                                <>
                                    <Col md={3} sm={12}>
                                        <Label className="form-label" for="odd_even">
                                            {t('Хичээллэх 7 хоногийн төрөл')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue=''
                                            name="odd_even"
                                            render={({ field: { value, onChange } }) => {
                                                return (
                                                    <Select
                                                        name="odd_even"
                                                        id="odd_even"
                                                        classNamePrefix='select'
                                                        isClearable
                                                        isDisabled={is_disabled}
                                                        className={classnames('react-select', { 'is-invalid': errors.odd_even })}
                                                        isLoading={isLoading}
                                                        placeholder={t(`-- Сонгоно уу --`)}
                                                        options={oddEvenOption || []}
                                                        value={value ? oddEvenOption.find((c) => c.id === value) : ""}
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
                                            defaultValue=''
                                            name="begin_week"
                                            render={({ field: { value, onChange } }) => {
                                                return (
                                                    <Select
                                                        name="begin_week"
                                                        id="begin_week"
                                                        classNamePrefix='select'
                                                        isClearable
                                                        isDisabled={is_disabled}
                                                        className={classnames('react-select', { 'is-invalid': errors.begin_week })}
                                                        isLoading={isLoading}
                                                        placeholder={t(`-- Сонгоно уу --`)}
                                                        options={beginWeekOption || []}
                                                        value={beginWeekOption.find((c) => c.id === value)}
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
                                            defaultValue=''
                                            name="end_week"
                                            render={({ field: { value, onChange } }) => {
                                                return (
                                                    <Select
                                                        name="end_week"
                                                        id="end_week"
                                                        classNamePrefix='select'
                                                        isClearable
                                                        isDisabled={is_disabled}
                                                        className={classnames('react-select', { 'is-invalid': errors.end_week })}
                                                        isLoading={isLoading}
                                                        placeholder={t(`-- Сонгоно уу --`)}
                                                        options={endWeekOption || []}
                                                        value={endWeekOption.find((c) => c.id === value)}
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
                                </>
                        }
                        <Col md={4} sm={12}>
                            <Label className="form-label" for="room">
                                {t('Өрөө')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="room"
                                render={({ field: { value, onChange } }) => {
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
                                                value={value ? roomOption.find((c) => c.id === value) : ''}
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
                        {
                            !watch("is_kurats") &&
                            <Col md={4} sm={12}>
                                <Label className="form-label" for="day">
                                    {t('Өдөр')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="day"
                                    render={({ field: { value, onChange } }) => {
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
                                                value={value ? dayOption.find((c) => c.id === value) : ''}
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
                        }
                        <Col md={4} sm={12}>
                            <Label className="form-label" for="time">
                                {t('Цаг')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
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
                                            value={value ? timeOption?.find((item) => item?.id === value) : ''}
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
                        {
                            !checked &&
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
                                                    className={classnames('react-select', { 'is-invalid': errors.group })}
                                                    isLoading={isLoading}
                                                    placeholder={t(`-- Сонгоно уу --`)}
                                                    options={groupOption || []}
                                                    value={value || []}
                                                    noOptionsMessage={() => t('Хоосон байна.')}
                                                    onChange={(val) => {
                                                        onChange(val || [])
                                                        setSelectedGroups(val || [])
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
                                                        isLoading={isLoading}
                                                        placeholder={t(`-- Сонгоно уу --`)}
                                                        options={groupOption || []}
                                                        value={value || []}
                                                        noOptionsMessage={() => t('Хоосон байна.')}
                                                        onChange={(val) => {
                                                            onChange(val || [])
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
                                <Col sm={12}>
                                <Controller
                                    defaultValue=''
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
                            <Button color="primary" type="submit" disabled={is_disabled}>
                                {is_loading && <i className={`fas fa-spinner-third fa-spin me-2`}></i>}
                                {t('Хадгалах')}
                            </Button>
                            <Button
                                className='ms-1'
                                color="danger"
                                type="reset"
                                disabled={is_disabled}
                                onClick={() =>
                                    showWarning({
                                        header: {
                                            title: `${t('Хичээлийн хуваарь устгах')}`,
                                        },
                                        question: `Та энэхүү хичээлийн хуваарь устгахдаа итгэлтэй байна уу?`,
                                        onClick: () => handleDeleteEvent(),
                                        btnText: 'Устгах',
                                    })}
                            >
                                {t("Устгах")}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};
export default EditModal;
