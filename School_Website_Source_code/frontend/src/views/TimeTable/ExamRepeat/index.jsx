import React, { Fragment, useState, useEffect, useContext, useRef } from 'react'

import { Col, Button, Input, Card, CardHeader, CardTitle, Row, Spinner, Label, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'

import { useTranslation } from "react-i18next"

import { ChevronDown, Plus, Search } from "react-feather"

import Select from 'react-select'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import DataTable from 'react-data-table-component'

import { getPagination, get_EXAM_STATUS, ReactSelectStyles } from '@utils'

import { getColumns } from "./helpers"
import ElementToPrint, { printElement } from "./helpers/ElementToPrint"
import moment from 'moment'
import AddModal from './Add'
import classNames from "classnames"
import ReactDOM from 'react-dom';
import DownloadScore from './DownloadScore'


function ExamRepeatTabContent({
    tabId,
    title,
    user,
    school_id,
    teachers,
    teacherLoading,
    unitedScoreRanges,
    handlePrint,
    handleDownloadScore
}) {
    const { t } = useTranslation()
    const reExamApi = useApi().timetable.re_exam

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const default_page = [10, 15, 50, 75, 100]

    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [currentPage, setCurrentPage] = useState(1)
    const [status_id, setStatusId] = useState('')
    const [selectedTeacher, setSelectedTeacher] = useState('')
    const [searchValue, setSearchValue] = useState("")
    const [datas, setDatas] = useState([])

    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Modal
    const [modal, setModal] = useState(false);
    const [editId, setEditId] = useState('')
    const [edit_data, setEditData] = useState('')

    const { isLoading, fetchData } = useLoader({})
    const [statusOption] = useState(get_EXAM_STATUS().filter(item => item.name != 'Нөхөн шалгалт'))

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1)
    }


    /* Нэмэх модал setState функц */
    const handleModal = () => {
        setModal(!modal)
    }

    /** Засах модал */
    function handleEditModal(data = {}) {
        setEditId('')
        setEditData([])
        if (data && Object.keys(data).length > 0) {
            setEditId(data?.id)
            setEditData(data)
        }
        handleModal()
    }

    async function handleDelete(id) {
        const { success } = await fetchData(reExamApi.delete(id))
        if (success) {
            getDatas()
        }
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    /* Жагсаалт сорт хийж байгаа функц */
    function handleSort(column, sort) {
        setSort(sort === 'asc' ? column.header : '-' + column.header)
    }

    // API Холбож дата авчирна
    async function getDatas() {
        const { success, data } = await fetchData(
            reExamApi.get(rowsPerPage, currentPage, sortField, searchValue, status_id, selectedTeacher, Number(tabId))
        )
        if (success) {
            setDatas(data?.results || [])
            setTotalCount(data?.count || 0)
        }
    }

    useEffect(() => {
        getDatas()
    }, [rowsPerPage, currentPage, sortField, status_id, selectedTeacher])

    function handleSearch() {
        getDatas()
    }

    const handleFilter = (e) => {
        setSearchValue(e.target.value.trimStart())
    }

    const hasCreatePermission = Object.keys(user).length > 0 && user?.permissions?.includes('lms-timetable-examrepeat-create')

    return (
        <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                <CardTitle tag="h4">{t(title)}</CardTitle>
                <div className='d-flex flex-wrap mt-md-0 mt-1'>
                    <Button color='primary' disabled={!hasCreatePermission} onClick={() => handleEditModal()}>
                        <Plus size={15} />
                        <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                    </Button>
                </div>
            </CardHeader>
            <Row className="d-flex mx-0 mt-1">
                <Col md={4} className='mb-1'>
                    <Label className="form-label me-1" for={`status-${tabId}`}>
                        {t('Шалгалтын төлөв')}
                    </Label>
                    <Select
                        name="status"
                        id={`status-${tabId}`}
                        classNamePrefix='select'
                        isClearable
                        className='react-select'
                        isLoading={isLoading}
                        options={statusOption || []}
                        placeholder={t('-- Сонгоно уу --')}
                        noOptionsMessage={() => t('Хоосон байна')}
                        styles={ReactSelectStyles}
                        value={status_id ? statusOption.find((c) => c.id === status_id) : null}
                        onChange={(val) => setStatusId(val?.id || '')}
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => option.name}
                    />
                </Col>
                <Col md={4}>
                    <Label>{t('Хянах багш')}</Label>
                    <Select
                        classNamePrefix='select'
                        isClearable
                        className={classNames('react-select')}
                        isLoading={teacherLoading}
                        placeholder={t('-- Сонгоно уу --')}
                        options={teachers || []}
                        value={teachers.find((c) => c.id === selectedTeacher) || null}
                        noOptionsMessage={() => t('Хоосон байна')}
                        onChange={(val) => setSelectedTeacher(val ? val.id : '')}
                        styles={ReactSelectStyles}
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => `${option.rank_name || ''} ${option?.full_name || ''}`}
                    />
                </Col>
            </Row>
            <Row className='justify-content-between mx-0 mb-1'>
                <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                    <Col md={2} sm={3} className='pe-1'>
                        <Input
                            type='select'
                            bsSize='sm'
                            style={{ height: "30px" }}
                            value={rowsPerPage}
                            onChange={handlePerPage}
                        >
                            {default_page.map((page, idx) => (
                                <option key={idx} value={page}>{page}</option>
                            ))}
                        </Input>
                    </Col>
                    <Col md={10} sm={3}>
                        <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                    </Col>
                </Col>
                <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
                    <Input
                        className='dataTable-filter mb-50'
                        type='text'
                        bsSize='sm'
                        id={`search-input-${tabId}`}
                        placeholder={t('Хайх')}
                        value={searchValue}
                        onChange={handleFilter}
                        onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    />
                    <Button size='sm' className='ms-50 mb-50' color='primary' onClick={handleSearch}>
                        <Search size={15} />
                    </Button>
                </Col>
            </Row>
            {isLoading ? (
                <div className="my-2 text-center" sm={12}>
                    <Spinner size='sm' />
                    <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                </div>
            ) : (
                <div className='react-dataTable react-dataTable-selectable-rows'>
                    <DataTable
                        noHeader
                        pagination
                        className='react-dataTable'
                        progressPending={isLoading}
                        progressComponent={<div className='my-2'><h5>{t('Түр хүлээнэ үү')}...</h5></div>}
                        noDataComponent={<div className="my-2"><h5>{t('Өгөгдөл байхгүй байна')}</h5></div>}
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage, datas, handleEditModal, handleDelete, user, handlePrint, handleDownloadScore)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            )}
            {modal && (
                <AddModal
                    open={modal}
                    handleModal={handleModal}
                    refreshDatas={getDatas}
                    handleEdit={handleEditModal}
                    editId={editId}
                    editData={edit_data}
                    tabId={tabId}
                />
            )}
        </Card>
    )
}

