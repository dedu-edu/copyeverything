import { Fragment, useState, useEffect, useContext } from "react"

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, Badge, Modal, ModalHeader, ModalBody, Alert } from "reactstrap"

import { useTranslation } from "react-i18next"

import { AlertCircle, ChevronDown, Plus, Search } from "react-feather"

import { useNavigate } from "react-router-dom"
import DataTable from "react-data-table-component"
import { useForm, Controller } from "react-hook-form";

import useApi from '@hooks/useApi';
import useModal from "@hooks/useModal";
import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import Select from 'react-select'
import { ReactSelectStyles, examType } from '@utils'

import { getPagination } from '@utils'

import { getColumns } from "./helpers"

import Addmodal from './Add'
// import Editmodal from "./Edit"
import classNames from 'classnames';
import DownloadScore from "./DownloadScore"

// #region print score info
import ElementToPrint from "./helpers/ElementToPrint"
import moment from "moment"
import { stableStylesPrintElement } from "@src/utility/Utils"
// #endregion

const SORIL_EXAM_TYPE = 1
const AMAN_EXAM_TYPE = 2
const isSorilType = (stype) => Number(stype) === SORIL_EXAM_TYPE
const isAmanType = (stype) => Number(stype) === AMAN_EXAM_TYPE

const ExamTimeTable = () => {
	const navigate = useNavigate()

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { showWarning } = useModal()

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const default_page = [10, 15, 50, 75, 100]

    // select input-ийн Сонголтууд
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [groups, setGroups] = useState([]);

    // songoson utguud

    const [selectedTeacher, setSelectedTeacher] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [grouupId, setGroupId] = useState('')
    const [subGroup, setSubGroup] = useState('')
    const [levelGroup, setLevelGroup] = useState('')

    // selected group { group: ..., name: ... }. group is ID
    const [selectedIds, setSelectedIds] = useState({})
    // const [selectedLesson, setSelectedLesson] = useState('')


    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");

    const [editId, setEditId] = useState('')
    const [edit_data, setEditData] = useState({})
    const [confirm_status, setConfirmStatus] = useState([])
    const [datas, setDatas] = useState([]);

    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)
    const [ studentData, setStudentDatas ] = useState([]);

    // loader
    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})
    const { isLoading: teacherLoading, fetchData: teacherFetch } = useLoader({})
    const { isLoading: groupLoading, fetchData: groupFetch } = useLoader({})
    const { Loader: dataToPrintLoader, isLoading: dataToPrintIsLoading, fetchData: fetchDataToPrint } = useLoader({})

    // Api
    const examApi = useApi().timetable.exam
    const teacherListApi = useApi().hrms.teacher
    const scoreApi = useApi().score.print
    const roomApi = useApi().timetable.room
    const groupApi = useApi().print.score
	const scoreListApi = useApi().settings.score

    // Modal
    const [modal, setModal] = useState(false);
    const [groupModal, setGroupModal] = useState(false);

    // #region print score info
    const [data_to_print, setDataToPrint] = useState(null);
    const [selected_group_names, setSelectedGroupNames] = useState('')
    const [united_score_ranges, setUnitedScoreRanges] = useState(null)
    const [change_student, setChangeStudent] = useState([])
    const elementToPrintId = 'element_to_print'
    // #endregion

    const [downloadModal, setDownloadModal] = useState(false);
    const { control } = useForm({});

    const toggleDownloadModal = () => setDownloadModal(!downloadModal)
    /* Нэмэх модал setState функц */
    const handleModal = () =>{
        setModal(!modal)

        if (modal) {
            setEditId('')
            setEditData({})
        }
    }

    /* Жагсаалт дата авах функц */
    async function getDatas() {
        const { success, data } = await allFetch(examApi.get(rowsPerPage, currentPage, sortField, searchValue, selectedType, selectedTeacher))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getTeachers();
        // getRoom();
        // getGroups()
        // getLessonOption()
        getUnitedScoreRanges()
    },[])

    /* subschool id явуулж Багшийн жагсаалт авах */
    async function getTeachers()
    {
        // getLessons();
        const { success, data } = await teacherFetch(teacherListApi.getSchoolFilter(school_id))
        if(success) {
            setTeachers(data)
        }
    }

    // өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList(''))
        if(success) {
            setRooms(data)
        }
    }

    async function getGroups() {
        const { success, data } = await groupFetch(groupApi.getGroupList(school_id))
        if(success) {
            setGroups(data)
        }
    }

    // Хичээлийн жагсаалт
    // async function getLessonOption() {
    //     const { success, data } = await fetchData(lessonApi.getList())
    //     if(success) {
    //         setLessons(data)
    //     }
    // }

    useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [rowsPerPage, currentPage, sortField, searchValue, selectedType, selectedTeacher])


    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    async function handleDelete(id) {
		const { success, data } = await fetchData(examApi.delete(id));
		if (success) {
			getDatas();
		}
	}

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    /** Засах модал */
    function handleEditModal(data) {
        setEditId(data?.id)
        setEditData(data)
        handleModal()
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    // Шалгалт үүсгэх
    async function createExam() {
        const { success } = await allFetch(examApi.create())
        if (success) {
            getDatas()
        }
    }

    // #region print score info
    // to get united ranges without depending on sign "+" and duplicated assesment letters
    async function getUnitedScoreRanges() {
        const ranges = {}
        const { success, data } = await fetchDataToPrint(scoreListApi.get())

        if (success) {
            for (let i=0; i<data.length; i++) {
                const item = data[i]
                const assessment = item?.assesment.replace('+','')
                if (!ranges.hasOwnProperty(assessment)) ranges[assessment] = {}

                if (ranges[assessment].score_min) {
                    if (ranges[assessment].score_min > item?.score_min) {
                        ranges[assessment].score_min = item?.score_min
                    }
                } else ranges[assessment]['score_min'] = item?.score_min

                if (ranges[assessment].score_max) {
                    if (ranges[assessment].score_max < item?.score_max) {
                        ranges[assessment].score_max = item?.score_max
                    }
                } else ranges[assessment]['score_max'] = item?.score_max
            }
        }

        setUnitedScoreRanges(ranges)
    }

    async function getPrintToData() {
        const exam_id = edit_data?.id

        if (!exam_id) {
            setDataToPrint(null)
            return
        }

        const formatDateTime = (value) => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''
        const examDate = formatDateTime(edit_data?.begin_date)
        const isSorilPrint = isSorilType(edit_data?.stype)
        const isAmanPrint = isAmanType(edit_data?.stype)

        const cdata = { group_id: grouupId, sub_group_id: subGroup.sub_group, level_group_id: levelGroup.level_group }
        const { success, data } = await fetchDataToPrint(scoreApi.getByLesson(exam_id, cdata, change_student.join(',')))
        if(success) {
            if (data?.length) {
                const dataToPrint = {}
                const teacherScoreUpdatedAt = formatDateTime(data[0]?.teacher_score_updated_at)

                dataToPrint['teacher_org_position'] = data[0]?.teacher_org_position || '',
                dataToPrint['teacher_name'] = data[0]?.teacher_name || '',
                dataToPrint['teacher_score_updated_at'] = teacherScoreUpdatedAt,
                dataToPrint['ded_confirm_date'] = data[0].exam_committee[0].ded_confirm_date ? moment(data[0].exam_committee[0].ded_confirm_date).format('YYYY-MM-DD HH:mm:ss') : '',
                dataToPrint['exam_committee'] = (data[0]?.exam_committee || []).map(item => {
                    const committeeScoreUpdatedAt = formatDateTime(item?.teacher_score_updated_at)

                    return {
                        ...item,
                        teacher_exam_score_confirm_date: isSorilPrint ? examDate : (isAmanPrint ? committeeScoreUpdatedAt : (item?.teacher_exam_score_confirm_date || '')),
                        teacher_score_updated_at: isSorilPrint ? examDate : committeeScoreUpdatedAt,
                    }
                }),
                dataToPrint['lesson_year'] = data[0]?.lesson_year || '',
                dataToPrint['lesson_season'] = data[0]?.lesson_season || '',
                dataToPrint['lesson_name'] = data[0]?.lesson_name || '',
                dataToPrint['lesson_credit'] = data[0]?.lesson_kredit || '',
                dataToPrint['teacher_quiz_score_confirm_date'] = isSorilPrint
                    ? (data.find(item => item?.teacher_exam_score_confirm_date)?.teacher_exam_score_confirm_date || '')
                    : (data[0]?.exam_committee?.find(c => c.teacher_quiz_score_confirm_date !== null)?.teacher_quiz_score_confirm_date || '')

                // 2. зөвхөн сонгосон оюутны ID-г авах
                const filteredStudents = change_student?.length > 0 ? data.filter(item => change_student.includes(item?.id)) : data

                dataToPrint['selected_student'] = filteredStudents?.map(item => ({
                    id: item?.id || '',
                    student: item?.student || '',
                    full_name: item?.full_name || '',
                    code: item.student?.code || '',
                    teacher_score: item?.teacher_score || '',
                    exam_score: item?.exam_score || '',
                    letter: item?.grade_letter || '',
                    total: item?.total || '',
                    student_confirm_date: item?.student_confirm_date || '',
                    teacher_quiz_score_confirm_date: isSorilPrint ? (item?.teacher_exam_score_confirm_date || '') : (item?.teacher_quiz_score_confirm_date || ''),
                    teacher_exam_score_confirm_date: isSorilPrint ? examDate : (isAmanPrint ? teacherScoreUpdatedAt : (item?.teacher_exam_score_confirm_date || '')),
                }))
                // #region Irts table calculation
                // Шалгалт өгсөн бол тоолдог болсон
                dataToPrint['total_students_count'] = filteredStudents.length
                dataToPrint['scored_students_count'] = filteredStudents.filter(item => (item?.score && item?.is_exam)).length
                const score_ranges = united_score_ranges
                dataToPrint['a_students_count'] = filteredStudents.filter(item => item?.is_exam && score_ranges.A.score_min <= item?.total && item?.total <= score_ranges.A.score_max).length
                dataToPrint['b_students_count'] = filteredStudents.filter(item => item?.is_exam && score_ranges.B.score_min <= item?.total && item?.total <= score_ranges.B.score_max).length
                dataToPrint['c_students_count'] = filteredStudents.filter(item => item?.is_exam && score_ranges.C.score_min <= item?.total && item?.total <= score_ranges.C.score_max).length
                dataToPrint['d_students_count'] = filteredStudents.filter(item => item?.is_exam && score_ranges.D.score_min <= item?.total && item?.total <= score_ranges.D.score_max).length
                dataToPrint['f_students_count'] = filteredStudents.filter(item => item?.is_exam && score_ranges.F.score_min <= item?.total && item?.total <= score_ranges.F.score_max).length

                if (dataToPrint['total_students_count'] > 0) {
                    dataToPrint['success'] = (((dataToPrint['a_students_count'] + dataToPrint['b_students_count'] + dataToPrint['c_students_count']) * 100) / dataToPrint['total_students_count']).toFixed(0) + '%'
                    dataToPrint['quality'] = (((dataToPrint['a_students_count'] + dataToPrint['b_students_count']) * 100) / dataToPrint['total_students_count']).toFixed(0) + '%'
                } else {
                    dataToPrint['success'] = ''
                    dataToPrint['quality'] = ''
                }
                // #endregion

                setDataToPrint(dataToPrint)
            }
        }
    }

    async function getConfirmStatus() {
        const exam_id = edit_data?.id
        const subGroupId = subGroup?.sub_group
        const levelGroupId = levelGroup?.level_group

        if (!exam_id || (!grouupId && !subGroupId && !levelGroupId)) {
            setConfirmStatus([])
            return
        }

        const examDate = edit_data?.begin_date ? moment(edit_data.begin_date).format('YYYY-MM-DD HH:mm:ss') : ''
        const isSorilStatus = isSorilType(edit_data?.stype)
        const cdata = { group_id: grouupId, sub_group_id: subGroupId, level_group_id: levelGroupId }
        const { success, data } = await fetchDataToPrint(scoreApi.getByLesson(exam_id, cdata))

        if (success) {
            const result = data.map(item => ({
                id: item?.id || '',
                student: item?.student || '',
                full_name: item?.full_name || '',
                code: item.code || '',
                teacher_score: item?.teacher_score || '',
                exam_score: item?.exam_score || '',
                letter: item?.grade_letter || '',
                total: item?.total || '',
                is_exam: item?.is_exam || false,
                student_confirm_date: item?.student_confirm_date || '',
                teacher_quiz_score_confirm_date: item?.teacher_quiz_score_confirm_date || '',
                teacher_exam_score_confirm_date: isSorilStatus ? examDate : (item?.teacher_exam_score_confirm_date || ''),
            }))

            setConfirmStatus(result)

        } else {
            setConfirmStatus([])
        }
    }

    async function handlePrint(selectedGroupNames) {
        await getPrintToData()

        // #region to build group names
        const group_names_array = selectedGroupNames?.split(", ")
        let group_names = ''

        if (group_names_array) {
            if (group_names_array.length > 1) {
                group_names = group_names
            } else {
                group_names = group_names_array[0]
            }
            setSelectedGroupNames(group_names)

        }

        if (!group_names) group_names = 'Print'
        else group_names = `${group_names}-дүн`
        // #endregion to build group names

        const printStyles = `
            body {
                margin: 0;
            }

            div {
                box-sizing: border-box;
            }

            #${elementToPrintId} {
                font-family: "Times New Roman";
                font-size: 11pt;
            }

            #${elementToPrintId} table {
                font-size: 11pt;
                border-collapse: collapse;
            }

            #${elementToPrintId} td {
                vertical-align: top;
            }

            .mainTable td {
                padding-left: 2mm;
                padding-right: 2mm;
                border: 1px solid #000000;
            }

            .etp_borderless td {
                border: 0;
            }

            .etp_mt-1 {
                margin-top: 5mm;
            }
        `

        stableStylesPrintElement({
            elementId: elementToPrintId,
            windowTitle: group_names,
            printStyles: printStyles
        })
    }

    function handleGroupPrint(row) {
        handleGroupModal()
        setEditData(row)
    }
    // #endregion

    // Оюутны жагсаалт
    const getStudentList = async(rowDatas) => {
        if(rowDatas?.id) {
            const lessonId = rowDatas.lesson || ''

            const { success, data } = await fetchData(examApi.getStudentExamScore(rowDatas?.id, lessonId))
            if(success) {
                setStudentDatas(data)
            }
        }
	}

    function handleDownloadScore(row) {
        setDownloadModal(!downloadModal)
        getStudentList(row)
    }

    const handleGroupModal = () => {
        setGroupModal(!groupModal)
        setSelectedIds({})
        setGroupId('')
        setSubGroup('')
        setLevelGroup('')
        setConfirmStatus([])
    }

    // selected_student өөрчлөгдөх болгонд өмнөх сонголтыг арилгана
    useEffect(() => {
        if (!grouupId) {
            setChangeStudent([])
        }
    }, [grouupId])

    useEffect(() => {
        getConfirmStatus()
    }, [edit_data, grouupId, subGroup?.sub_group, levelGroup?.level_group])

    useEffect(() => {
        refreshEditData()
    }, [groupModal, edit_data?.id])

    async function refreshEditData() {
        if (!groupModal || !edit_data?.id) {
            return
        }

        try {
            const { success, data } = await examApi.getList('')
            if (success) {
                const freshData = data?.find(item => item?.id === edit_data.id)
                if (freshData) {
                    setEditData(freshData)
                    setDatas(prev => prev.map(item => item?.id === freshData.id ? { ...item, ...freshData } : item))
                }
            }
        } catch (err) {}
    }

    const isSorilExam = isSorilType(edit_data?.stype)
    const hasSelectedScope = !!(grouupId || subGroup?.sub_group || levelGroup?.level_group)
    const canPrintSelectedScore = isSorilExam || (
        confirm_status.length > 0 &&
        confirm_status.every(item =>
            item?.student_confirm_date &&
            item?.teacher_quiz_score_confirm_date &&
            (!item?.is_exam || item?.teacher_exam_score_confirm_date)
        )
    )

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                {dataToPrintIsLoading && dataToPrintLoader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Шалгалтын хуваарь')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1 '>
                        <Button color='primary' disabled={user && Object.keys(user).length && user.permissions.includes('lms-timetable-exam-create') ? false : true} onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='p-1'>
                    <Col md={4}>
                        <Label>Шалгалтын төрөл</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className={classNames('react-select')}
                            isLoading={groupLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={examType() || []}
                            value={examType().find((c) => c.id === selectedType)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setSelectedType(val ? val?.id : '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={4}>
                        <Label>Хянах багш</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className={classNames('react-select')}
                            isLoading={teacherLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={teachers || []}
                            value={teachers.find((c) => c.id === selectedTeacher)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setSelectedTeacher(val ? val.id : '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.rank_name + ' ' + option?.full_name}
                        />
                    </Col>
                </Row>
                <Alert color='primary' className={'p-1 m-1'}>
                    Сорил төрлийн шалгалт хэвлэхэд баталгаажуулалт шаардахгүй. Бусад төрлийн шалгалтад багш, арга зүйч, оюутан бүгд гарын үсгээ баталгаажуулсны дараа хэвлэх товч идэвхтэй болно.
                </Alert>
                <Row className="justify-content-between mx-0">
                        <Col className='d-flex align-items-center justify-content-start mt-1' md={4} sm={12}>
                            <Col md={3} sm={3} className='pe-1'>
                                <Input
                                    className='dataTable-select me-1 mb-50'
                                    type='select'
                                    bsSize='sm'
                                    style={{ height: "30px" }}
                                    value={rowsPerPage}
                                    onChange={e => handlePerPage(e)}
                                >
                                    {
                                        default_page.map((page, idx) => (
                                        <option
                                            key={idx}
                                            value={page}
                                        >
                                            {page}
                                        </option>
                                    ))}
                                </Input>
                            </Col>
                            <Col md={6} sm={3}>
                                <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                            </Col>
                        </Col>
                        <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={3} sm={12}>
                            <Input
                                className='dataTable-filter mb-50'
                                type='text'
                                bsSize='sm'
                                id='search-input'
                                placeholder={t('Хайх')}
                                value={searchValue}
                                onChange={handleFilter}
                                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                            />
                            <Button
                                size='sm'
                                className='ms-50 mb-50'
                                color='primary'
                                onClick={handleSearch}
                            >
                                <Search size={15} />
                                <span className='align-middle ms-50'></span>
                            </Button>
                        </Col>
                        {/* <Col className="mt-1 " md={4}>
                            <Label>Хичээл</Label>
                            <Select
                            name="room_type"
                            id="room_type"
                            classNamePrefix='select'
                            isClearable
                            className={classNames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                                options={lessons || []}
                                // value={angi.find((c) => c.id === room_id)}
                                noOptionsMessage={() => t('Хоосон байна')}
                                onChange={(val) => {
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.name}
                                getOptionLabel={(option) => option.name}
                            />
                        </Col> */}
                    </Row>
                {
                    isTableLoading
                        ?
                            <div className="my-2 text-center" sm={12}>
                                <Spinner size='sm' />
                                <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                            </div>
                        :
                                datas.length > 0 ?
                                        <div className="react-dataTable react-dataTable-selectable-rows" id="datatableLeftTwoRightOne">
                                            <DataTable
                                                noHeader
                                                pagination
                                                paginationServer
                                                className='react-dataTable'
                                                // progressPending={isTableLoading}
                                                onSort={handleSort}
                                                columns={getColumns(currentPage, rowsPerPage, total_count, handleEditModal, handleDelete, navigate, handleDownloadScore, user, handleGroupPrint)}
                                                sortIcon={<ChevronDown size={10} />}
                                                paginationPerPage={rowsPerPage}
                                                paginationDefaultPage={currentPage}
                                                data={datas}
                                                paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                                                fixedHeader
                                                fixedHeaderScrollHeight='62vh'
                                            />
                                        </div>
                                    :
                                        <div className="d-flex justify-content-center p-5">
                                            <Badge color='light-warning' className="p-1"> <AlertCircle/> Уучлаарай илэрц олдсонгүй </Badge>
                                        </div>
                            }
                {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} handleEdit={handleEditModal} editId={editId} editData={edit_data}/>}
                {/* {edit_modal && <Editmodal editId={edit_pay_id} open={edit_modal} handleModal={handleEditModal} refreshDatas={getDatas}/>} */}
                {downloadModal && <DownloadScore open={downloadModal} handleModal={() => setDownloadModal(!downloadModal)} studentDatas={studentData} />}
            </Card>
            <Modal
                isOpen={groupModal}
                toggle={handleGroupModal}
                size="lg"
                className="modal-dialog-centered"
                backdrop='static'
            >
                <ModalHeader toggle={handleGroupModal}>{'Анги дамжаа сонгох'}</ModalHeader>
                <ModalBody>
                    <div className="">
                        <Label>Дамжаа сонгох</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className={classNames('react-select')}
                            placeholder={t('-- Сонгоно уу --')}
                            options={edit_data?.groups || []}
                            value={grouupId ? edit_data?.groups?.find((e) => e.group === grouupId) : ''}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setSelectedIds(val)
                                setGroupId(val?.group || "")
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option?.group}
                            getOptionLabel={(option) => option.name}
                        />
                        <Label>Дэд бүлэг сонгох</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className={classNames('react-select')}
                            placeholder={t('-- Сонгоно уу --')}
                            options={edit_data?.sub_groups || []}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setSubGroup(val || "")
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option?.sub_group}
                            getOptionLabel={(option) => option.name}
                        />
                        <Label>Түвшин бүлэг сонгох</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className={classNames('react-select')}
                            placeholder={t('-- Сонгоно уу --')}
                            options={edit_data?.level_groups || []}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setLevelGroup(val || "")
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option?.level_group}
                            getOptionLabel={(option) => option.name}
                        />
                        {/* <div className="mt-1 mb-1 text-center">
                            <Button color="primary" className="me-1" disabled={!grouupId} onClick={() => handlePrint(edit_data?.id, selectedIds?.name, grouupId)}>Сонгоод хэвлэх</Button>
                            <Button color="primary" onClick={() => handlePrint(edit_data?.id, edit_data?.group_names)}>Шууд хэвлэх</Button>
                        </div> */}
                        <div className="mt-1 mb-1 text-center">
                            <Button
                                color="primary"
                                className="me-1"
                                disabled={!canPrintSelectedScore || !hasSelectedScope}
                                onClick={() => handlePrint(selectedIds?.name)}
                            >
                                Сонгоод хэвлэх
                            </Button>
                            <Button
                                color="primary"
                                disabled={!edit_data?.has_confirm_date || hasSelectedScope}
                                onClick={() => handlePrint(edit_data?.group_names)}
                            >
                                Шууд хэвлэх
                            </Button>
                        </div>
                        {!isSorilExam && (
                            <>
                                <div className="me-1">
                                    <Label className="mt-25"> Oюутны сонголт{'(' + confirm_status?.length !=0  + ')-'}</Label>
                                    <Label className="me-25">{'(' + change_student?.length != 0 + ')'}</Label>
                                </div>
                                <Controller
                            control={control}
                            defaultValue=''
                            name="student"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="student"
                                        id="student"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classNames('react-select')}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={confirm_status || []}
                                        value={change_student?.length > 0 ? confirm_status?.filter((item) => change_student.includes(item?.id)) : []}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.map((item) => item?.id) || [])
                                            setChangeStudent(val?.map((item) => item?.id) || [])
                                        }}
                                        isLoading={dataToPrintIsLoading}
                                        // menuIsOpen={(grouupId && selected_student.length > 0)}
                                        isMulti
                                        isDisabled={!grouupId && !subGroup.sub_group && !levelGroup.level_group}
                                        isSearchable={true}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option?.id}
                                        getOptionLabel={(option) => option?.full_name +' '+'('+ option?.code +')'}
                                    />
                                )
                            }}
                                ></Controller>
                            </>
                        )}
                        {confirm_status.length > 0 && (
                            <div className="mt-2">
                                <DataTable
                                    noHeader
                                    className="react-dataTable"
                                    columns={[
                                        {
                                            name: "№",
                                            selector: (row, idx) => (
                                                <span>{idx + 1}</span>
                                            ),
                                            width: "70px",
                                        },
                                        {
                                            name: 'Оюутны нэр',
                                            selector: row => `${row.full_name} (${row.code})`,
                                            sortable: true,
                                        },
                                        {
                                            name: 'Оюутан',
                                            center: true,
                                            cell: row => row.student_confirm_date
                                                ? <span className="text-success fw-bold">Баталгаажуулсан</span>
                                                : <span className="text-danger fw-bold">Баталгаажуулаагүй</span>
                                        },
                                        {
                                            name: 'Явцын багш',
                                            center: true,
                                            cell: row =>
                                                row.teacher_quiz_score_confirm_date
                                                    ? <span className="text-success fw-bold">Баталгаажуулсан</span>
                                                    : <span className="text-danger fw-bold">Баталгаажуулаагүй</span>
                                        },
                                        {
                                            name: 'Шалгалтын комисс',
                                            center: true,
                                            cell: row =>
                                                !row.is_exam
                                                    ? <span className="text-muted fw-bold">Шаардлагагүй</span>
                                                    : row.teacher_exam_score_confirm_date
                                                    ? <span className="text-success fw-bold">Баталгаажуулсан</span>
                                                    : <span className="text-danger fw-bold">Баталгаажуулаагүй</span>
                                        }
                                    ]}
                                    data={confirm_status}
                                    sortIcon={<ChevronDown size={10} />}
                                />
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'none' }}>
                        <ElementToPrint data_to_print={data_to_print} selectedGroupNames={selected_group_names} elementToPrintId={elementToPrintId} />
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default ExamTimeTable;
