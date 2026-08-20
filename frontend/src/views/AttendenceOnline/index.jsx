import React, { useState, useEffect, useCallback, Fragment, useContext } from 'react'
import { ChevronDown, ChevronRight, Download } from "react-feather"
import { Table, Card, CardBody, CardHeader, CardTitle, Row, Col, Badge, Button } from 'reactstrap'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { get_day, get_week } from '@src/utility/Utils'
import { CSelect } from '@src/components/CSelect'
import { useTranslation } from 'react-i18next'
import ActiveYearContext from '@src/utility/context/ActiveYearContext'
import { exportToExcel } from './helpers'

export default function OnlineAttendanceReport() {

    const { active_week: systemActiveWeek } = useContext(ActiveYearContext)

    const initialSelectValues = {
        lesson: '',
        teacher: '',
        active_week: systemActiveWeek,
    }

    const { t } = useTranslation()
    const { fetchData, Loader, isLoading } = useLoader({ isFullScreen: false })
    const { fetchData: mainFetchData, isLoading: is_loading } = useLoader({ isFullScreen: false })

    const [selectedValue, setSelectValue] = useState(initialSelectValues)
    const [lessonOptionDatas, setLessonOptionDatas] = useState([])
    const [teacherOptionDatas, setTeacherOptionDatas] = useState([])

    const [lessons, setLessons] = useState([])
    const [expandedLessons, setExpandedLessons] = useState({})
    const [groupsData, setGroupsData] = useState({})
    const [groupLoaders, setGroupLoaders] = useState({})

    const [mainPage, setMainPage] = useState(1)
    const [mainTotalPages, setMainTotalPages] = useState(1)
    const [mainTotal, setMainTotal] = useState(0)

    const irtsInfoApi = useApi().timetable.irtsInfo
    const lessonsScheduleApi = useApi().timetable.lessonsSchedule

    useEffect(() => {
        async function getLessonDatas() {
            const { success, data } = await fetchData(lessonsScheduleApi.getLesson())
            if (success) setLessonOptionDatas(data)
        }
        getLessonDatas()
    }, [])

    useEffect(() => {
        async function getTeacherDatas() {
            const { success, data } = await fetchData(lessonsScheduleApi.getTeachers(selectedValue.lesson))
            if (success) setTeacherOptionDatas(data)
        }
        getTeacherDatas()
    }, [selectedValue.lesson])

    useEffect(() => {
        if (selectedValue.active_week) {
            fetchPage(1, selectedValue)
        }
    }, [selectedValue])

    const fetchPage = async (page, sv) => {
        const { teacher, lesson, active_week, day, time, group } = sv
        const { success, data } = await mainFetchData(
            irtsInfoApi.getLessonOnline(lesson, teacher, active_week, day, time, group, page)
        )
        if (success && data) {
            setLessons(data?.datas)
            setMainPage(data?.page || page)
            setMainTotalPages(data?.total_pages || 1)
            setMainTotal(data?.total || 0)
            setExpandedLessons({})
            setGroupsData({})
        }
    }

    const toggleLesson = useCallback(async (item) => {
        const lessonKey = `${item.lesson_id}-${item.teacher_id}`
        const isExpanded = expandedLessons[lessonKey]

        setExpandedLessons(prev => ({ ...prev, [lessonKey]: !isExpanded }))

        if (!isExpanded) {
            setGroupLoaders(prev => ({ ...prev, [lessonKey]: true }))
            try {
                const { active_week } = selectedValue
                const { success, data } = await irtsInfoApi.getOnlineReport(item.lesson_id, item.teacher_id, active_week)
                if (success && data) {
                    setGroupsData(prev => ({ ...prev, [lessonKey]: data?.datas || data }))
                }
            } catch (error) {
            } finally {
                setGroupLoaders(prev => ({ ...prev, [lessonKey]: false }))
            }
        }
    }, [expandedLessons, irtsInfoApi, selectedValue])

    const getMatchBadge = (row) => {
        if (!row.created_at) return <Badge color='danger' pill>Үүсгээгүй</Badge>
        return <Badge color='success' pill>Үүсгэсэн</Badge>
    }

    const getMatchRowColor = (row) => {
        if (!row.created_at) return '#fff5f5'
        return '#f0fff4'
    }

    const renderPagination = () => {
        if (mainTotalPages <= 1) return null
        const pages = Array.from({ length: mainTotalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === mainTotalPages || Math.abs(p - mainPage) <= 1)
            .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                acc.push(p)
                return acc
            }, [])

        return (
            <div className='d-flex justify-content-between align-items-center mt-1 px-1' style={{ fontSize: '12px' }}>
                <span className='text-muted'>Нийт {mainTotal} бичлэг</span>
                <div className='d-flex gap-1'>
                    <Button size='sm' color='secondary' outline
                        disabled={mainPage <= 1 || is_loading}
                        onClick={() => fetchPage(mainPage - 1, selectedValue)}>‹</Button>
                    {pages.map((p, idx) =>
                        p === '...'
                            ? <span key={`e-${idx}`} style={{ padding: '4px 6px' }}>...</span>
                            : <Button key={p} size='sm'
                                color={p === mainPage ? 'primary' : 'secondary'}
                                outline={p !== mainPage}
                                disabled={is_loading}
                                onClick={() => fetchPage(p, selectedValue)}>{p}</Button>
                    )}
                    <Button size='sm' color='secondary' outline
                        disabled={mainPage >= mainTotalPages || is_loading}
                        onClick={() => fetchPage(mainPage + 1, selectedValue)}>›</Button>
                </div>
            </div>
        )
    }

    return (
        <Fragment>
            {(isLoading || is_loading) && Loader}

            <Card>
                <CardHeader className="border-bottom d-flex justify-content-between align-items-center">
                    <CardTitle tag="h4">{t("Цахим сургалтын ирцийн тайлан")}</CardTitle>
                    <Button color='success' size='sm'
                        onClick={() => exportToExcel(lessons, mainPage, selectedValue.active_week)}
                        disabled={!lessons?.length}>
                        <Download size={14} className='me-50' />
                        Excel татах
                    </Button>
                </CardHeader>
                <Row className='p-1 pb-2 gy-1'>
                    <Col md={3} sm={6} xs={12}>
                        <CSelect
                            id="active_week"
                            options={get_week()}
                            onChange={(val) => setSelectValue(current => ({ ...current, active_week: val }))}
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
                            onChange={(val) => setSelectValue(current => ({ ...current, lesson: val, teacher: "" }))}
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
                            onChange={(val) => setSelectValue(current => ({ ...current, teacher: val }))}
                            value={selectedValue?.teacher ? teacherOptionDatas?.find((val) => val?.id === selectedValue?.teacher) : ''}
                            getOptionLabel={(option) => `${option?.last_name ?? ""} ${option?.first_name}`}
                            label={t("Багш")}
                            getOptionValue={(option) => option.id}
                        />
                    </Col>
                </Row>
            </Card>

            <Card>
                <CardBody>
                    <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                        <Table bordered hover size='sm'>
                            <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr>
                                    <th style={{ minWidth: '10px' }}>#</th>
                                    <th style={{ minWidth: '150px' }}>Багш</th>
                                    <th style={{ minWidth: '80px' }}>Улирал</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>7 хоногт орох цаг</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>Хичээллэх 7 хоног</th>
                                    <th className="text-center" style={{ minWidth: '80px' }}>Нийт оролтын тоо</th>
                                    <th className="text-center" style={{ minWidth: '80px', color: '#28a745' }}>Үүсгэсэн</th>
                                    <th className="text-center" style={{ minWidth: '80px', color: '#dc3545' }}>Үүсгээгүй</th>
                                    <th className="text-center" style={{ minWidth: '100px' }}>Биелэлт %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lessons?.length > 0 ? lessons?.map((item, index) => {
                                    const lessonKey = `${item.lesson_id}-${item.teacher_id}`
                                    const isExpanded = expandedLessons[lessonKey]
                                    const detail = groupsData[lessonKey]
                                    const loading = groupLoaders[lessonKey]

                                    const total = item.total_week_time || 0
                                    const created = total - (item.not_created_count || 0)
                                    const percent = total > 0 ? Math.min(100, Math.round((created / total) * 100)) : 0
                                    const percentColor = percent >= 80 ? '#28a745' : percent >= 50 ? '#ffc107' : '#dc3545'

                                    return (
                                        <React.Fragment key={lessonKey}>
                                            <tr style={{ cursor: 'pointer' }} onClick={() => toggleLesson(item)}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {loading ? (
                                                            <div className="spinner-border spinner-border-sm" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        ) : (
                                                            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                                        )}
                                                        {(mainPage - 1) * 40 + index + 1}
                                                    </div>
                                                </td>
                                                <td>{item.teacher_name}</td>
                                                <td>{item.season_name}</td>
                                                <td className="text-center">{item.week_time}</td>
                                                <td className="text-center">{item.learn_week}</td>
                                                <td className="text-center">{item.total_week_time}</td>
                                                <td className="text-center" style={{ color: '#28a745', fontWeight: 'bold' }}>
                                                    {item.irts_qr_count || 0}
                                                </td>
                                                <td className="text-center" style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                                    {Math.max(0, item.not_created_count || 0)}
                                                </td>
                                                <td className="text-center">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                                        <div style={{ width: '80px', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: percentColor, borderRadius: '4px', transition: 'width 0.3s ease' }} />
                                                        </div>
                                                        <span style={{ color: percentColor, fontWeight: 'bold', fontSize: '12px' }}>{percent}%</span>
                                                    </div>
                                                </td>
                                            </tr>

                                            {isExpanded && groupsData[lessonKey] && (
                                                <tr>
                                                    <td colSpan={9} style={{ padding: 0, backgroundColor: '#f0f4ff' }}>
                                                        {loading ? (
                                                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                                                <div className="spinner-border spinner-border-sm" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        ) : detail?.length > 0 ? (
                                                            <div style={{ padding: '10px' }}>
                                                                <Table bordered size="sm" style={{ marginBottom: 0, backgroundColor: 'white', fontSize: '12px' }}>
                                                                    <thead style={{ backgroundColor: '#dde3f8' }}>
                                                                        <tr>
                                                                           <th>#</th>
                                                                            <th>Хичээлийн нэр</th>
                                                                            <th className="text-center">Хуваарийн өдөр</th>
                                                                            <th className="text-center">Хуваарийн цаг</th>
                                                                            <th className="text-center">Үүсгэсэн огноо/цаг/минут</th>
                                                                            <th className="text-center">Төлөв</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {detail.map((row, rIdx) => (
                                                                            <tr key={rIdx} style={{ backgroundColor: getMatchRowColor(row) }}>
                                                                                <td>{rIdx + 1}</td>
                                                                                <td>{row.lesson_name || item.lesson_name}</td>
                                                                                <td className="text-center">
                                                                                    {get_day()?.find(d => d.id === row.schedule_day)?.name || row.schedule_day}
                                                                                </td>
                                                                                <td className="text-center">{row.schedule_time} цаг</td>
                                                                                <td className="text-center">
                                                                                    {row.created_at
                                                                                        ? <span style={{ fontWeight: 'bold' }}>
                                                                                            {row.created_at?.split('T')[0]} {row.created_hour}:{String(row.created_minute).padStart(2, '0')}
                                                                                        </span>
                                                                                        : <span style={{ color: '#dc3545' }}>—</span>
                                                                                    }
                                                                                </td>
                                                                                <td className="text-center">{getMatchBadge(row)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </Table>
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
                                }) : (
                                    <tr className='text-center'>
                                        <td colSpan={9}>Өгөгдөл олдсонгүй</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                    {renderPagination()}
                </CardBody>
            </Card>
        </Fragment>
    )
}