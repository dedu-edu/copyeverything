// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'

import { useTranslation } from 'react-i18next'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { getPagination } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'

const RestPeriod = () => {

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");

    const [datas, setDatas] = useState([]);
    const [edit_id, setEditId] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Loader
    const { isLoading, fetchData } = useLoader({});

    // Modal
    const [modal, setModal] = useState(false);

    /* Модал setState функц */
    const handleModal = () => {
        setModal(!modal)
        if(modal){
            setEditId()
        }
    }

    // Засах функц
    function handleUpdateModal(id) {
        setEditId(id)
        handleModal()
    }

    const restPeriodApi = useApi().settings.rest_period

    /* Жагсаалтын дата авах функц */
    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await fetchData(restPeriodApi.get(rowsPerPage, currentPage, searchValue))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    // Хуудас солих үед ажиллах хэсэг
    function handlePagination(page) {
        setCurrentPage(page.selected + 1);
    };

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useEffect(() => {
        getDatas();
    }, [rowsPerPage, currentPage]);

    useEffect(() => {
        if(!searchValue) getDatas()
    }, [searchValue])

    async function handleDelete(id) {
        const { success } = await fetchData(restPeriodApi.delete(id))
        if(success) {
            getDatas()
        }
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Улирлын амралтын хугацаа тохируулах')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-settings-аctiveyear-create') ? false : true} color='primary' onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0">
                    <Col className='d-flex align-items-center mt-1' md={6} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t('Хайх')}
                            value={searchValue}
                            onChange={(e) => {
                                handleFilter(e)
                            }}
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
                {isLoading ?
                    <div className="my-2 text-center" sm={12}>
                        <Spinner size='sm' />
                        <span className='ms-50'>{t('Улирлын хаалт хийж байна. Та түр хүлээнэ үү')}...</span>
                    </div>
                :
                    <div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftTwoRightOne'>
                        <DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            columns={getColumns(currentPage, rowsPerPage, datas, handleUpdateModal, user, handleDelete)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
                    </div>
                }
                {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} editId={edit_id}/>}
            </Card>
        </Fragment>
    )
}

export default RestPeriod;
