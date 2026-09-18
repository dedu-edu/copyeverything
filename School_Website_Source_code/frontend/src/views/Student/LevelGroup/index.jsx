// ** React Imports
import { Fragment, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Plus, Search } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardHeader, CardTitle, Col, Input, Label, Row, Spinner } from 'reactstrap'

import AuthContext from '@context/AuthContext'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import useUpdateEffect from '@hooks/useUpdateEffect'
import { getPagination } from '@utils'

import Addmodal from './Add'
import DetailModal from './Detail'
import { getColumns } from './helpers'

const LevelGroup = () => {
    const { user } = useContext(AuthContext)

    const { t } = useTranslation()

    const default_page = [15, 30, 45, 65, 100]

    const [modal, setModal] = useState(false)
    const [detailModal, setDetailModal] = useState(false)

    const [datas, setDatas] = useState([])
    const [modalData, setModalData] = useState([])
    const [editId, setEditId] = useState('')

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

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({ isFullScreen: true })

    const levelGroupApi = useApi().student.levelGroup

    // API
    useUpdateEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage])

    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(levelGroupApi.get(rowsPerPage, currentPage, sortField, searchValue))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    /* Устгах функц */
    const handleDelete = async (id) => {
        const { success } = await fetchData(levelGroupApi.delete(id))
        if (success) {
            getDatas()
        }
    }

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    // ** Function to handle Modal toggle
    const handleDetailModal = (data, scope) => {
        setModalData({ data, scope })
        setDetailModal(!detailModal)
    }

    const editModal = (editId) => {
        setEditId(editId)
        setModal(!modal)
    }

    // ** Function to handle filter
    const handleFilter = (e) => {
        const value = e.target.value.trimStart()
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
        setCurrentPage(page.selected + 1)
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useEffect(() => {
        if (searchValue.length == 0) {
            getDatas()
        } else {
            const timeoutId = setTimeout(() => {
                getDatas()
            }, 600)

            return () => clearTimeout(timeoutId)
        }
    }, [searchValue])

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}

                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Түвшин бүлэг бүртгэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => handleModal()}
                            className='ms-1'
                            disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-student-group-create') ? false : true}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
                                className='dataTable-select me-1 mb-50'
                                type='select'
                                bsSize='sm'
                                style={{ height: '30px' }}
                                value={rowsPerPage}
                                onChange={(e) => handlePerPage(e)}
                            >
                                {default_page.map((page, idx) => (
                                    <option key={idx} value={page}>
                                        {page}
                                    </option>
                                ))}
                            </Input>
                        </Col>
                        <Col md={10} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t('Хайх')}
                            value={searchValue}
                            onChange={handleFilter}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button size='sm' className='ms-50 mb-50' color='primary' onClick={handleSearch}>
                            <Search size={15} />
                            <span className='align-middle ms-50'></span>
                        </Button>
                    </Col>
                </Row>
                <div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftTwoRightOne'>
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
                        className='react-dataTable'
                        progressPending={isTableLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' size='sm' />
                                <h5>{t('Түр хүлээнэ үү')}...</h5>
                            </div>
                        }
                        noDataComponent={
                            <div className='my-2'>
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        }
                        onSort={handleSort}
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user, handleDetailModal)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && (
                <Addmodal
                    open={modal}
                    handleModal={() => {
                        editId ? editModal('') : handleModal()
                    }}
                    refreshDatas={getDatas}
                    editId={editId}
                />
            )}
            {detailModal && <DetailModal open={detailModal} handleModal={handleDetailModal} data={modalData.data} scope={modalData.scope} />}
        </Fragment>
    )
}

export default LevelGroup
