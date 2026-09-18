import React, { Fragment, useState, useEffect } from 'react'

import { ChevronDown, Plus, Search } from 'react-feather'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader'

import {
    Row,
    CardHeader,
    Card,
    CardTitle,
    Button,
    Col,
    Input,
    Label,
    Spinner
} from 'reactstrap'

import DataTable from 'react-data-table-component'

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import { getPagination, ReactSelectStyles } from '@utils'

import Addmodal from './Add'
import { getColumns } from './helpers'

const ClubSettings = () => {

    const { t } = useTranslation()

    const default_page = [10, 15, 50, 75, 100]

    const [datas, setDatas] = useState([])
    const [edit_id, setEditId] = useState('')
    const [build_id, setBuild] = useState('')
    const [sortField, setSortField] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState("")
    const [buildingOption, setBuildingOption] = useState([])

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Modal
	const [modal, setModal] = useState(false);

    // Loader
    const { isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    // Api
	const clubSettingsApi = useApi().request.club.settings

    // Нэмэх функц
    const handleModal = () => {
        setModal(!modal)
        setEditId('')
    }

    async function getDatas() {
        const { success, data } = await allFetch(clubSettingsApi.get(rowsPerPage, currentPage, sortField, searchValue))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    // Устгах функц
    const handleDelete = async (delete_id) => {
        const { success } = await fetchData(clubSettingsApi.delete(delete_id))
        if(success) {
            getDatas()
        }
    }

    // Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = e => {
        const value = e.target.value.trimStart();
		setSearchValue(value)
	}

    function handleSearch() {getDatas()}

    useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [currentPage, rowsPerPage, sortField, searchValue, build_id])

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSortField(column.sortField)
        } else {
            setSortField('-' + column.sortField)
        }
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    function handleUpdateModal(id) {
        setModal(!modal)
        setEditId(id)
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Клубийн бүртгэлийн хуваарь')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' onClick={() => handleModal()}>
                            <Plus size={15}/>
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mb-1" sm={12}>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={3} sm={4} xs={5} className='pe-1'>
                            <Input
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
					<Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
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
                <div className='react-dataTable react-dataTable-selectable-rows' id="datatableLeftTwoRightOne">
                    <DataTable
                        noHeader
                        pagination
                        className='react-dataTable'
                        progressPending={isTableLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleDelete, handleUpdateModal)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        onSort={handleSort}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
                {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} editId={edit_id} />}
            </Card>
        </Fragment>
    )
}

export default ClubSettings
