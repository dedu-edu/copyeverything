// ** React imports
import classnames from 'classnames'
import { Fragment, useContext, useEffect, useState } from 'react'
import { X } from 'react-feather'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Form,
    FormFeedback,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row,
    Spinner,
    Table
} from 'reactstrap'

import ActiveYearContext from '@context/ActiveYearContext'
import SchoolContext from '@context/SchoolContext'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { challenge_types, convertDefaultValue, examType, get_EXAM_STATUS, ReactSelectStyles, validate } from '@utils'

import { validateSchema } from '../validateSchema'

const AddModal = ({ open, handleModal, refreshDatas, tabId }) => {
    // simple variables. id from examType() util
    const amanExamTypeId = examType().find((item) => item.name === 'Аман шалгалт')?.id

    // contexts
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    // select options
    const [lesson_option, setLessonOption] = useState([])
    const [teacher_option, setTeacherOption] = useState([])
    const [studentOptions, setStudentOptions] = useState([])
    const [room_option, setRoomOption] = useState([])
    const [challengeOption, setChallengeOption] = useState([])

    // selected values
    const [online_checked, setOnlineChecked] = useState(false)
    const [selectedTeachers, setSelectedTeachers] = useState([])

    // selected students
    const [selectedStudent, setSelectedStudent] = useState('')
    const [studentData, setStudentDatas] = useState([])

    // ** Hook
    const { t } = useTranslation()
    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
        setValue,
        watch
    } = useForm(validate(validateSchema))

    const select_value = watch()
    const stypeValue = useWatch({
        control,
        name: 'stype'
    })

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isSmall: true })
    const { isLoading: isLoadingStudent, fetchData: fetchDataStudent } = useLoader({})
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({})

    // Api
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const roomApi = useApi().timetable.room
    const examApi = useApi().timetable.re_exam
    const challengeAPI = useApi().challenge

    // #region direct api call functions
    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getExam())
        if (success) {
            setLessonOption(data)
        }
    }

    // Багшийн жагсаалт
    async function getTeachers() {
        const { success, data } = await fetchData(teacherApi.getTeacher(''))
        if (success) {
            setTeacherOption(data)
        }
    }

    // Test жагсаалт (Challenge model data)
    async function getChallenge() {
        const oralChallengeTypeId = challenge_types().find((item) => item.name === 'Аман шалгалт')?.id

        if (select_value.lesson && oralChallengeTypeId) {
            const { success, data } = await fetchData(
                challengeAPI.get(1, 'Бүгд', select_value.lesson, '', '', '', '', cyear_name, cseason_id, oralChallengeTypeId)
            )
            if (success) setChallengeOption(data.results || [])
        }
    }

    // Өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList(''))
        if (success) {
            setRoomOption(data)
        }
    }

    async function getStudentsFilter(student_search_value) {
        const { success, data } = await fetchDataStudent(challengeAPI.getStudents(student_search_value))
        if (success) {
            setStudentOptions(data)
        }
    }

    async function onSubmit(cdata) {
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['is_online'] = online_checked
        cdata['teacher'] = selectedTeachers?.map((c) => c.id)
        cdata['exams'] = []
        cdata['repeat_count'] = tabId
        cdata['status'] = get_EXAM_STATUS()?.find((item) => item.name == 'Нөхөн шалгалт')?.id

        if (online_checked) {
            cdata['room'] = null
        }
        cdata = convertDefaultValue(cdata)

        cdata['students'] = studentData?.map((c) => c.id)
        cdata['school'] = school_id
        cdata['repeat_count'] = tabId

        const { success, errors } = await postFetch(examApi.post(cdata))
        if (success) {
            handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message: errors[key].join('. ') })
            }
        }
    }

    async function onSubmitStudent() {
        setStudentDatas([...studentData, selectedStudent])
        setSelectedStudent('')
    }
    // #endregion

    // #region not direct api call functions
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

    function handleStudentSelect(e) {
        getStudentsFilter(e)
    }

    function IsOnline(checked) {
        setOnlineChecked(checked)
        if (checked) {
            setValue('room', '')
        }
    }
    // #endregion

    // #region useEffects
    useEffect(() => {
        getRoom()
        getTeachers()
        getLessonOption()
    }, [])

    useEffect(() => {
        getChallenge()
    }, [select_value.lesson])
    // #endregion

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={() => {
                    handleModal()
                }}
                className='modal-dialog-centered modal-xl'
                contentClassName='pt-0'
                backdrop='static'
            >
                <ModalHeader
                    className='mb-1'
                    toggle={() => {
                        handleModal()
                    }}
                    close={CloseBtn}
                    tag='div'
                >
                    <h5 className='modal-title'>{t('Шалгалтын хуваарь бүртгэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    {isLoading && Loader}
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className='form-label' for='lesson'>
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name='lesson'
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name='lesson'
                                            id='lesson'
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={lesson_option || []}
                                            value={(value && lesson_option.find((c) => c.id === value)) || ''}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.code + ' ' + option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        {stypeValue === amanExamTypeId && online_checked && (
                            <Col md={3}>
                                <Controller
                                    control={control}
                                    defaultValue={''}
                                    name='challenge'
                                    render={({ field }) => {
                                        return (
                                            <>
                                                <Label className='form-label' for={field.name}>
                                                    {t('Онлайн шалгалт')}
                                                </Label>
                                                <Select
                                                    {...field}
                                                    id={field.name}
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors[field.name] })}
                                                    isLoading={isLoading}
                                                    placeholder={t('-- Сонгоно уу --')}
                                                    options={challengeOption || []}
                                                    noOptionsMessage={() => t('Хоосон байна.')}
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => option.title}
                                                />
                                                {errors[field.name] && (
                                                    <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>
                                                )}
                                            </>
                                        )
                                    }}
                                ></Controller>
                            </Col>
                        )}
                        <Col md={6} className='pt-2'>
                            <Controller
                                control={control}
                                name='is_online'
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input
                                        id='is_online'
                                        type='checkbox'
                                        className='me-50'
                                        {...field}
                                        onChange={(e) => IsOnline(e.target.checked)}
                                        checked={online_checked}
                                    />
                                )}
                            />
                            <Label className='form-label' for='is_online'>
                                {t('Онлайн шалгалт эсэх')}
                            </Label>
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='stype'>
                                {t('Шалгалт авах төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name='stype'
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name='stype'
                                            id='stype'
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.stype })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={examType() || []}
                                            value={(value && examType().find((c) => c.id === value)) || ''}
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
                            {errors.stype && <FormFeedback className='d-block'>{t(errors.stype.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='room'>
                                {t('Шалгалт авах өрөө')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name='room'
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name='room'
                                            id='room'
                                            classNamePrefix='select'
                                            isDisabled={online_checked}
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.room })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={room_option || []}
                                            value={(value && room_option.find((c) => c.id === value)) || ''}
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
                            ></Controller>
                            {errors.room && <FormFeedback className='d-block'>{t(errors.room.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='room_name'>
                                {t('Шалгалт авах анги танхимийн нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='room_name'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id={field.name}
                                        disabled={online_checked}
                                        bsSize='sm'
                                        placeholder={t('Анги танхимийн нэр')}
                                        type='text'
                                        invalid={errors[field.name] && true}
                                    />
                                )}
                            />
                            {errors.room_name && <FormFeedback className='d-block'>{t(errors.room_name.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='teacher'>
                                {t('Хянах багш')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name='teacher'
                                render={() => {
                                    return (
                                        <Select
                                            name='teacher'
                                            id='teacher'
                                            classNamePrefix='select'
                                            isClearable
                                            isMulti
                                            className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={teacher_option || []}
                                            value={selectedTeachers || ''}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                setSelectedTeachers(val || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) =>
                                                `${option?.rank_name || ''} ${option?.last_name || ''} ${option?.first_name || ''}`
                                            }
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='begin_date'>
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='begin_date'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id={field.name}
                                        bsSize='sm'
                                        placeholder={t('Эхлэх хугацаа')}
                                        type='datetime-local'
                                        invalid={errors[field.name] && true}
                                    />
                                )}
                            />
                            {errors.begin_date && <FormFeedback className='d-block'>{t(errors.begin_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='end_date'>
                                {t('Дуусах хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='end_date'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id={field.name}
                                        bsSize='sm'
                                        placeholder={t('Дуусах хугацаа')}
                                        type='datetime-local'
                                        // readOnly={stypeValue === 2}
                                        invalid={errors[field.name] && true}
                                    />
                                )}
                            />
                            {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='d-flex gap-5'>
                            <Col md={9}>
                                <Label className='form-label' for='student'>
                                    {t('Оюутан нэмэх')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    name='student'
                                    render={() => {
                                        return (
                                            <Select
                                                id='student'
                                                name='student'
                                                classNamePrefix='select'
                                                className='react-select'
                                                placeholder={`Хайх`}
                                                isLoading={isLoadingStudent}
                                                options={studentOptions || []}
                                                value={selectedStudent || ''}
                                                noOptionsMessage={() => 'Хоосон байна'}
                                                onChange={(val) => {
                                                    setSelectedStudent(val || '')
                                                }}
                                                onInputChange={(e) => {
                                                    if (e?.length > 1) {
                                                        handleStudentSelect(e)
                                                    } else if (e?.length === 0) {
                                                        setStudentOptions([])
                                                    }
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => `${option.code} ${option.full_name}`}
                                            />
                                        )
                                    }}
                                />
                            </Col>
                            <Col md={3}>
                                <Button className='mt-2' color='primary' size='sm' onClick={onSubmitStudent}>
                                    {t('Нэмэх')}
                                </Button>
                            </Col>
                        </Col>

                        <Card style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <CardBody tag={Row}>
                                <CardTitle tag='h5'>Дахин шалгалт өгөх суралцагчид</CardTitle>
                                <Row>
                                    <Col md={12}>
                                        <CardHeader className='py-0'>
                                            <strong>Шалгалтанд оролцох суралцагчид</strong>({studentData?.length})
                                        </CardHeader>
                                        <CardBody>
                                            <Table bordered size='sm'>
                                                <thead>
                                                    <tr>
                                                        <th>№</th>
                                                        <th>Хөтөлбөр анги</th>
                                                        <th>Оюутан</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentData?.map((student, originalIndex) => (
                                                        <tr key={originalIndex}>
                                                            <td>{originalIndex + 1}</td>
                                                            <td>{student.group_name}</td>
                                                            <td>{student.code}-{student.last_name?.charAt(0)}.{student.first_name}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </CardBody>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                        <Col md={12} className='mt-2 text-center'>
                            <Button className='me-2' color='primary' type='submit' disabled={postLoading}>
                                {postLoading && <Spinner size='sm' className='me-1' />}
                                {t('Хадгалах')}
                            </Button>
                            <Button
                                color='secondary'
                                type='reset'
                                outline
                                onClick={() => {
                                    handleModal()
                                }}
                            >
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
export default AddModal
