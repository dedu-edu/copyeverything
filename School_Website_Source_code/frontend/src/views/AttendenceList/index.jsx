import React, { useState, useEffect, useCallback, Fragment, useContext, useMemo } from 'react'
import { Activity, CheckCircle, ChevronDown, ChevronRight, UserMinus, UserX } from "react-feather"

import { Table, Input, Card, CardBody, Row, Col, CardHeader, CardTitle } from 'reactstrap'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

import { get_day, get_rombo_week, get_time, get_week } from '@src/utility/Utils'
import { CSelect } from '@src/components/CSelect'
import { useTranslation } from 'react-i18next'
import StatsHorizontal from '@src/@core/components/widgets/stats/StatsHorizontal'
import ActiveYearContext from '@src/utility/context/ActiveYearContext'


export default function AttendanceList() {

    const { active_week: systemActiveWeek } = useContext(ActiveYearContext)

    const initiaSelectlValues = {
        department: '',
        teacher: '',
        group: '',
        day: '',
        time: '',
        lesson: '',
        school: '',
        active_week: systemActiveWeek,
    };

    const { t } = useTranslation();
    const { fetchData, Loader, isLoading } = useLoader({ isFullScreen: false })
    const { fetchData: mainFetchData, isLoading: is_loading } = useLoader({ isFullScreen: false })

    const [expandedLessons, setExpandedLessons] = useState({})
    const [expandedGroups, setExpandedGroups] = useState({})
    const [expandedSessions, setExpandedSessions] = useState({})
    const [searchTerms, setSearchTerms] = useState({})
    const [lessons, setLessons] = useState([])
    const [groupsData, setGroupsData] = useState({})
    const [studentsData, setStudentsData] = useState({})

    const [groupLoaders, setGroupLoaders] = useState({})
    const [studentLoaders, setStudentLoaders] = useState({})

    const [lessonOptionDatas, setLessonOptionDatas] = useState([])
	const [teacherOptionDatas, setTeacherOptionDatas] = useState([])
	const [groupOptionDatas, setGroupOptionDatas] = useState([])
    const [selectedValue, setSelectValue] = useState(initiaSelectlValues);
    const [staticData, setStaticData] = useState({})

    const irtsInfoApi = useApi().timetable.irtsInfo
	const lessonsScheduleApi = useApi().timetable.lessonsSchedule;

    useEffect(() => {
		async function getLessonDatas() {
			const { success, data } = await fetchData(lessonsScheduleApi.getLesson())
            if(success) {
                setLessonOptionDatas(data)
            }
		}
		getLessonDatas();
	}, []);

    useEffect(() => {
        async function getTeacherDatas() {
			const { success, data } = await fetchData(lessonsScheduleApi.getTeachers(selectedValue.lesson))
            if(success) {
                setTeacherOptionDatas(data)
            }
		}
		getTeacherDatas();

    }, [selectedValue.lesson])

    useEffect(() => {
        async function getGroupDatas() {
			const { success, data } = await fetchData(lessonsScheduleApi.getGroup(selectedValue.lesson, selectedValue.teacher))
            if(success) {
                setGroupOptionDatas(data)
            }
		}
		getGroupDatas();

    }, [selectedValue.lesson, selectedValue.teacher])

    useEffect(() => {
        getDatas()
    }, [selectedValue])

    const getDatas = async () => {
        const { teacher, lesson, active_week, day, time, group } = selectedValue
        const { success, data } = await mainFetchData(irtsInfoApi.getLesson(lesson, teacher, active_week, day, time, group))
        if (success && data) {
            setLessons(data?.datas)
            setStaticData(data?.totals)
            setExpandedGroups({})
            setExpandedLessons({})
            setExpandedSessions({})
        }
    }

    const toggleLesson = useCallback(async (lesson) => {
        const lessonKey = `${lesson.lesson_id}-${lesson.teacher_id}`
        const isExpanded = expandedLessons[lessonKey]

        setExpandedLessons(prev => ({
            ...prev,
            [lessonKey]: !isExpanded
        }))

        if (!isExpanded) {
            setGroupLoaders(prev => ({ ...prev, [lessonKey]: true }))
            try {
                const { active_week, day, time, group } = selectedValue
                const { success, data } = await irtsInfoApi.getGroup(lesson.lesson_id, lesson.teacher_id, active_week, day, time, group)
                if (success && data) {
                    setGroupsData(prev => ({
                        ...prev,
                        [lessonKey]: data
                    }))
                }
            } catch (error) {
                // Handle error
            } finally {
                setGroupLoaders(prev => ({ ...prev, [lessonKey]: false }))
            }
        }
    }, [expandedLessons, groupsData, irtsInfoApi])

    const toggleGroup = useCallback(async (lesson, group) => {
        const groupKey = `${lesson.lesson_id}-${lesson.teacher_id}-${group.id}`
        const isExpanded = expandedGroups[groupKey]

        setExpandedGroups(prev => ({
            ...prev,
            [groupKey]: !isExpanded
        }))

        if (!isExpanded) {
            setStudentLoaders(prev => ({ ...prev, [groupKey]: true }))
            try {
                const { active_week, day, time } = selectedValue

                const response = await irtsInfoApi.getList(group.id, lesson.lesson_id, lesson.teacher_id, active_week, day, time)
                if (response.success && response.data) {
                    setStudentsData(prev => ({
                        ...prev,
                        [groupKey]: response.data
                    }))
                }
            } catch (error) {
                // Handle error
            } finally {
                setStudentLoaders(prev => ({ ...prev, [groupKey]: false }))
            }
        }
    }, [expandedGroups, irtsInfoApi])

    const toggleSession = useCallback((sessionKey) => {
        setExpandedSessions(prev => ({
            ...prev,
            [sessionKey]: !prev[sessionKey]
        }))
    }, [])

    const updateSearchTerm = useCallback((sessionKey, value) => {
        setSearchTerms(prev => ({
            ...prev,
            [sessionKey]: value
        }))
    }, [])

    const getStatusColor = (status) => {
        switch (status) {
            case 'и': return '#c8e6c9'
            case 'т': return '#ffcdd2'
            case 'ч': return '#fff59d'
            case 'ө': return '#b3e5fc'
            default: return '#f5f5f5'
        }
    }

    const filterStudents = useCallback((studentsData, searchTerm) => {
        if (!searchTerm) return studentsData
        return studentsData?.filter(s => s?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [])

    return (
        <Fragment>
            {(isLoading || is_loading) && Loader}
            <Card>
                <CardHeader className="border-bottom justify-content-center">
                    <CardTitle tag="h4">{t("Ирцийн мэдээлэл")}</CardTitle>
                </CardHeader>
                <Row className='p-1 pb-2 gy-1'>
                    <Col md={3} sm={6} xs={12}>
                        <CSelect
                            id="active_week"
                            options={get_week()}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        active_week: val,
                                    }
                                })
                            }}
                            value={selectedValue?.active_week ? get_week()?.find((val) => val?.id === selectedValue?.active_week) : ''}
                            getOptionLabel={(option) => option.name}
                            label={t("Хичээлийн 7 хоног")}
                            getOptionValue={(option) => option.id}
                        />
                    </Col>
                    <Col md={3} sm={6} xs={12}>
                        <CSelect
                            id="lesson"
                            options={lessonOptionDatas}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        lesson: val,
                                        teacher: "",
                                        group: "",
                                    }
                                })
                            }}
                            value={selectedValue?.lesson ? lessonOptionDatas?.find((val) => val?.id === selectedValue?.lesson) : ''}
                            getOptionLabel={(option) => `${option.code ?? ""} ${option.name}`}
                            label={t("Хичээл")}
                            getOptionValue={(option) => option.id}
                        />
                    </Col>
                    <Col md={3} sm={6} xs={12}>
                        <CSelect
                            id="teacher"
                            options={teacherOptionDatas}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        teacher: val,
                                        group: "",
                                    }
                                })
                            }}
                            value={selectedValue?.teacher ? teacherOptionDatas?.find((val) => val?.id === selectedValue?.teacher) : ''}
                            getOptionLabel={(option) => `${option?.last_name ?? ""} ${option?.first_name}`}
                            label={t("Багш")}
                            getOptionValue={(option) => option.id}
                        />
                    </Col>
                    <Col md={3} sm={6} xs={12}>
                        <CSelect
                            id="group"
                            options={groupOptionDatas}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        group: val,
                                    }
                                })
                            }}
                            value={selectedValue?.group ? groupOptionDatas?.find((val) => val?.id === selectedValue?.group) : ''}
                            getOptionLabel={(option) => option?.name}
                            label={t("Дамжаа")}
                            getOptionValue={(option) => option.id}
                        />
                    </Col>
                    <Col md={3} sm={6} xs={12}>
                        <CSelect
                            id="day"
                            options={get_day()}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        day: val,
                                    }
                                })
                            }}
                            value={selectedValue?.day ? get_day()?.find((val) => val?.id === selectedValue?.day) : ''}
                            getOptionLabel={(option) => option.name}
                            label={t("Өдөр")}
                            getOptionValue={(option) => option.id}
                        />
                    </Col>
                    <Col md={3} sm={6} xs={12}>
                        <CSelect
                            id="time"
                            options={get_time()}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        time: val,
                                    }
                                })
                            }}
                            value={selectedValue?.time ? get_time()?.find((val) => val?.id === selectedValue?.time) : ''}
                            getOptionLabel={(option) => option.name}
                            label={t("Цаг")}
                            getOptionValue={(option) => option.id}
                        />
                    </Col>
                </Row>
            </Card>
            <Row className='px-15'>
                <Col md={3} sm={4}>
                    <StatsHorizontal
                        color='success'
                        statTitle='Ирсэн'
                        icon={<Activity size={20} />}
                        renderStats={<h3 className='fw-bolder mb-75'>{staticData?.total_irsen || 0}</h3>}
                    />
                </Col>
                <Col md={3} sm={4}>
                    <StatsHorizontal
                        color='danger'
                        statTitle='Тасалсан'
                        icon={<UserX size={20} />}
                        renderStats={<h3 className='fw-bolder mb-75'>{staticData?.total_tas || 0}</h3>}
                    />
                </Col>
                <Col md={3} sm={4}>
                    <StatsHorizontal
                        color='info'
                        statTitle='Чөлөөтэй'
                        icon={<UserMinus size={20} />}
                        renderStats={<h3 className='fw-bolder mb-75'>{staticData?.total_chuluu || 0}</h3>}
                    />
                </Col>
                <Col md={3} sm={4}>
                    <StatsHorizontal
                        color='warning'
                        statTitle='Өвчтэй'
                        icon={<CheckCircle size={20} />}
                        renderStats={<h3 className='fw-bolder mb-75'>{staticData?.total_sick || 0}</h3>}
                    />
                </Col>
            </Row>
            <Card>
                <CardBody className="border-bottom justify-content-center">
                    <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                        <Table bordered hover size='sm'>
                            <thead style={{
                                backgroundColor: '#f8f9fa',
                                position: 'sticky',
                                top: 0,
                                zIndex: 10
                            }}>
                                <tr>
                                    <th style={{ minWidth: '10px' }}>#</th>
                                    <th style={{ minWidth: '200px' }}>Хичээлийн нэр</th>
                                    <th style={{ minWidth: '150px' }}>Багш</th>
                                    <th style={{ minWidth: '8px' }}>Улирал</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>7 хоногт орох цаг</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>Хичээллэх 7 хоног</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>Нийт оролтын тоо</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>Бүртгэгдсэн ирцийн тоо</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>Ирсэн</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>Тасалсан</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>Чөлөөтэй</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>Өвчтэй</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    lessons?.length > 0
                                    ?
                                        lessons?.map((lesson, index) => {
                                            const lessonKey = `${lesson.lesson_id}-${lesson.teacher_id}`
                                            return (
                                                <React.Fragment key={lessonKey}>
                                                    <tr
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => toggleLesson(lesson)}
                                                    >
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {groupLoaders[lessonKey] ? (
                                                                    <div className="spinner-border spinner-border-sm" role="status">
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                ) : (
                                                                    expandedLessons[lessonKey] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                                                )}
                                                                {index + 1}
                                                            </div>
                                                        </td>
                                                        <td>{lesson.lesson_name}</td>
                                                        <td>{lesson.teacher_name}</td>
                                                        <td>{lesson.season_name}</td>
                                                        <td className="text-center">{lesson.week_time}</td>
                                                        <td className="text-center">{lesson.learn_week}</td>
                                                        <td className="text-center">{lesson.total_week_time}</td>
                                                        <td className="text-center">{lesson.irts_count}</td>
                                                        <td className="text-center">{lesson.irsen_count}</td>
                                                        <td className="text-center">{lesson.tas_count}</td>
                                                        <td className="text-center">{lesson.chuluu_count}</td>
                                                        <td className="text-center">{lesson.sick_count}</td>
                                                    </tr>
                                                    {expandedLessons[lessonKey] && groupsData[lessonKey] && (
                                                        <tr>
                                                            <td colSpan={12} style={{ padding: 0, backgroundColor: '#e3f2fd' }}>
                                                                {groupsData[lessonKey] && groupsData[lessonKey]?.length > 0 ? (
                                                                    <div style={{ padding: '6px' }}>
                                                                        <Table bordered hover size="sm" style={{ marginBottom: 0, backgroundColor: 'white' }}>
                                                                            <thead style={{ backgroundColor: '#bbdefb' }}>
                                                                                <tr>
                                                                                    <th style={{ width: '5%'}}>#</th>
                                                                                    <th style={{ width: '15'}}>Анги</th>
                                                                                    <th style={{ width: '25%'}}>Мэргэжил</th>
                                                                                    <th style={{ width: '5%'}}>Курс</th>
                                                                                    <th style={{ width: '10%'}}>Ирсэн</th>
                                                                                    <th style={{ width: '10%'}}>Тасалсан</th>
                                                                                    <th style={{ width: '10%'}}>Чөлөөтэй</th>
                                                                                    <th style={{ width: '10%'}}>Өвчтэй</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {
                                                                                    groupsData[lessonKey]?.map((group, groupIndex) => {
                                                                                    const groupKey = `${lesson.lesson_id}-${lesson.teacher_id}-${group.id}`
                                                                                    return (
                                                                                        <React.Fragment key={group.id}>
                                                                                            <tr
                                                                                                style={{ cursor: 'pointer' }}
                                                                                                onClick={() => toggleGroup(lesson, group)}
                                                                                            >
                                                                                                <td>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                                        {studentLoaders[groupKey] ? (
                                                                                                            <div className="spinner-border spinner-border-sm" role="status">
                                                                                                                <span className="visually-hidden">Loading...</span>
                                                                                                            </div>
                                                                                                        ) : (
                                                                                                            expandedGroups[groupKey] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                                                                                                        )}
                                                                                                        {groupIndex + 1}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>{group.name}</td>
                                                                                                <td align='left'>{group.profession_name}</td>
                                                                                                <td>{group.level}</td>
                                                                                                <td>{group.irsen_count}</td>
                                                                                                <td>{group.tas_count}</td>
                                                                                                <td>{group.chuluu_count}</td>
                                                                                                <td>{group.sick_count}</td>
                                                                                            </tr>
                                                                                            {expandedGroups[groupKey] && (
                                                                                                <tr>
                                                                                                    <td colSpan="9" style={{ padding: 0, backgroundColor: '#fff3e0' }}>
                                                                                                        {studentLoaders[groupKey] ? (
                                                                                                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                                                                                                <div className="spinner-border spinner-border-sm" role="status">
                                                                                                                    <span className="visually-hidden">Loading...</span>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        ) : studentsData[groupKey] && studentsData[groupKey].length > 0 ? (
                                                                                                            <div style={{ padding: '12px' }}>
                                                                                                                {studentsData[groupKey].map((classSession, sessionIdx) => {
                                                                                                                    const sessionKey = `${groupKey}-session-${sessionIdx}`
                                                                                                                    const isSessionExpanded = expandedSessions[sessionKey]
                                                                                                                    const currentSearchTerm = searchTerms[sessionKey] || ''
                                                                                                                    const tableData = classSession?.students || []
                                                                                                                    const studentFilteredData = filterStudents(tableData, currentSearchTerm)

                                                                                                                    const lessonWeeks = classSession?.weeks || []

                                                                                                                    return (
                                                                                                                        <div key={sessionIdx} style={{ marginBottom: sessionIdx < studentsData[groupKey].length - 1 ? '16px' : 0 }}>
                                                                                                                            <div
                                                                                                                                style={{
                                                                                                                                    backgroundColor: '#ffe0b2',
                                                                                                                                    padding: '10px 12px',
                                                                                                                                    marginBottom: '8px',
                                                                                                                                    borderRadius: '4px',
                                                                                                                                    fontWeight: 'bold',
                                                                                                                                    fontSize: '13px',
                                                                                                                                    cursor: 'pointer',
                                                                                                                                }}
                                                                                                                                className='d-flex justify-content-between'
                                                                                                                                onClick={() => toggleSession(sessionKey)}
                                                                                                                            >
                                                                                                                                <div>
                                                                                                                                    {isSessionExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                                                                                                    {classSession.type} - {classSession.day} дахь өдөр, {classSession.time} дахь цаг ({classSession.student_count} сурагч) {classSession.odd_even_name}
                                                                                                                                </div>
                                                                                                                                <div className='text-end'>
                                                                                                                                    <span className='ps-50'>Ирсэн {classSession?.irsen_count ? `(${classSession?.irsen_count})` : "(0)"}</span>
                                                                                                                                    <span className='ps-50'>Тасалсан {classSession?.tas_count ? `(${classSession?.tas_count})` : "(0)"}</span>
                                                                                                                                    <span className='ps-50'>Чөлөөтэй {classSession?.chuluu_count ? `(${classSession?.chuluu_count})` : "(0)"}</span>
                                                                                                                                    <span className='ps-50'>Өвчтэй {classSession?.sick_count ? `(${classSession?.sick_count})` : "(0)"}</span>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                            {isSessionExpanded && (
                                                                                                                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                                                                                                                    <div style={{ marginBottom: '12px' }}>
                                                                                                                                        <Input
                                                                                                                                            type="text"
                                                                                                                                            placeholder="Оюутны нэрээр хайх..."
                                                                                                                                            value={currentSearchTerm}
                                                                                                                                            onChange={(e) => updateSearchTerm(sessionKey, e.target.value)}
                                                                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                                                                            style={{ maxWidth: '400px' }}
                                                                                                                                            bsSize="sm"
                                                                                                                                        />
                                                                                                                                    </div>
                                                                                                                                    <div style={{
                                                                                                                                        display: 'flex',
                                                                                                                                        gap: '12px',
                                                                                                                                        marginBottom: '12px',
                                                                                                                                        flexWrap: 'wrap',
                                                                                                                                        fontSize: '12px'
                                                                                                                                    }}>
                                                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                                                                            <div style={{
                                                                                                                                                width: '20px',
                                                                                                                                                height: '20px',
                                                                                                                                                backgroundColor: '#c8e6c9',
                                                                                                                                                borderRadius: '3px',
                                                                                                                                                display: 'flex',
                                                                                                                                                alignItems: 'center',
                                                                                                                                                justifyContent: 'center',
                                                                                                                                                fontWeight: 'bold',
                                                                                                                                                fontSize: '11px'
                                                                                                                                            }}>и</div>
                                                                                                                                            <span>Ирсэн {classSession?.irsen_count ? `(${classSession?.irsen_count})` : ""}</span>
                                                                                                                                        </div>
                                                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                                                                            <div style={{
                                                                                                                                                width: '20px',
                                                                                                                                                height: '20px',
                                                                                                                                                backgroundColor: '#ffcdd2',
                                                                                                                                                borderRadius: '3px',
                                                                                                                                                display: 'flex',
                                                                                                                                                alignItems: 'center',
                                                                                                                                                justifyContent: 'center',
                                                                                                                                                fontWeight: 'bold',
                                                                                                                                                fontSize: '11px'
                                                                                                                                            }}>т</div>
                                                                                                                                            <span>Тасалсан {classSession?.tas_count ? `(${classSession?.tas_count})` : ""}</span>
                                                                                                                                        </div>
                                                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                                                                            <div style={{
                                                                                                                                                width: '20px',
                                                                                                                                                height: '20px',
                                                                                                                                                backgroundColor: '#fff59d',
                                                                                                                                                borderRadius: '3px',
                                                                                                                                                display: 'flex',
                                                                                                                                                alignItems: 'center',
                                                                                                                                                justifyContent: 'center',
                                                                                                                                                fontWeight: 'bold',
                                                                                                                                                fontSize: '11px'
                                                                                                                                            }}>ч</div>
                                                                                                                                            <span>Чөлөөтэй {classSession?.chuluu_count ? `(${classSession?.chuluu_count})` : ""}</span>
                                                                                                                                        </div>
                                                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                                                                            <div style={{
                                                                                                                                                width: '20px',
                                                                                                                                                height: '20px',
                                                                                                                                                backgroundColor: '#b3e5fc',
                                                                                                                                                borderRadius: '3px',
                                                                                                                                                display: 'flex',
                                                                                                                                                alignItems: 'center',
                                                                                                                                                justifyContent: 'center',
                                                                                                                                                fontWeight: 'bold',
                                                                                                                                                fontSize: '11px'
                                                                                                                                            }}>ө</div>
                                                                                                                                            <span>Өвчтэй {classSession?.sick_count ? `(${classSession?.sick_count})` : ""}</span>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                    <div style={{ overflow: 'auto', maxWidth: '100%' }}>
                                                                                                                                        <Table bordered size="sm" style={{ fontSize: '12px', minWidth: '600px', marginBottom: 0 }}>
                                                                                                                                            <thead>
                                                                                                                                                <tr style={{ backgroundColor: '#ffe0b2' }}>
                                                                                                                                                    <th>№</th>
                                                                                                                                                    <th style={{
                                                                                                                                                        position: 'sticky',
                                                                                                                                                        left: 0,
                                                                                                                                                        backgroundColor: '#ffe0b2',
                                                                                                                                                        zIndex: 9,
                                                                                                                                                        minWidth: '140px'
                                                                                                                                                    }}>
                                                                                                                                                        Оюутны нэр
                                                                                                                                                    </th>
                                                                                                                                                    {
                                                                                                                                                        lessonWeeks?.map((week, w_idx) => {
                                                                                                                                                            const romboWeek = get_rombo_week()?.find((rombo) => rombo?.id === week)?.name || week
                                                                                                                                                            return (
                                                                                                                                                                <th key={w_idx + 1} className="text-center" style={{
                                                                                                                                                                    minWidth: '45px',
                                                                                                                                                                    fontSize: '11px'
                                                                                                                                                                }}>
                                                                                                                                                                    {romboWeek}<br />
                                                                                                                                                                </th>
                                                                                                                                                            )
                                                                                                                                                        })
                                                                                                                                                    }
                                                                                                                                                </tr>
                                                                                                                                            </thead>
                                                                                                                                            <tbody>
                                                                                                                                                {studentFilteredData?.map((student, idx) => (
                                                                                                                                                    <tr key={idx}>
                                                                                                                                                        <td>{idx+1}</td>
                                                                                                                                                        <td style={{
                                                                                                                                                            fontWeight: '500',
                                                                                                                                                            position: 'sticky',
                                                                                                                                                            left: 0,
                                                                                                                                                            backgroundColor: 'white',
                                                                                                                                                            zIndex: 9
                                                                                                                                                        }}>
                                                                                                                                                            {student.name}
                                                                                                                                                        </td>
                                                                                                                                                        {
                                                                                                                                                            lessonWeeks?.map((week, w_idx) => {
                                                                                                                                                                const status = student?.weeks?.find((item) => item?.week === week)?.state_name || '-'
                                                                                                                                                                return (
                                                                                                                                                                    <td key={w_idx} className="text-center" style={{
                                                                                                                                                                        backgroundColor: getStatusColor(status),
                                                                                                                                                                        fontWeight: 'bold',
                                                                                                                                                                        fontSize: '13px'
                                                                                                                                                                    }}>
                                                                                                                                                                        {status}
                                                                                                                                                                    </td>
                                                                                                                                                                )
                                                                                                                                                            })
                                                                                                                                                        }
                                                                                                                                                    </tr>
                                                                                                                                                ))}
                                                                                                                                            </tbody>
                                                                                                                                        </Table>
                                                                                                                                    </div>

                                                                                                                                    {studentFilteredData?.length === 0 && (
                                                                                                                                        <div className="text-center text-muted" style={{
                                                                                                                                            padding: '20px',
                                                                                                                                            fontSize: '13px'
                                                                                                                                        }}>
                                                                                                                                            Оюутны мэдээлэл олдсонгүй
                                                                                                                                        </div>
                                                                                                                                    )}
                                                                                                                                </div>
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                })}
                                                                                                            </div>
                                                                                                        ) : (
                                                                                                            <div className="text-center text-muted" style={{ padding: '20px' }}>
                                                                                                                Мэдээлэл олдсонгүй
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            )}
                                                                                        </React.Fragment>
                                                                                    )
                                                                                })}
                                                                            </tbody>
                                                                        </Table>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center text-muted" style={{ padding: '20px' }}>
                                                                        Анги олдсонгүй
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })
                                    :
                                        <tr className='text-center'>
                                            <td colSpan={12}>
                                                Өгөгдөл олдсонгүй
                                            </td>
                                        </tr>
                                }
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>
        </Fragment>
    )
}