export default function ExamRepeat() {
    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const [activeTab, setActiveTab] = useState('1')
    const [teachers, setTeachers] = useState([])
    const [studentData, setStudentDatas] = useState(null)
    const [downloadModal, setDownloadModal] = useState(false)

    const { isLoading: teacherLoading, fetchData: teacherFetch } = useLoader({})
    const { fetchData: fetchDataToPrint } = useLoader({})
    const { fetchData } = useLoader({})

    const isPrintButtonPressed = useRef(false)
    const [element_to_print, setElementToPrint] = useState(null)
    const [data_to_print, setDataToPrint] = useState(null)
    const [selected_group_names, setSelectedGroupNames] = useState('')
    const [united_score_ranges, setUnitedScoreRanges] = useState(null)

    const scoreListApi = useApi().settings.score
    const scoreApi = useApi().score.print
    const teacherListApi = useApi().hrms.teacher
    const reExamApi = useApi().timetable.re_exam


    /* subschool id явуулж Багшийн жагсаалт авах */
    async function getTeachers() {
        const { success, data } = await teacherFetch(teacherListApi.getSchoolFilter(school_id))
        if (success) {
            setTeachers(data)
        }
    }

    async function getUnitedScoreRanges() {
        const ranges = {}
        const { success, data } = await fetchDataToPrint(scoreListApi.get())

        if (success && data) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i]
                if (!item.assesment) continue
                const assessment = item.assesment.replace('+', '')
                if (!ranges.hasOwnProperty(assessment)) ranges[assessment] = {}

                if (ranges[assessment].score_min) {
                    if (ranges[assessment].score_min > item.score_min) {
                        ranges[assessment].score_min = item.score_min
                    }
                } else ranges[assessment]['score_min'] = item.score_min

                if (ranges[assessment].score_max) {
                    if (ranges[assessment].score_max < item.score_max) {
                        ranges[assessment].score_max = item.score_max
                    }
                } else ranges[assessment]['score_max'] = item.score_max
            }
        }

        setUnitedScoreRanges(ranges)
    }

    useEffect(() => {
        getTeachers()
        getUnitedScoreRanges()
    }, [school_id])

    useEffect(() => {
        if (isPrintButtonPressed?.current && data_to_print) {
            setElementToPrint(<ElementToPrint data_to_print={data_to_print} setElementToPrint={setElementToPrint} />)
            isPrintButtonPressed.current = false
        }
    }, [data_to_print])

    useEffect(() => {
        if (element_to_print) {
            const group_names_array = Object.values(selected_group_names || {})
            let group_names = ''
            if (group_names_array.length > 0) group_names = group_names_array[0]
            if (group_names_array.length > 1) group_names += ' and more'
            printElement('element_to_print', group_names)
        }
    }, [element_to_print, selected_group_names])

    async function getDataToPrint(lesson_id, selectedStudent) {
        if (!lesson_id) return
        const { success, data } = await fetchDataToPrint(scoreApi.getByReExam(lesson_id, selectedStudent))

        if (success && data?.length) {
            const dataToPrint = {
                teacher_org_position: data[0].teacher_org_position || '',
                teacher_name: data[0].teacher_name || '',
                teacher_score_updated_at: data[0].teacher_score_updated_at ? moment(data[0].teacher_score_updated_at).format('YYYY-MM-DD HH:mm:ss') : '',
                exam_committee: data[0].exam_committee || [],
                ded_confirm_date: data[0].exam_committee[0].ded_confirm_date ? moment(data[0].exam_committee[0].ded_confirm_date).format('YYYY-MM-DD HH:mm:ss') : '',
                lesson_year: data[0].lesson_year || '',
                lesson_season: data[0].lesson_season || '',
                lesson_name: data[0].lesson_name || '',
                lesson_credit: data[0].lesson_kredit || '',
                lesson_students: data.map(item => ({
                    full_name: item.full_name || '',
                    teacher_score: item.teacher_score || '',
                    exam_score: item.exam_score || '',
                    letter: item.grade_letter || '',
                    total: item.total || '',
                    student_confirm_date: item?.student_confirm_date || '',
                }))
            }

            dataToPrint['total_students_count'] = data.length
            dataToPrint['scored_students_count'] = data.filter(item => item.score).length

            const sr = united_score_ranges
            dataToPrint['a_students_count'] = data.filter(item => (sr?.A?.score_min ?? 0) <= item.total && item.total <= (sr?.A?.score_max ?? 0)).length
            dataToPrint['b_students_count'] = data.filter(item => (sr?.B?.score_min ?? 0) <= item.total && item.total <= (sr?.B?.score_max ?? 0)).length
            dataToPrint['c_students_count'] = data.filter(item => (sr?.C?.score_min ?? 0) <= item.total && item.total <= (sr?.C?.score_max ?? 0)).length
            dataToPrint['d_students_count'] = data.filter(item => (sr?.D?.score_min ?? 0) <= item.total && item.total <= (sr?.D?.score_max ?? 0)).length
            dataToPrint['f_students_count'] = data.filter(item => (sr?.F?.score_min ?? 0) <= item.total && item.total <= (sr?.F?.score_max ?? 0)).length

            if (dataToPrint['total_students_count'] > 0) {
                dataToPrint['success'] = (((dataToPrint['a_students_count'] + dataToPrint['b_students_count'] + dataToPrint['c_students_count']) * 100) / dataToPrint['total_students_count']).toFixed(0) + '%'
                dataToPrint['quality'] = (((dataToPrint['a_students_count'] + dataToPrint['b_students_count']) * 100) / dataToPrint['total_students_count']).toFixed(0) + '%'
            } else {
                dataToPrint['success'] = ''
                dataToPrint['quality'] = ''
            }

            setDataToPrint(dataToPrint)
            setSelectedGroupNames(selectedStudent)
        }
    }

    function handlePrint(id, selectedStudent) {
        getDataToPrint(id, selectedStudent)
        isPrintButtonPressed.current = true
    }

    const handleDownloadScore = async (rowDatas) => {
        setDownloadModal(true)
        if (rowDatas?.id) {
            const { success, data } = await fetchData(reExamApi.getStudentExamScore(rowDatas.id, rowDatas.lesson || ''))
            if (success) {
                setStudentDatas(data)
            }
        }
    }

    return (
        <Fragment>
            <Nav tabs>
                <NavItem>
                    <NavLink active={activeTab === '1'} onClick={() => setActiveTab('1')}>
                        {t('1-р давтан шалгалт')}
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink active={activeTab === '2'} onClick={() => setActiveTab('2')}>
                        {t('2-р давтан шалгалт')}
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    {activeTab === '1' && (
                        <ExamRepeatTabContent
                            tabId="1"
                            title="1-р давтан шалгалтын хуваарь"
                            user={user}
                            school_id={school_id}
                            teachers={teachers}
                            teacherLoading={teacherLoading}
                            unitedScoreRanges={united_score_ranges}
                            handlePrint={handlePrint}
                            handleDownloadScore={handleDownloadScore}
                        />
                    )}
                </TabPane>
                <TabPane tabId="2">
                    {activeTab === '2' && (
                        <ExamRepeatTabContent
                            tabId="2"
                            title="2-р давтан шалгалтын хуваарь"
                            user={user}
                            school_id={school_id}
                            teachers={teachers}
                            teacherLoading={teacherLoading}
                            unitedScoreRanges={united_score_ranges}
                            handlePrint={handlePrint}
                            handleDownloadScore={handleDownloadScore}
                        />
                    )}
                </TabPane>
            </TabContent>
            {downloadModal && (
                <DownloadScore
                    open={downloadModal}
                    handleModal={() => setDownloadModal(false)}
                    studentDatas={studentData}
                />
            )}
            {element_to_print && ReactDOM.createPortal(element_to_print, document.body)}
        </Fragment>
    )
}
