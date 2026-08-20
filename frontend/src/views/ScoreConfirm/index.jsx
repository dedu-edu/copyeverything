import { useContext, useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, Row, Col, Label, Button, Nav, NavItem, NavLink, TabContent, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { toast } from 'react-toastify';
import { FileText, Book, Users, User, UserX, TrendingUp, Award } from 'react-feather'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import SchoolContext from '@context/SchoolContext'
import ActiveYearContext from '@context/ActiveYearContext'
import { ReactSelectStyles, examType, generateLessonYear } from '@utils'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'

export default function ScoreConfirm() {
    const { t } = useTranslation()
    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)
    const { isLoading, fetchData } = useLoader({})

    const examApi = useApi().timetable.exam
    const confirmScoreApi = useApi().timetable.confirmscore
    const seasonApi = useApi().settings.season
    const schoolApi = useApi().hrms.subschool

    const nav_menus = [
        { active_id: 0, name: t('Улирлын шалгалт') },
        { active_id: 1, name: t('1-р давтан') },
        { active_id: 2, name: t('2-р давтан') },
    ]
    const [active, setActive] = useState(0)
    const isRepeatTab = active === 1 || active === 2

    const [rows, setRows] = useState([{}])
    const stats = rows[0] || {}

    const [yearOption, setYear] = useState([])
    const [seasons, setSeasons] = useState([])
    const [schools, setSchools] = useState([])
    const [filters, setFilters] = useState({
        lesson_year: '',
        lesson_season: '',
        stype: '',
        status: '',
        school: ''
    })

    const [modal, setModal] = useState(false)
    const toggleModal = () => setModal(!modal)

    const [successModal, setSuccessModal] = useState(false)
    const toggleSuccessModal = () => setSuccessModal(!successModal)

    const [pendingUpdateStats, setPendingUpdateStats] = useState({})
    const [lastUpdatedStats, setLastUpdatedStats] = useState({})

    const examStatuses = useMemo(() => ([
        { id: 1, name: t('Нөхөн шалгалт') },
        { id: 2, name: t('Шууд тооцох шалгалт') },
        { id: 3, name: t('Давтан шалгалт') },
        { id: 4, name: t('Бусад') },
    ]), [t])

    const examTypes = useMemo(() => examType() || [], [])

    async function getSeasons() {
        const { success, data } = await fetchData(seasonApi.get())
        if (success) setSeasons(data)
    }

    async function getSchools() {
        const { success, data } = await fetchData(schoolApi.get())
        if (success) setSchools(data)
    }

    async function getCounts() {
        const { success, data } = await fetchData(
            examApi.count(
                filters.stype,
                filters.lesson_year,
                filters.lesson_season,
                isRepeatTab ? '' : filters.school,
                active,
                filters.status
            )
        )
        setRows(success ? [data] : [{}])
    }

    const handleConfirmClick = async () => {
        if (!isRepeatTab && !filters.school) {
            toast.error(t('Сургууль сонгоно уу'))
            return
        }
        if (!filters.lesson_year || !filters.lesson_season) {
            toast.error(t('Жил, улирал сонгоно уу'))
            return
        }

        const { success, data } = await fetchData(
            examApi.count(
                '',
                filters.lesson_year,
                filters.lesson_season,
                isRepeatTab ? '' : filters.school,
                active,
                ''
            )
        )
        if (success) {
            setPendingUpdateStats(data || {})
        } else {
            setPendingUpdateStats(stats)
        }
        toggleModal()
    }

    const handleConfirm = async () => {
        toggleModal()
        const { success, data } = await fetchData(
            confirmScoreApi.post(
                filters.lesson_year,
                filters.lesson_season,
                isRepeatTab ? '' : filters.school,
                active
            )
        )
        if (success) {
            toast.success(data?.message)
            setLastUpdatedStats(data?.stats || {})
            setSuccessModal(true)
            getCounts()
        } else {
            toast.error(data?.message)
        }
    }

    const toggle = (active_id) => {
        if (active !== active_id) {
            setFilters(current => ({ ...current, stype: '', status: '' }))
            setActive(active_id)
        }
    }

    const statCards = [
        { title: t('Шалгалтын тоо'), value: stats.exam_count, icon: <FileText size={20} />, color: 'primary' },
        { title: t('Хичээлийн тоо'), value: stats.lesson_count, icon: <Book size={20} />, color: 'warning' },
        { title: t('Ангийн тоо'), value: stats.group_count, icon: <Users size={20} />, color: 'info' },
        { title: t('Оюутны тоо'), value: stats.student_count, icon: <User size={20} />, color: 'success' },
        { title: t('Унасан оюутны тоо'), value: stats.unapproved_student_count, icon: <UserX size={20} />, color: 'danger' },
        { title: t('Амжилт'), value: stats.success, icon: <TrendingUp size={20} />, color: 'primary' },
        { title: t('Чанар'), value: stats.quality, icon: <Award size={20} />, color: 'warning' },
    ]

    useEffect(() => {
        setYear(generateLessonYear(5))
        getSeasons()
        getSchools()
    }, [])

    useEffect(() => {
        if (!cyear_name || !cseason_id) return
        setFilters(current => ({
            ...current,
            lesson_year: cyear_name,
            lesson_season: cseason_id
        }))
    }, [cyear_name, cseason_id])

    useEffect(() => {
        if (!filters.lesson_year || !filters.lesson_season) return
        // if (!isRepeatTab && !filters.school) return
        getCounts()
    }, [
        filters.school,
        filters.stype,
        filters.status,
        filters.lesson_year,
        filters.lesson_season,
        active
    ])

    const canShowConfirm = isRepeatTab || filters.school
    const isConfirmed = stats.is_confirmed

    return (
        <Card>
            <CardHeader className="border-bottom">
                <CardTitle tag="h4">{t('Дүн баталгаажуулалт')}</CardTitle>
                <div className="d-flex flex-wrap mt-md-0 mt-1">
                    {(!isRepeatTab && filters.school && isConfirmed) || (isRepeatTab && isConfirmed) ? (
                        <span className="fw-bold">
                            {t('Баталгаажуулсан огноо')}: {stats.confirm_date}
                        </span>
                    ) : (
                        canShowConfirm && (
                            <Button color="primary" size="sm" onClick={handleConfirmClick}>
                                {t('Дүн баталгаажуулах')}
                            </Button>
                        )
                    )}
                </div>
            </CardHeader>

            <Nav tabs className="px-1 pt-1">
                {nav_menus.map((menu, idx) => (
                    <NavItem key={idx}>
                        <NavLink
                            active={active === menu.active_id}
                            onClick={() => toggle(menu.active_id)}
                        >
                            {menu.name}
                        </NavLink>
                    </NavItem>
                ))}
            </Nav>

            <TabContent activeTab={active}>
                <Row className="p-1">
                    {!isRepeatTab && (
                        <Col md={4}>
                            <Label>{t('Сургууль')}</Label>
                            <Select
                                classNamePrefix="select"
                                isClearable
                                className="react-select"
                                placeholder={t('-- Бүгд--')}
                                options={schools}
                                styles={ReactSelectStyles}
                                value={schools.find(x => x.id === filters.school) || null}
                                getOptionValue={option => option.id}
                                getOptionLabel={option => option.name}
                                onChange={(val) =>
                                    setFilters(current => ({ ...current, school: val?.id || '' }))
                                }
                            />
                        </Col>
                    )}
                    <Col md={4}>
                        <Label>{t('Хичээлийн жил')}</Label>
                        <Select
                            classNamePrefix="select"
                            className="react-select"
                            options={yearOption}
                            styles={ReactSelectStyles}
                            value={yearOption.find(x => x.id === filters.lesson_year) || null}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name}
                            onChange={(val) =>
                                setFilters(current => ({ ...current, lesson_year: val?.id || '' }))
                            }
                        />
                    </Col>
                    <Col md={4}>
                        <Label>{t('Хичээлийн улирал')}</Label>
                        <Select
                            classNamePrefix="select"
                            className="react-select"
                            options={seasons}
                            styles={ReactSelectStyles}
                            value={seasons.find(x => x.id === filters.lesson_season) || null}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.season_name}
                            onChange={(val) =>
                                setFilters(current => ({ ...current, lesson_season: val?.id || '' }))
                            }
                        />
                    </Col>
                    <Col md={4}>
                        <Label>{t('Шалгалтын төрөл')}</Label>
                        <Select
                            classNamePrefix="select"
                            isClearable
                            className="react-select"
                            placeholder={t('-- Бүгд--')}
                            options={examTypes}
                            value={examTypes.find(x => x.id === filters.stype) || null}
                            styles={ReactSelectStyles}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name}
                            onChange={(val) =>
                                setFilters(current => ({ ...current, stype: val?.id || '' }))
                            }
                        />
                    </Col>
                    {isRepeatTab && (
                        <Col md={4}>
                            <Label>{t('Шалгалтын төлөв')}</Label>
                            <Select
                                classNamePrefix="select"
                                isClearable
                                className="react-select"
                                placeholder={t('-- Бүгд--')}
                                options={examStatuses}
                                value={examStatuses.find(x => x.id === filters.status) || null}
                                styles={ReactSelectStyles}
                                getOptionValue={option => option.id}
                                getOptionLabel={option => option.name}
                                onChange={(val) =>
                                    setFilters(current => ({ ...current, status: val?.id || '' }))
                                }
                            />
                        </Col>
                    )}
                </Row>

                <CardBody>
                    <Row>
                        {statCards.map((card, idx) => (
                            <Col lg="3" md="4" sm="6" className="mb-2" key={idx}>
                                <div className="border rounded p-1 h-100 bg-white">
                                    <StatsHorizontal
                                        color={card.color}
                                        statTitle={card.title}
                                        icon={card.icon}
                                        renderStats={
                                            <h3 className="fw-bolder mb-75">
                                                {card.value ?? 0}
                                            </h3>
                                        }
                                    />
                                </div>
                            </Col>
                        ))}
                    </Row>
                </CardBody>
            </TabContent>

            <Modal isOpen={modal} toggle={toggleModal} centered>
                <ModalHeader toggle={toggleModal}>{t('Дүн баталгаажуулалт')}</ModalHeader>
                <ModalBody>
                    {pendingUpdateStats.lesson_count || 0} хичээлийн, {pendingUpdateStats.group_count} ангийн, {pendingUpdateStats.student_count || 0} оюутны шалгалтын дүнг баталгаажуулах гэж байна. Та итгэлтэй байна уу?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleConfirm}>
                        {t('Тийм')}
                    </Button>
                    <Button color="secondary" onClick={toggleModal}>
                        {t('Үгүй')}
                    </Button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={successModal} toggle={toggleSuccessModal} centered>
                <ModalHeader toggle={toggleSuccessModal}></ModalHeader>
                <ModalBody>
                    <p>{t('Дүн баталгаажуулалт амжилттай.')}</p>
                    <ul className="list-unstyled">
                        <li><strong>{t('Шалгалтын тоо')}:</strong> {lastUpdatedStats.exam_count || 0}</li>
                        <li><strong>{t('Хичээлийн тоо')}:</strong> {lastUpdatedStats.lesson_count || 0}</li>
                        <li><strong>{t('Ангийн тоо')}:</strong> {lastUpdatedStats.group_count || 0}</li>
                        <li><strong>{t('Оюутны тоо')}:</strong> {lastUpdatedStats.student_count || 0}</li>
                    </ul>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={toggleSuccessModal}>
                        {t('Хаах')}
                    </Button>
                </ModalFooter>
            </Modal>
        </Card>
    )
}
