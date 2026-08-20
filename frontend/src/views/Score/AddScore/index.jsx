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

import Select from 'react-select'

import { ChevronDown, Search, Plus } from 'react-feather'

import { useForm, Controller } from "react-hook-form";

import DataTable from 'react-data-table-component'

import classnames from "classnames";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers'
import EditModal from './Edit'
import Addmodal from './Add'
import useUpdateEffect from '@src/utility/hooks/useUpdateEffect'

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

const ScoreRegister = () => {

    const { t } = useTranslation()

    const { user } = useContext(AuthContext)

    var values = {
        lesson: '',
        teacher: '',
        class: '',
    }

    // ** Hook
    const { control, setValue, formState: { errors } } = useForm({});

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
    const [edit_modal, setEditModal] = useState(false)
    const [modal, setModal] = useState(false)

    const [select_value, setSelectValue] = useState(values)

    const [editId, setEditId] = useState('')

    // API
    const lessonApi = useApi().study.lessonStandart
    const scoreApi = useApi().score.add

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList())
        if (success) {
            setLessonOption(data)
        }
    }

    // Дүнгийн жагсаалт
    async function getDatas() {
        const { success, data } = await fetchData(scoreApi.get(rowsPerPage, currentPage, sortField, searchValue, select_value.lesson))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }

    }

    useEffect(() => {
        getDatas()
    }, [select_value, rowsPerPage, currentPage, sortField])

    useEffect(
        () => {
            getLessonOption()
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
        getDatas()
    }, [searchValue])


    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    const handleEdit = () => {
        setEditModal(!edit_modal)
    }

    async function handleEditModal(editId) {
        handleEdit()
        setEditId(editId)
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Нэмэлт онооны жагсаалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            disabled={!user?.permissions?.includes('lms-arga-zuich-score-update')}
                            onClick={() => handleModal()}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="mx-50 gy-1 my-1" sm={12}>
                    <Col md={3} sm={12}>
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
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={lesson_option || []}
                                        value={lesson_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                lesson: val?.id || '',
                                                teacher: '',
                                                class: '',
                                            })
                                            setValue('teacher', '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.full_name}
                                    />
                                )
                            }}
                        ></Controller>
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
                                <Spinner className='me-1' color="" size='sm' /><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        onSort={handleSort}
                        highlightOnHover={true}
                        columns={getColumns(currentPage, rowsPerPage, handleEditModal)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        customStyles={customStyles}
                    />
                </div>
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
            {edit_modal && <EditModal open={edit_modal} handleModal={handleEdit} refreshDatas={getDatas} editId={editId} />}
        </Fragment>
    )
};

export default ScoreRegister;