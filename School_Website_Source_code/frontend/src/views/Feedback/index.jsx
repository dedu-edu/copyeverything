import '@styles/react/libs/flatpickr/flatpickr.scss'
import classnames from "classnames"
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, FileText, Search, X } from 'react-feather'
import Flatpickr from 'react-flatpickr'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Input, Label, Row, Spinner } from 'reactstrap'
import { utils, writeFile } from 'xlsx-js-style'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { getPagination, ReactSelectStyles } from '@utils'

import DetailModal from './DetailModal'
import { excelDownLoad } from './downloadExcel'
import { getColumns } from './helpers'

const FEEDBACK_TYPES = [
    {
        id: 1,
        name: 'Алдаа',
    },
    {
        id: 2,
        name: 'Санал хүсэлт',
    },
    {
        id: 3,
        name: 'Бусад',
    },
]

const default_page = ['Бүгд', 10, 20, 50, 75, 100]

var values = {
    type: '',
    sub_org: '',
    created_at_start: '',
    created_at_end: '',
}

export default function Feedback() {
    // other hooks
    const { t } = useTranslation()
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });
    const fpStartRef = useRef()
    const fpEndRef = useRef()

    // other states
    const [sortField, setSort] = useState('')

    // filters
    const [searchValue, setSearchValue] = useState("");
    const [selectValue, setSelectValue] = useState(values);

    // get-API responses
    const [datas, setDatas] = useState([]);
    const [subSchools, setSubSchools] = useState([])

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(default_page[1])
    const [totalCount, setTotalCount] = useState(datas.length ?? 1)

    // API
    const feedbackApi = useApi().feedback
    const subSchoolApi = useApi().hrms.subschool

    // #region subschools
    async function getSubSchools() {
        const { success, data } = await fetchData(subSchoolApi.get())
        if (success) setSubSchools(data ?? [])
    }

    useEffect(() => {
        getSubSchools()
    }, [])
    // #endregion

    // #region datatable manipulation
    async function getDatas() {
        const { success, data } = await fetchData(feedbackApi.get({
            limit: rowsPerPage,
            page: currentPage,
            sorting: sortField,
            search: searchValue,
            ...selectValue,
        }))

        if (success) {
            setDatas(data?.results ?? [])
            setTotalCount(data?.count ?? 0)
        }
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useEffect(() => {
        if (searchValue.length == 0) {
            getDatas();
        } else {
            const timeoutId = setTimeout(() => {
                getDatas();
            }, 600);

            return () => clearTimeout(timeoutId);
        }
    }, [sortField, currentPage, rowsPerPage, searchValue, selectValue.type, selectValue.sub_org, selectValue.created_at_start, selectValue.created_at_end])

    // ** Шүүж хайх хэсэг
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

    function handleSearch() {
        getDatas()
    }

    // Хуудаслалт
    function handlePerPage(e) {
        setRowsPerPage(e.target.value === 'Бүгд' ? totalCount : parseInt(e.target.value))
    }

    // Хуудас солих үед ажиллах хэсэг
    function handlePagination(page) {
        setCurrentPage(page.selected + 1);
    };
    // #endregion

    // #region detail modal
    const [detailModal, setDetailModal] = useState(false)
    const [detailModalData, setDetailModalData] = useState(null)

    function handleDetailModal(row) {
        setDetailModal(!detailModal)
        setDetailModalData(row ?? null)
    }
    // #endregion

    // excel
    function excelHandler() {
        const getDataParams = {
            limit: rowsPerPage,
            page: currentPage,
            sorting: sortField,
            search: searchValue,
            ...selectValue,
        }

        const hooks = {
            feedbackApi,
            fetchData
        }

        excelDownLoad(getDataParams, hooks)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {t('Санал хүсэлтийн жагсаалт')}
                </CardTitle>
                <div className='d-flex justify-content-end mt-1'>
                    <Button color='primary' className='d-flex align-items-center ms-1' onClick={() => excelHandler()} disabled={isLoading}>
                        <FileText className='me-50' size={14} />
                        <div>
                            {t('Excel татах')}
                        </div>
                    </Button>
                </div>
            </CardHeader>
            <CardBody>
                {isLoading && Loader}
                <Row className="justify-content-start mt-1">
                    <Col md={3}>
                        {(() => {
                            const fieldName = 'type'

                            return (
                                <>
                                    <Label for={fieldName}>{t('Төрөл')}</Label>
                                    <Select
                                        name={fieldName}
                                        id={fieldName}
                                        classNamePrefix='select'
                                        isClearable
                                        placeholder={`-- ${t('Сонгоно уу')} --`}
                                        options={FEEDBACK_TYPES ?? []}
                                        value={FEEDBACK_TYPES.find((c) => c.id === selectValue[fieldName])}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    type: val?.id ?? '',
                                                }
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                </>
                            )
                        })()}
                    </Col>
                    <Col md={3}>
                        {
                            (() => {
                                const fieldName = 'sub_org'

                                return (
                                    <>
                                        <Label className="form-label" for={fieldName}>
                                            {t('Сургууль')}
                                        </Label>
                                        <Select
                                            name={fieldName}
                                            id={fieldName}
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select')}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={subSchools ?? []}
                                            value={subSchools.find((c) => c.id === selectValue[fieldName])}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        sub_org: val?.id ?? '',
                                                    }
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    </>
                                )
                            })()
                        }
                    </Col>
                </Row>
                <Row className='justify-content-start mt-1 '>
                    <Col className='my-0 py-0' md={3}>
                        <Label className="form-label" for="">
                            {t('Эхлэх огноо')}
                        </Label>
                        <div className='d-flex align-items-center'>
                            <Flatpickr
                                ref={fpStartRef}
                                className='form-control form-control-sm bg-white'
                                placeholder={`-- ${t('Сонгоно уу')} --`}
                                onChange={(selectedDates, dateStr) => {
                                    const val = (
                                        selectedDates.length === 0
                                            ? ''
                                            : moment(dateStr).format('YYYY-MM-DD HH:mm')
                                    );

                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            created_at_start: val,
                                        }
                                    })
                                }}
                                value={selectValue.created_at_start}
                                options={{
                                    time_24hr: true,
                                    enableTime: true,
                                    dateFormat: "Y-m-d H:i",
                                    mode: "single",
                                }}
                            />
                            <X className="cursor-pointer ms-50" size={15} onClick={() => fpStartRef.current.flatpickr.clear()} />
                        </div>
                    </Col>
                    <Col className='my-0 py-0' md={3}>
                        <Label className="form-label" for="">
                            {t('Дуусах огноо')}
                        </Label>
                        <div className='d-flex align-items-center'>
                            <Flatpickr
                                ref={fpEndRef}
                                className='form-control form-control-sm bg-white'
                                placeholder={`-- Сонгоно уу --`}
                                onChange={(selectedDates, dateStr) => {
                                    const val = (
                                        selectedDates.length === 0
                                            ? ''
                                            : moment(dateStr).format('YYYY-MM-DD HH:mm')
                                    );

                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            created_at_end: val,
                                        }
                                    })
                                }}
                                value={selectValue.created_at_end}
                                options={{
                                    time_24hr: true,
                                    enableTime: true,
                                    dateFormat: "Y-m-d H:i",
                                    mode: "single",
                                }}
                            />
                            <X className="cursor-pointer ms-50" size={15} onClick={() => fpEndRef.current.flatpickr.clear()} />
                        </div>
                    </Col>
                </Row>
                <Row className="justify-content-between">
                    <Col className='d-flex align-items-center justify-content-start' md={4}>
                        <Col md={2} sm={4} className='pe-1'>
                            <Input
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px", maxWidth: '80px' }}
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
                        <Col>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t("Хайх үг....")}
                            value={searchValue}
                            onChange={(e) => { handleFilter(e) }}
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
                <div className="react-dataTable mx-50 rounded border my-50">
                    <DataTable
                        noHeader
                        paginationServer
                        pagination
                        className='react-dataTable-header-md'
                        progressPending={isLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' size='sm' /><h5>{t('Түр хүлээнэ үү')}...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        print='true'
                        theme="solarized"
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage, totalCount, t, handleDetailModal)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, totalCount)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        direction="auto"
                        defaultSortFieldId={'created_at'}
                        defaultSortAsc={false}
                    />
                </div>
            </CardBody>
            {
                detailModal &&
                <DetailModal
                    isOpen={detailModal}
                    handleModal={handleDetailModal}
                    modalData={detailModalData}
                />

            }
        </Card>
    )
}
