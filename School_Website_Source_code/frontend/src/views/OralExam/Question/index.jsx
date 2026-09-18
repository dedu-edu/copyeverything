// ** React Imports
import { Fragment, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, ChevronsLeft, ChevronsRight, Edit } from 'react-feather'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { Badge, Card, CardHeader, CardTitle, Col, Input, Label, Row, Spinner, UncontrolledTooltip } from 'reactstrap'

import SchoolContext from '@context/SchoolContext'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import AuthContext from '@src/utility/context/AuthContext'
import { getPagination, ReactSelectStyles } from '@utils'

import EQuestions from './EQuestions'
import { getColumns } from './helpers'
import { getColumnsLesson } from './helpers2'

const Question = () => {
    var values = {
        position_id: '',
        department_id: ''
    }

    const { t } = useTranslation()

    // to handle back buttons
    const navigate = useNavigate()
    const location = useLocation()

    // ** Hook
    const { control } = useForm({})

    const [step, setStep] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(10)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')
    const [searchValue, setSearchValue] = useState('')

    const { school_id } = useContext(SchoolContext)
    const { user } = useContext(AuthContext)

    const [datas, setDatas] = useState([])
    const [department, setDepartmentData] = useState([])
    const [lesson_data, setLessonDatas] = useState([])
    const [position_option, setOrgPositions] = useState([])
    const [selected_values, setSelectValue] = useState(values)

    const [teacher, setTeacher] = useState('')
    const [teacher_name, setTeacherName] = useState('')
    const [lessonName, setLessonName] = useState('')
    const [lessonId, setLessonId] = useState('')
    const [title_id, setTitleId] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)
    const [total_count2, setTotalCount2] = useState(2)

    // Loader
    const { isLoading: isLoadingDep, fetchData: fetchDep } = useLoader({})
    const { isLoading: isLoadingPos, fetchData: fetchPos } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

    // Api
    const oralExamTeacherApi = useApi().challenge.oralExam.teacher
    const oralExamTitleApi = useApi().challenge.oralExam.title
    const departmentApi = useApi().hrms.department
    const positionApi = useApi().hrms.position

    /* Жагсаалтын дата сургууль, тэнхим авах функц */
    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }
        const { success, data } = await allFetch(
            oralExamTeacherApi.get(
                rowsPerPage,
                currentPage,
                sortField,
                searchValue,
                school_id,
                selected_values.department_id ?? '',
                selected_values.position_id ?? '',

            )
        )
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    async function getDatas2(teacher) {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }
        const { success, data } = await allFetch(
            oralExamTitleApi.get(rowsPerPage, currentPage, sortField, searchValue, teacher)
        )
        if (success) {
            setTotalCount2(data?.count)
            setLessonDatas(data?.results)
        }
    }

    /* Тэнхим дата авах функц */
    async function getDepartmentOption() {
        const { success, data } = await fetchDep(departmentApi.getSelectSchool())
        if (success) {
            setDepartmentData(data)
        }
    }

    /* Албан тушаал дата авах функц */
    async function getPositionData() {
        const { success, data } = await fetchPos(positionApi.get())
        if (success) {
            setOrgPositions(data)
        }
    }

    // stepper
    const handleNext = (row) => {
        setTeacher(row?.id)
        setTeacherName(row?.full_name)
        setStep((prev) => prev + 1)
    }
    const handleDetail = (id, lessonName = '', lessonId = '') => {
        setTitleId(id)
        setLessonName(lessonName)
        setLessonId(lessonId)

        if (title_id) {
            setStep((prev) => prev + 1)
        }
    }

    useEffect(() => {
        if (searchValue.length == 0) {
            if (step === 1) getDatas()
            else if (step === 2 && teacher) getDatas2(teacher)
        } else {
            const timeoutId = setTimeout(() => {
                if (step === 1) getDatas()
                else if (step === 2 && teacher) getDatas2(teacher)
            }, 600)

            return () => clearTimeout(timeoutId)
        }
    }, [sortField, searchValue, currentPage, school_id])

    useEffect(() => {
        if (teacher) {
            getDatas2(teacher)
        }
    }, [teacher])

    useEffect(() => {
        getDatas()
    }, [selected_values])

    useEffect(() => {
        getPositionData()
        getDepartmentOption()
    }, [])

    useEffect(() => {
        if (location.state?.step) {
            setStep(location.state?.step)
            setTeacher(location.state?.teacherId)
        }
    }, [location.state?.step])

    // ** Function to handle filter
    const handleFilter = (e) => {
        const value = e.target.value.trimStart()
        setSearchValue(value)
    }

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1)
    }

    function handleSort(column, sort) {
        if (sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    const customStyles = {
        cells: {
            style: {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                padding: '8px'
            }
        }
    }

    return (
        <Fragment>
            {step === 1 && (
                <Card>
                    <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                        <CardTitle tag='h4'>{t('Асуулт үүсгэсэн багшийн жагсаалт')}</CardTitle>
                    </CardHeader>
                    <Row className='justify-content-between mx-0 mb-1 mt-1'>
                        <Col md={3}>
                            <Label className='form-label' for='salbar'>
                                {t('Тэнхим')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name='salbar'
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name='salbar'
                                            id='salbar'
                                            classNamePrefix='select'
                                            isClearable
                                            isLoading={isLoadingDep}
                                            className='react-select'
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={department || []}
                                            value={value && department.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue({
                                                    subschool_id: selected_values.subschool_id,
                                                    department_id: val?.id || ''
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col md={3}>
                            <Label className='form-label' for='position'>
                                {t('Албан тушаал')}
                            </Label>
                            <Select
                                name='position'
                                id='position'
                                classNamePrefix='select'
                                isClearable
                                isLoading={isLoadingPos}
                                className='react-select'
                                placeholder={t('-- Сонгоно уу --')}
                                options={position_option || []}
                                value={position_option.find((c) => c.id === selected_values.position_id)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setSelectValue({
                                        department_id: selected_values.department_id,
                                        position_id: val?.id || ''
                                    })
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                        </Col>
                        <Col md={3}></Col>
                        <Col md={3}>
                            <Label className='form-label' for='salbar'>
                                {t('Хайлт')}
                            </Label>
                            <Input
                                type='text'
                                bsSize='sm'
                                id='search-input'
                                value={searchValue}
                                onChange={handleFilter}
                                placeholder={t('Хайх үг....')}
                            />
                        </Col>
                    </Row>
                    {isTableLoading ? (
                        <div className='my-2 text-center'>
                            <Spinner size='sm' />
                            <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                        </div>
                    ) : (
                        <div className='react-dataTable react-dataTable-selectable-rows mx-1'>
                            <DataTable
                                noHeader
                                pagination
                                progressPending={isTableLoading}
                                className='react-dataTable'
                                noDataComponent={
                                    <div className='my-2'>
                                        <h5>
                                            {t('Өгөгдөл байхгүй байна')}.
                                            <a onClick={() => handleNext({ id: user.teacher_id })} id={`handleNextSelf`}>
                                                <Badge color='light-primary' pill className='ms-50'>
                                                    <ChevronsRight size={32} />
                                                </Badge>
                                            </a>
                                        </h5>
                                        <UncontrolledTooltip placement='top' target={`handleNextSelf`}>
                                            {t('Хичээлүүд харах')}
                                        </UncontrolledTooltip>
                                    </div>
                                }
                                columns={getColumns(currentPage, rowsPerPage, total_count, handleNext)}
                                onSort={handleSort}
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
                    )}
                </Card>
            )}
            {[2, 3].includes(step) && (
                <Card>
                    <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                        <CardTitle tag='h4'>
                            {step === 2 && t('Шалгалтын асуултын сэдвийн мэдээлэл')}
                            {step === 3 && t('Сонгосон багш (хичээл)')}
                        </CardTitle>
                        <CardTitle tag='h5' className='text-end'>
                            {teacher_name}
                            {step === 3 && lessonName && <small className='d-block'>({lessonName})</small>}
                        </CardTitle>
                    </CardHeader>
                    {step === 2 && (
                        <>
                            <Row className='justify-content-between mx-0 mb-1 mt-1'>
                                <Col className='m-1'>
                                    <span className='cursor-pointer' role='a' onClick={() => navigate('/oral-exam/question/')} color='primary'>
                                        <ChevronsLeft />
                                        {t('Буцах')}
                                    </span>
                                </Col>
                                <Col md={3}>
                                    <Label className='form-label' for='salbar'>
                                        {t('Хайлт')}
                                    </Label>
                                    <Input
                                        type='text'
                                        bsSize='sm'
                                        id='search-input'
                                        value={searchValue}
                                        onChange={handleFilter}
                                        placeholder={t('Хайх үг....')}
                                    />
                                </Col>
                            </Row>
                            {isTableLoading ? (
                                <div className='my-2 text-center'>
                                    <Spinner size='sm' />
                                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                                </div>
                            ) : (
                                <div className='react-dataTable react-dataTable-selectable-rows mx-1'>
                                    <DataTable
                                        noHeader
                                        pagination
                                        progressPending={isTableLoading}
                                        className='react-dataTable'
                                        noDataComponent={
                                            <div className='my-2'>
                                                <h5>
                                                    {t('Өгөгдөл байхгүй байна')}.
                                                    <a onClick={() => handleDetail(-1)} id={`handleDetailSelf`}>
                                                        <Badge color='light-primary' pill className='ms-50'>
                                                            <ChevronsRight size={32} />
                                                        </Badge>
                                                    </a>
                                                </h5>
                                                <UncontrolledTooltip placement='top' target={`handleDetailSelf`}>
                                                    {t('Асуултууд харах')}
                                                </UncontrolledTooltip>
                                            </div>
                                        }
                                        columns={getColumnsLesson(currentPage, rowsPerPage, total_count2, handleDetail, teacher)}
                                        onSort={handleSort}
                                        sortIcon={<ChevronDown size={10} />}
                                        paginationPerPage={rowsPerPage}
                                        paginationDefaultPage={currentPage}
                                        data={lesson_data}
                                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count2)}
                                        fixedHeader
                                        fixedHeaderScrollHeight='62vh'
                                    />
                                </div>
                            )}
                        </>
                    )}
                    {step === 3 && <EQuestions teacher_id={teacher} title_id={title_id} lessonId={lessonId} setStep={setStep} />}
                </Card>
            )}
        </Fragment>
    )
}
export default Question
