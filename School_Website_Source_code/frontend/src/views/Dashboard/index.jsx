import { Fragment, useState, useEffect } from 'react'
import { Book, User } from 'react-feather'
import {
    Card,
    CardBody,
    CardTitle,
    Row,
    Col,
    CardText,
    CardHeader,
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    UncontrolledDropdown
 } from 'reactstrap'
import { TrendingUp, Box, Monitor } from 'react-feather'
import Avatar from '@components/avatar'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import AttendanceSummary from './AttendanceSummary'
import AttendanceTimeline from './AttendanceTimeline'
import ProfessionScoreSummary from './ProfessionScoreSummary'
import AccessActivityChart from './AccessActivityChart'
import StudentStateSummary from './StudentStateSummary'
import ExamSummary from './ExamSummary'
import OnlineLessonSummary from './OnlineLessonSummary'

import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'

const DashboardComponent = () => {
    const { fetchData } = useLoader({})

    const [attendanceSummaryData, setAttendanceSummaryData] = useState({})
    const [selectedAttendanceWeek, setSelectedAttendanceWeek] = useState('')
    const [attendanceTimelineData, setAttendanceTimelineData] = useState({ selected_week: '', selected_week_average_percent: 0, below_threshold_school_count: 0, schools: [] })
    const [professionSummary, setProfessionSummary] = useState({})
    const [dailyChart, setDailyChart] = useState({})
    const [onlineLessonSummary, setOnlineLessonSummary] = useState({})
    const [examSummary, setExamSummary] = useState({})
    const [info, setInfo] = useState({
        salbar_data: []
    })

    const [selectItem, setSelectItem] = useState(
        {
            'id': 'day',
            'name': 'Өнөөдөр'
        }
    )
    const [degrees, setDegrees] = useState([])
    const [selectedDegree, setSelectedDegree] = useState('')
    const [systemInfo, setSystemInfo] = useState(
        {
            'total': 0,
            'sis': 0,
            'student': 0,
            'teacher': 0
        }
    )

    const date_list = [
        {
            'id': 'day',
            'name': 'Өнөөдөр'
        },
        {
            'id': 'week',
            'name': 'Сүүлийн 7 хоног'
        },
        {
            'id': 'last_month',
            'name': 'Сүүлийн 1 сар'
        },
        {
            'id': 'three_month',
            'name': 'Сүүлийн 3 сар'
        },
    ]

    const [stateInfo, setStateInfo] = useState({
        total: 0,
        datas: []
    })

    // Api
    const parentschoolApi = useApi().calendarCard
    const coreApi = useApi().hrms
    const stateApi = useApi().student
    const irtsInfoApi = useApi().timetable.irtsInfo
    const scoreApi = useApi().print.score
    const degreeApi = useApi().settings.professionaldegree
    const onlineLessonApi = useApi().getOnlineLessonCount
    const examTimeTableApi = useApi().timetable.exam

    async function getDatas1() {
        const {success, data} = await fetchData(parentschoolApi.get())
        if(success) {
            setInfo(data)
        }
    }

    useEffect(
        () =>
        {
            getDatas1()
        },
        []
    )

    const handleSysChange = (item) => {
        setSelectItem(item)
    }

    async function getSysInfo() {
        const { success, data } = await fetchData(coreApi.get(selectItem?.id))
        if (success) {
            setSystemInfo(data)
        }
    }

    useEffect(
        () =>
        {
            getSysInfo()
        },
        [selectItem]
    )

    async function getStudentsStateInfo() {
        const result = await fetchData(stateApi.getState())
        if (result) {
            setStateInfo(result)
        }
    }

    useEffect(() => {
        getStudentsStateInfo()
    }, [])

    async function getAttendanceSummary() {
        const { success, data } = await fetchData(irtsInfoApi.getAttendanceSummary(4))
        if (success) {
            setAttendanceSummaryData(data)
        }
    }

    async function getAttendanceTimeline(week = '') {
        const { success, data } = await fetchData(irtsInfoApi.getAttendanceTimeline(week))
        if (success) {
            setAttendanceTimelineData(data)
            if (!selectedAttendanceWeek && data?.selected_week) {
                setSelectedAttendanceWeek(data.selected_week)
            }
        }
    }

    useEffect(() => {
        getAttendanceSummary()
    }, [])

    useEffect(() => {
        if (attendanceSummaryData?.datas?.length) {
            getAttendanceTimeline(selectedAttendanceWeek)
        }
    }, [attendanceSummaryData, selectedAttendanceWeek])

    async function getProfessionSummary(degree='') {
        const { success, data } = await fetchData(scoreApi.getProfessionSummary(degree))
        if (success) {
            setProfessionSummary(data)
        }
    }

    useEffect(() => {
        getProfessionSummary(selectedDegree)
    }, [selectedDegree])

    async function getDegrees() {
        const { success, data } = await fetchData(degreeApi.get())
        if (success) {
            const sortedData = [...data].sort((a, b) => a.id - b.id)
            setDegrees(sortedData)
        }
    }

    useEffect(() => {
        getDegrees()
    }, [])

    async function getDailyChart() {
        const { success, data } = await fetchData(coreApi.getDailyChart(30))
        if (success) {
            setDailyChart(data)
        }
    }

    useEffect(() => {
        getDailyChart()
    }, [])

    async function getOnlineLessonSummary() {
        const { success, data } = await fetchData(onlineLessonApi.get())
        if (success) {
            setOnlineLessonSummary(data)
        }
    }

    useEffect(() => {
        getOnlineLessonSummary()
    }, [])

    async function getExamSummary() {
        const { success, data } = await fetchData(examTimeTableApi.getOrganizedSummary())
        if (success) {
            setExamSummary(data)
        }
    }

    useEffect(() => {
        getExamSummary()
    }, [])

    return (
        <Fragment>
            <div className='match-height'>
                <Row>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal
                            color='warning'
                            statTitle='Нийт хөтөлбөрийн тоо'
                            icon={<Book size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_profession}</h3>}
                        />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal
                            color='warning'
                            statTitle='Нийт хичээлийн тоо'
                            icon={<Book size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_studies}</h3>}
                        />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal
                            color='primary'
                            statTitle='Нийт багшийн тоо'
                            icon={<User size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_workers}</h3>}
                        />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal
                            color='danger'
                            statTitle='Нийт суралцагчдын тоо'
                            icon={<User size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_students}</h3>}
                        />
                    </Col>
                </Row>
                <Row className='match-height'>
                    <Col md='12'>
                        <Card>
                            <CardHeader>
                                <CardTitle tag={'h4'}>Системийн хандалтын мэдээлэл</CardTitle>
                                <UncontrolledDropdown className='chart-dropdown'>
                                <DropdownToggle color='' className='bg-transparent btn-sm border-0 p-50'>
                                    {selectItem?.name}
                                </DropdownToggle>
                                <DropdownMenu end>
                                    {date_list.map(item => (
                                        <DropdownItem className='w-100' key={item?.id} onClick={() => handleSysChange(item)}>
                                            {item.name}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                                </UncontrolledDropdown>
                            </CardHeader>
                            <CardBody className='statistics-body'>
                                <Row>
                                    <Col className='mb-2'>
                                        <div className='d-flex align-items-center'>
                                            <Avatar color={'light-primary'} icon={<TrendingUp size={24} />} className='me-2' />
                                            <div className='my-auto'>
                                                <h4 className='fw-bolder mb-0'>{systemInfo?.total}</h4>
                                                <CardText className='font-small-3 mb-0'>{'Системийн нийт хандалт'}</CardText>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col className='mb-2'>
                                        <div className='d-flex align-items-center'>
                                            <Avatar color={'light-primary'} icon={<Box size={24} />} className='me-2' />
                                            <div className='my-auto'>
                                                <h4 className='fw-bolder mb-0'>{systemInfo?.sis}</h4>
                                                <CardText className='font-small-3 mb-0'>{'Сургалтын удирдлагын хандалт'}</CardText>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col className='mb-2'>
                                        <div className='d-flex align-items-center'>
                                            <Avatar color={'light-primary'} icon={<Book size={24} />} className='me-2' />
                                            <div className='my-auto'>
                                                <h4 className='fw-bolder mb-0'>{systemInfo?.teacher}</h4>
                                                <CardText className='font-small-3 mb-0'>{'Багшийн систем хандалт'}</CardText>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col className='mb-2'>
                                        <div className='d-flex align-items-center'>
                                            <Avatar color={'light-primary'} icon={<User size={24} />} className='me-2' />
                                            <div className='my-auto'>
                                                <h4 className='fw-bolder mb-0'>{systemInfo?.student}</h4>
                                                <CardText className='font-small-3 mb-0'>{'Оюутны систем хандалт'}</CardText>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
            {/* Хандалтын идэвх — сүүлийн 30 хоног */}
            <div className='match-height'>
                <Row>
                    <Col md='12'>
                        <AccessActivityChart data={dailyChart} />
                    </Col>
                </Row>
            </div>
            <Row className='match-height'>
                {/* Оюутны төлөвийн байдал */}
                <Col md={6} className='d-flex flex-column'>
                    <StudentStateSummary data={stateInfo} />
                </Col>
                {/* Ирцийн ерөнхий мэдээлэл */}
                <Col md={6} className='d-flex flex-column'>
                    <AttendanceSummary data={attendanceSummaryData} />
                </Col>
            </Row>

            <Row className='match-height'>
                {/* Дүнгийн мэдээлэл */}
                <Col md={6} className='d-flex flex-column'>
                    <ProfessionScoreSummary data={professionSummary} degrees={degrees} selectedDegree={selectedDegree} onDegreeChange={setSelectedDegree} />
                </Col>
                {/* Ирцийн дэлгэрэнгүй мэдээлэл */}
                <Col md={6} className='d-flex flex-column'>
                    <AttendanceTimeline
                        selectedWeek={selectedAttendanceWeek}
                        onWeekChange={setSelectedAttendanceWeek}
                        schoolAttendance={attendanceTimelineData}
                    />
                </Col>
            </Row>
            <Row className='match-height mb-2'>
                {/* Шалгалтын мэдээлэл */}
                <Col md={6} className='d-flex flex-column'>
                    <ExamSummary data={examSummary} />
                </Col>
                {/* Цахим хичээл (багшийн систем) */}
                <Col md={6} className='d-flex flex-column'>
                    <OnlineLessonSummary data={onlineLessonSummary} />
                </Col>
            </Row>
        </Fragment>
    )
}

export default DashboardComponent
