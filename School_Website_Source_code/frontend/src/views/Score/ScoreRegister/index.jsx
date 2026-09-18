// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import {
    Row,
    Col,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner,
} from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { ChevronDown, Download, Search, HelpCircle } from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useUpdateEffect from '@hooks/useUpdateEffect'

import SchoolContext from '@context/SchoolContext'

import { getPagination } from '@utils'

import { getColumns } from './helpers'
import DetailModal from './DetailModal'
import { CSelect } from '@src/components/CSelect'

const ScoreRegister = () => {

    const approvedTypeOptions = [
        { id: true, name: 'Баталгаажсан' },
        { id: false, name: 'Баталгаажаагүй' },
    ]

    var values = {
        lesson: '',
        teacher: '',
        class: '',
        approved_type: '',
    }

    const customStyles = {
        headCells: {
            style: {
                justifyContent: 'center',
                textAlign: 'center',
            },
        },
        cells: {
            style: {
                justifyContent: 'flex-start',
            },
        },
    };

    const { t } = useTranslation()

    const { school_id } = useContext(SchoolContext)

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })

    const default_page = [10, 20, 50, 75, 100]

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const [datas, setDatas] = useState([])
    const [lesson_option, setLessonOption] = useState([])
    const [teacher_option, setTeacherOption] = useState([])
    const [group_option, setGroupOption] = useState([])
    const [detail_modal, setDetailModal] = useState(false)
    const [detail_data, setDetailModalData] = useState({})

    const [select_value, setSelectValue] = useState(values)

    const [selectedDatas, setSelectedData] = useState([]);
    const [toggledClearRows, setToggleClearRows] = useState(false);

    // API
    const groupApi = useApi().print.score
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const scoreApi = useApi().score.teacher
    const scoreRegisterApi = useApi().score.register

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList())
        if (success) {
            setLessonOption(data)
        }
    }

    // Багшийн жагсаалт
    async function getTeacher() {
        const lesson_id = select_value.lesson
        const { success, data } = await fetchData(teacherApi.getTeacher(lesson_id))
        if(success) {
            setTeacherOption(data)
        }
    }

    // Анги бүлгийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getGroupList(school_id))
        if (success) {
            setGroupOption(data)
        }
    }

    // Дүнгийн жагсаалт
    async function getDatas() {
        const { class: group, lesson, teacher, approved_type } = select_value
        const { success, data } = await fetchData(scoreApi.get(rowsPerPage, currentPage, sortField, searchValue, group, lesson, teacher, approved_type))
        if (success) {
            setDatas(data?.results || [])
            setTotalCount(data?.count || 0)
        }
    }

    useEffect(() => {
        getDatas()
    }, [select_value, rowsPerPage, currentPage, sortField])

    useEffect(
        () => {
            getLessonOption()
            getTeacher()
            getGroup()
        },
        []
    )

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handleSort(column, sort) {
        if (sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // Хуудас солих үед ажиллах хэсэг
    function handlePagination(page) {
        setCurrentPage(page.selected + 1);
    };

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useUpdateEffect(() => {
        if (!searchValue) {
            getDatas()
        }
    }, [searchValue])

    async function handleTeacherDownload() {
        if (selectedDatas) {
            const { success, data } = await fetchData(scoreApi.post(selectedDatas))
            if (success) {
                handleClearRows()
                getDatas()
            }
        }
    }

    const handleClearRows = () => {
        setToggleClearRows(!toggledClearRows);
      }

    const handleChange = ({ selectedRows }) => {
        const selectedData = selectedRows.map(row => ({
            lesson: row?.lesson?.id,
            group: row?.group?.id,
            teacher: row?.teacher?.id,
            date: row?.date
        }));

        setSelectedData(selectedData)
    };

    function handleDetailModal(data) {
        setDetailModal(!detail_modal)
        setDetailModalData(data)
    }

    async function handleDeleteModal(rowData) {

        let cdatas = {
            'group_id': rowData?.group?.id || '',
            'lesson_id': rowData?.lesson?.id,
            'teacher_id': rowData?.teacher?.id,
        }

        const { success } = await fetchData(scoreRegisterApi.deleteScoreRegister(cdatas))
        if(success) {
            getDatas()
        }
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Идэвхтэй улирлын дүнгийн бүртгэл')}</CardTitle>
                </CardHeader>
                <Row className="mx-50 gy-1 my-1" sm={12}>
                    <Col md={3} sm={12}>
                        <CSelect
                            id="lesson"
                            label={t('Хичээл')}
                            isLoading={isLoading}
                            options={lesson_option || []}
                            value={select_value.lesson ? lesson_option.find((c) => c.id === select_value.lesson) : ''}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        lesson: val,
                                        teacher: '',
                                    }
                                })
                            }}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.full_name}
                        />
                    </Col>
                    <Col md={3} sm={12}>
                        <CSelect
                            label={t('Багш')}
                            id="teacher"
                            isLoading={isLoading}
                            options={teacher_option || []}
                            value={select_value.teacher && teacher_option.find((c) => c.id === select_value.teacher)}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        teacher: val,
                                    }
                                })
                            }}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.full_name}
                        />
                    </Col>
                    <Col md={3} sm={12}>
                        <CSelect
                            id="class"
                            isLoading={isLoading}
                            options={group_option || []}
                            value={select_value.class ? group_option.find((c) => c.confirm_year === select_value.class) : ''}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        class: val,
                                    }
                                })
                            }}
                            label={t('Анги')}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} sm={12}>
                        <CSelect
                            id="approved_type"
                            options={approvedTypeOptions}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        approved_type: val,
                                    }
                                })
                            }}
                            value={select_value?.approved_type ? approvedTypeOptions?.find((val) => val?.id === select_value?.approved_type) : ''}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                            label={t("Дүн баталгаажуулалт")}
                        />
                    </Col>
                    <Col md={5} sm={12} className='d-flex justify-content-start align-items-center'>
                        <Button size='sm' color='primary' className='mt-2' onClick={handleTeacherDownload} disabled={!(selectedDatas && selectedDatas.length > 0)}  ><Download size={15} className='me-1' />Багшийн дүн татах</Button>
                        <a href='https://drive.google.com/file/d/1eeuuD1bJxZjmqrc_sCuAg4i0OHQyGCoc/view?usp=sharing' target="_blank">
                            <Button color='primary' container className='mx-1 mt-2' size='sm'>
                                <HelpCircle size={15} />
                                <span className='align-middle ms-50'>{t('Заавар')}</span>

                            </Button>
                        </a>
                    </Col>
                </Row>
                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
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
                        <Col md={10} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search' md={6} sm={12}>
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
                </Row>
                <div className='react-dataTable react-dataTable-selectable-rows' id="datatableLeftOneRightOne">
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
                        className='react-dataTable'
                        progressPending={isLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' size='sm' /><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        onSort={handleSort}
                        highlightOnHover={true}
                        columns={getColumns(currentPage, rowsPerPage, total_count, select_value?.class, handleDetailModal, handleDeleteModal)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        selectableRows
                        onSelectedRowsChange={handleChange}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        customStyles={customStyles}
                        clearSelectedRows={toggledClearRows}
                    />
                </div>
            </Card>
            {detail_modal && <DetailModal open={detail_modal} handleModal={handleDetailModal} datas={detail_data} />}
        </Fragment>
    )
};

export default ScoreRegister;
