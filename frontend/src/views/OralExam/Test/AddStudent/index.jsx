import classnames from 'classnames'
import React, { Fragment, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Search } from 'react-feather'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import Select from 'react-select'
import { Button, Card, CardHeader, CardTitle, Col, Form, FormFeedback, Input, Label, Row } from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import useModal from '@hooks/useModal'
import { convertDefaultValue, getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers'
import { getQuestionColumns } from './QuestionHelpers'

function AddStudent() {
    const status = []
    const SCOPE_LEVEL_GROUP = 'levelGroup'
    const SCOPE_SUB_GROUP = 'subGroup'
    const SCOPE_GROUP = 'group'

    const { t } = useTranslation()
    const { showWarning } = useModal()

    const { isLoading, fetchData } = useLoader({})
    const { isLoading: isLoadingQ, fetchData: fetchQuestion, Loader: LoaderQ } = useLoader({ isFullScreen: false })

    // select input options
    const { isLoading: isLoadingGO, fetchData: fetchGroupOptions } = useLoader({})
    const { isLoading: isLoadingSO, fetchData: fetchStudentOptions } = useLoader({})

    const {
        control,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors }
    } = useForm({})
    const { challenge_id, lesson_id } = useParams()

    const [scope, setScope] = useState(SCOPE_GROUP)

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(50)
    const [total_count, setTotalCount] = useState(1)
    const [searchValue, setSearchValue] = useState('')

    const [currentPageQ, setCurrentPageQ] = useState(1)
    const [rowsPerPageQ] = useState(50)

    const [selectedGroups, setSelectedGroups] = useState([])
    const [selectOption, setSelectOption] = useState([])
    const [levelGroupOption, setLevelGroupOption] = useState([])
    const [subGroupOption, setSubGroupOption] = useState([])

    const [datas, setDatas] = useState([])
    const [students, setStudents] = useState([])
    const [question_datas, setQuestionData] = useState([])
    const [question_count, setQuestionCount] = useState('')

    // students selected rows
    const [selectedRowsS, setSelectedRowsS] = useState([])
    const [toggledClearRowsS, setToggleClearRowsS] = useState(false);

    const [student_search_value, setStudentSearchValue] = useState([])

    const challengeAPI = useApi().challenge
    const levelGroupApi = useApi().student.levelGroup
    const subGroupApi = useApi().student.subGroup
    const groupApi = useApi().student.group

    async function getDatas() {
        const { success, data } = await fetchData(challengeAPI.getAddStudent(currentPage, rowsPerPage, searchValue, challenge_id))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    async function getLevelGroups() {
        const { success, data } = await fetchGroupOptions(levelGroupApi.get('Бүгд', 1, 'id'))
        if (success) setLevelGroupOption(data.results)
    }

    async function getSubGroups() {
        const { success, data } = await fetchGroupOptions(subGroupApi.get('Бүгд', 1, 'id'))
        if (success) setSubGroupOption(data.results)
    }

    async function getGroups() {
        const { success, data } = await fetchGroupOptions(groupApi.getAllList())
        if (success) {
            setSelectOption(data)
        }
    }

    async function getStudents() {
        const { success, data } = await fetchStudentOptions(challengeAPI.getStudents(student_search_value))
        if (success) {
            setStudents(data)
        }
    }

    async function getQuestionTableData() {
        const { success, data } = await fetchQuestion(challengeAPI.getQuestionList(challenge_id, rowsPerPageQ, currentPageQ))
        if (success) {
            setQuestionCount(data.question_count)
            setQuestionData(data.questions)
        }
    }

    async function handleDelete(id) {
        const { success } = await fetchData(challengeAPI.deleteStudent(id, challenge_id))
        if (success) {
            getDatas()
        }
    }

    function onSelectedRowsChangeS(state) {
        const selectedRowsS = state.selectedRows || []
        setSelectedRowsS(selectedRowsS)
    }

    async function handleDeleteAllS() {
        const ids = selectedRowsS.map((rows) => rows?.id)
        const { success } = await fetchData(challengeAPI.deleteStudent(0, challenge_id, ids))

        if (success) {
            getDatas()
            setSelectedRowsS([])
            setToggleClearRowsS(current => !current);
        }
    }

    useEffect(() => {
        getDatas()
    }, [currentPage, rowsPerPage])

    useEffect(() => {
        getQuestionTableData()
    }, [currentPageQ, rowsPerPageQ])

    useEffect(() => {
        getLevelGroups()
        getSubGroups()
        getGroups()
    }, [])

    function handleFilter(e) {
        const value = e.target.value.trimStart()
        setSearchValue(value)
    }

    function handleSearch() {
        getDatas()
    }

    function handleStudentSelect() {
        getStudents()
    }

    function groupSelect(data) {
        setSelectedGroups(data)
    }

    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1)
    }

    const handlePaginationQ = (page) => {
        setCurrentPageQ(page.selected + 1)
    }

    function handleSwitchScope(scope) {
        setScope(scope)
        setSelectedGroups([])
    }

    async function onSubmit(cdata) {
        cdata['groups'] = selectedGroups
        cdata['scope'] = scope
        cdata['lesson'] = lesson_id
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(challengeAPI.putTestKind(cdata, challenge_id))
        if (success) {
            getDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg })
            }
        }
    }

    async function onSubmitStudent(cdata) {
        cdata['challenge'] = challenge_id
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(challengeAPI.putTest(cdata))
        if (success) {
            getDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg })
            }
        }
    }

    function scopeFilters(scope) {
        return (
            <>
                <Row className='mt-1'>
                    <Col md={12}>
                        <Label className='form-label' for='select'>
                            {
                                scope === SCOPE_LEVEL_GROUP
                                ? 'Түвшин бүлэг сонгох'
                                : scope === SCOPE_SUB_GROUP
                                ? 'Дэд бүлэг сонгох'
                                : scope === SCOPE_GROUP
                                ? 'Анги сонгох'
                                : ''
                            }
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name='select'
                            render={() => {
                                return (
                                    <Select
                                        name='select'
                                        id='select'
                                        classNamePrefix='select'
                                        isClearable
                                        isMulti
                                        className={'react-select'}
                                        isLoading={isLoadingGO}
                                        options={
                                            (
                                                scope === SCOPE_LEVEL_GROUP
                                                ? levelGroupOption
                                                : scope === SCOPE_SUB_GROUP
                                                ? subGroupOption
                                                : scope === SCOPE_GROUP
                                                ? selectOption
                                                : []
                                            ) || []
                                        }
                                        placeholder={t('-- Сонгоно уу --')}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        value={selectedGroups}
                                        onChange={(val) => {
                                            groupSelect(val)
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => {
                                            if (scope === SCOPE_LEVEL_GROUP) return option.name
                                            if (scope === SCOPE_SUB_GROUP) return option.name
                                            if (scope === SCOPE_GROUP) return option.degree__degree_code ? option.name + '(' + option.degree__degree_code + ')' : option.name
                                        }}
                                    />
                                )
                            }}
                        />
                        {errors.select && <FormFeedback className='d-block'>{t(errors.select.message)}</FormFeedback>}
                    </Col>
                </Row>
            </>
        )
    }

    useEffect(() => {
        if (searchValue.length === 0) {
            getDatas()
        }
    }, [searchValue])

    useEffect(() => {
        if (student_search_value.length > 1) {
            handleStudentSelect()
        } else if (student_search_value.length === 0) {
            setStudents([])
        }
    }, [student_search_value])

    if (question_datas.length > 0) {
        for (let idx = 0; question_datas.length > idx; idx++) {
            status.push(question_datas[idx]?.status)
        }
    }

    return (
        <Fragment>
            <Row className='mt-2'>
                <Col md={7}>
                    <Card xs={4}>
                        <CardHeader className='rounded border d-flex flex-row'>
                            <Button tag={Link} to='/oral-exam/test' color='primary' className='btn-sm-block'>
                                Буцах
                            </Button>
                            <CardTitle tag='h4' className='mt-0 mx-0'>
                                {t('Шалгалт өгөх суралцагчийг нэмэх')}
                            </CardTitle>
                        </CardHeader>
                        <Row className='m-0'>
                            <Col md={7} className='mx-0 p-0'>
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <div className='added-cards mb-0 text-center'>
                                        <div className={classnames('cardMaster p-1 rounded border')}>
                                            <div className='content-header mb-2 mt-1'>
                                                <h4 className='content-header'>Хамрах хүрээгээ сонгоно уу</h4>
                                            </div>
                                            <Input
                                                type="radio"
                                                id='scope1'
                                                name='scope'
                                                onChange={(e) => handleSwitchScope(SCOPE_LEVEL_GROUP)}
                                                value={SCOPE_LEVEL_GROUP}
                                                checked={scope === SCOPE_LEVEL_GROUP}
                                                className='me-50'
                                            />
                                            <Label htmlFor='scope1' className='me-2'>
                                                {t('Түвшин бүлэг')}
                                            </Label>
                                            <Input
                                                type="radio"
                                                id='scope2'
                                                name='scope'
                                                onChange={(e) => handleSwitchScope(SCOPE_SUB_GROUP)}
                                                value={SCOPE_SUB_GROUP}
                                                checked={scope === SCOPE_SUB_GROUP}
                                                className='me-50'
                                            />
                                            <Label htmlFor='scope2' className='me-2'>
                                                {t('Дэд бүлэг')}
                                            </Label>
                                            <Input
                                                type="radio"
                                                id='scope3'
                                                name='scope'
                                                onChange={(e) => handleSwitchScope(SCOPE_GROUP)}
                                                value={SCOPE_GROUP}
                                                checked={scope === SCOPE_GROUP}
                                                className='me-50'
                                            />
                                            <Label htmlFor='scope3'>
                                                {t('Анги')}
                                            </Label>
                                            {scopeFilters(scope)}
                                            <Button className='me-0 mt-1' color='primary' type='submit' onClick={() => clearErrors()}>
                                                {t('Хадгалах')}
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </Col>
                            <Col md={5} className='p-0'>
                                <Form onSubmit={handleSubmit(onSubmitStudent)}>
                                    <div className='added-cards mb-0'>
                                        <div className={classnames('cardMaster p-1 rounded border')}>
                                            <div className='content-header mb-2 mt-1 text-center'>
                                                <h4 className='content-header'>Оюутныг кодоор сонгох</h4>
                                            </div>
                                            <Col md={12} className='my-2'>
                                                <Controller
                                                    defaultValue=''
                                                    control={control}
                                                    name='student'
                                                    render={({ field: { value, onChange } }) => {
                                                        return (
                                                            <Select
                                                                id='student'
                                                                name='student'
                                                                classNamePrefix='select'
                                                                className='react-select'
                                                                placeholder={`Хайх`}
                                                                isLoading={isLoadingSO}
                                                                options={students || []}
                                                                value={students.find((c) => c.id === value)}
                                                                noOptionsMessage={() => 'Хоосон байна'}
                                                                onChange={(val) => {
                                                                    onChange(val?.code)
                                                                }}
                                                                onInputChange={(e) => setStudentSearchValue(e)}
                                                                styles={ReactSelectStyles}
                                                                getOptionValue={(option) => option.id}
                                                                getOptionLabel={(option) => `${option.code} ${option.full_name}`}
                                                            />
                                                        )
                                                    }}
                                                />
                                            </Col>
                                            <div className='text-center'>
                                                <Button className='me-0 mt-1 text-end' color='primary' type='submit' onClick={() => clearErrors()}>
                                                    {t('Хадгалах')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col md={5}>
                    <Card md={3}>
                        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                            <div className='d-flex flex-column'>
                                <CardTitle tag='h4' className='mt-50 '>
                                    {t('Асуултын жагсаалт')}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <div className='react-dataTable react-dataTable-selectable-rows mx-50 rounded border my-50'>
                            {isLoadingQ && LoaderQ}
                            <DataTable
                                noHeader
                                pagination
                                className='react-dataTable'
                                noDataComponent={
                                    <div className='mb-2' style={{ marginTop: '27px' }}>
                                        <h5>{t('Асуулт байхгүй байна')}</h5>
                                    </div>
                                }
                                columns={getQuestionColumns(currentPageQ, rowsPerPageQ, question_count)}
                                paginationPerPage={rowsPerPageQ}
                                paginationDefaultPage={currentPageQ}
                                data={question_datas}
                                paginationComponent={getPagination(handlePaginationQ, currentPageQ, rowsPerPageQ, question_count)}
                                fixedHeader
                                fixedHeaderScrollHeight='62vh'
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
            <Card md={12}>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Шалгалт өгөх оюутнуудын жагсаалт')}</CardTitle>
                </CardHeader>
                <Col className='mt-2 my-1 mx-1 d-flex align-items-center mobile-datatable-search'>
                    <Input
                        className='dataTable-filter mb-50'
                        type='text'
                        bsSize='sm'
                        id='search-input'
                        placeholder={t('Хайх')}
                        onChange={handleFilter}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button size='sm' className='ms-50 mb-50' color='primary' onClick={handleSearch}>
                        <Search size={15} />
                        <span className='align-middle ms-50'></span>
                    </Button>
                </Col>
                <div className='react-dataTable react-dataTable-selectable-rows'>
                    {isLoading && LoaderQ}
                    {selectedRowsS?.length > 0 && (
                        <div className='mb-50'>
                            <Button
                                color='danger'
                                onClick={() =>
                                    showWarning({
                                        header: {
                                            title: t('Оюутан устгах')
                                        },
                                        question: t(`Та сонгогдсон оюутнуудыг устгахдаа итгэлтэй байна уу?`),
                                        onClick: () => handleDeleteAllS(),
                                        btnText: t('Устгах')
                                    })
                                }
                            >
                                {t('Устгах')} ({selectedRowsS.length})
                            </Button>
                        </div>
                    )}
                    <DataTable
                        noHeader
                        pagination
                        className='react-dataTable'
                        noDataComponent={
                            <div className='my-2'>
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        }
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleDelete)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        selectableRows
                        onSelectedRowsChange={(state) => onSelectedRowsChangeS(state)}
					    clearSelectedRows={toggledClearRowsS}
                    />
                </div>
            </Card>
        </Fragment>
    )
}
export default AddStudent
