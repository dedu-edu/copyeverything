import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Activity, CheckCircle, Users, FileText, UserMinus, UserX } from "react-feather"

import { Table, Card, CardBody, Row, Col, CardHeader, CardTitle, Button, Nav, NavItem, NavLink, TabContent } from 'reactstrap'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

import { downloadExcel, get_day, get_time, get_week } from '@src/utility/Utils'
import { CSelect } from '@src/components/CSelect'
import { useTranslation } from 'react-i18next'
import StatsHorizontal from '@src/@core/components/widgets/stats/StatsHorizontal'
import ActiveYearContext from '@src/utility/context/ActiveYearContext'
import { EveryDayReport } from './EveryDayReport'
import { EveryWeekReport } from './EveryWeekReport'
import useUpdateEffect from '@src/utility/hooks/useUpdateEffect'

export default function AttendenceReport() {

    const { active_week: systemActiveWeek } = useContext(ActiveYearContext)

    const initiaSelectlValues = {
        department: '',
        teacher: '',
        group: '',
        day: [6, 7].includes(new Date().getDay()) ? "" : new Date().getDay(),
        time: '',
        lesson: '',
        school: '',
        active_week: systemActiveWeek,
    };

    const nav_menus = [
        {
            active_id: 1,
            name: 'Өдөр тутам',
        },
        {
            active_id: 2,
            name: 'Долоо хоногоор',
        },
    ]
    const { t } = useTranslation();

    const { fetchData, Loader, isLoading } = useLoader({ isFullScreen: false })
    const { fetchData: tableFetchData, isLoading: mainIsLoading } = useLoader({ isFullScreen: false })
    const { fetchData: mainTableFetchData, isLoading: is_loading } = useLoader({ isFullScreen: false })

    const [datas, setDatas] = useState([])
    const [weekDatas, setWeekDatas] = useState([])

    const [lessonOptionDatas, setLessonOptionDatas] = useState([])
	const [teacherOptionDatas, setTeacherOptionDatas] = useState([])
	const [groupOptionDatas, setGroupOptionDatas] = useState([])
    const [selectedValue, setSelectValue] = useState(initiaSelectlValues);
    const [staticData, setStaticData] = useState({})
    const [active, setActive] = useState(1)

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
        async function getGroupDatas() {
            const { success, data } = await fetchData(lessonsScheduleApi.getGroup(selectedValue.lesson, selectedValue.teacher))
            if(success) {
                setGroupOptionDatas(data)
            }
        }
        getGroupDatas();

    }, [selectedValue.lesson, selectedValue.teacher])

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
        getDatas()
    }, [selectedValue])

    const getDatas = async () => {
        const { teacher, lesson, active_week, day, time, group } = selectedValue
        const { success, data } = await mainTableFetchData(irtsInfoApi.getGroupReport(lesson, teacher, active_week, day, time, group))
        if (success && data) {
            setDatas(data?.datas)
            setStaticData(data?.totals)
        }
    }

    const getWeekDatas = async () => {
        const { active_week, group } = selectedValue
        const { success, data } = await tableFetchData(irtsInfoApi.getGroupWeekReport(active_week, group))
        if (success && data) {
            setWeekDatas(data)
        }
    }

    useUpdateEffect(() => {
        getWeekDatas()
    }, [selectedValue.active_week, selectedValue.group])

    useUpdateEffect(() => {
        setSelectValue(current => {
            return {
                ...current,
                active_week: active === 1 ? systemActiveWeek : "",
            }
        })
    }, [active])

    function handleDownload() {
        if(active === 1) {
            const excelColumns = {
                "name": "Дамжаа",
                "profession_name": "Мэргэжил",
                "level": "Курс",
                "active_student": "Нийт сурагч",
                "irsen_count": "Ирсэн",
                "sick_count": "Өвчтэй",
                "chuluu_count": "Чөлөөтэй",
                "tas_count": "Тасалсан",
            }
            downloadExcel(datas, excelColumns, `irts_info`)
        } else {

            let cDatas = weekDatas?.map((data) => {
                data["sick_student"] = data?.sick_students?.join(", ")
                data["chuluu_student"] = data?.chuluu_students?.join(", ")
                data["tas_student"] = data?.tas_students?.join(", ")

                return data
            })
            const excelColumns = {
                "name": "Дамжаа",
                "student_count": "Нийт сурагч",
                "sick_student": "Өвчтэй /3 хоног/",
                "chuluu_student": "Чөлөөтэй /5 хоног/",
                "tas_student": "Тасалсан /6 цаг/",
            }
            downloadExcel(cDatas, excelColumns, `Долоо_хоногоор_ирцийн_мэдээ`)
        }
    }

    const toggle = (active_id) => {
        setActive(active_id)
    }

    return (
        <Fragment>
            {(isLoading || mainIsLoading || is_loading) && Loader}
            <Card>
                <Nav tabs>
                    {
                        nav_menus.map((menu, idx) => {
                            return(
                                <NavItem key={idx}>
                                    <NavLink
                                        active={active == menu.active_id}
                                        onClick={() => {
                                            toggle(menu.active_id)
                                        }}
                                    >
                                        {menu.name}
                                    </NavLink>
                                </NavItem>
                            )
                        })
                    }
                </Nav>
            </Card>
            {
                active === 1 &&
                <Row className='px-15'>
                    <Col md={4} sm={3}>
                        <StatsHorizontal
                            color='success'
                            statTitle='Нийт суралцагч'
                            icon={<Users size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{staticData?.total_student || 0}</h3>}
                        />
                    </Col>
                    <Col md={2} sm={3}>
                        <StatsHorizontal
                            color='success'
                            statTitle='Ирсэн'
                            icon={<Activity size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{staticData?.total_irsen || 0}</h3>}
                        />
                    </Col>
                    <Col md={2} sm={3}>
                        <StatsHorizontal
                            color='danger'
                            statTitle='Тасалсан'
                            icon={<UserX size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{staticData?.total_tas || 0}</h3>}
                        />
                    </Col>
                    <Col md={2} sm={3}>
                        <StatsHorizontal
                            color='info'
                            statTitle='Чөлөөтэй'
                            icon={<UserMinus size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{staticData?.total_chuluu || 0}</h3>}
                        />
                    </Col>
                    <Col md={2} sm={3}>
                        <StatsHorizontal
                            color='warning'
                            statTitle='Өвчтэй'
                            icon={<CheckCircle size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{staticData?.total_sick || 0}</h3>}
                        />
                    </Col>
                </Row>
            }
            <TabContent className='py-50' activeTab={active}>
                <Card>
                    <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                        <CardTitle tag="h4">{t("Суралцагчийн ирцийн мэдээ")}</CardTitle>
                            <div className='d-flex flex-wrap mt-md-0 mt-1 gap-1'>
                                <Button
                                    color='primary'
                                    onClick={() => {handleDownload()}}
                                    disabled={active === 1 ? !datas?.length : !weekDatas?.length}
                                >
                                    <FileText size={16}/> Excel татах
                                </Button>
                            </div>
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
                        {
                            active === 1 &&
                            <>
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
                            </>
                        }
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
                    </Row>
                    <CardBody className="border-bottom justify-content-center">
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            {
                                active === 1
                                ?
                                    <EveryDayReport datas={datas} />
                                :
                                    <EveryWeekReport datas={weekDatas} />
                            }
                        </div>
                    </CardBody>
                </Card>
            </TabContent>
        </Fragment>
    )
}