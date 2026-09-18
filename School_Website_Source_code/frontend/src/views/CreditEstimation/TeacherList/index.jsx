import { Fragment, useContext, useEffect, useState } from 'react';

import AuthContext from '@context/AuthContext';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { getPagination, ReactSelectStyles } from '@utils';
import classnames from 'classnames';
import DataTable from 'react-data-table-component';
import { ChevronDown, Search } from 'react-feather';
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    Col,
    Input,
    Label,
    Row,
    Spinner,
} from 'reactstrap';
import { getColumns } from './helpers';

import { useNavigate } from 'react-router-dom';
const index = () => {

    const { control, formState: { errors } } = useForm({});
    const { user } = useContext(AuthContext)
	const navigate = useNavigate()

    const default_page = [10, 15, 50, 75, 100]
	const { t } = useTranslation()
    const [modal, setModal] = useState(false)
    const [datas, setDatas] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState('')
    const [total_count, setTotalCount] = useState(1)
    const [sortField, setSort] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const [department_data, setDepartmentData] = useState([]);
    const [departmentId, setDepartmentId] = useState([]);

	const BApi = useApi(true).b_time.list;
	const departmentApi = useApi().hrms.department

    async function getDatas() {

        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(BApi.get(rowsPerPage, currentPage, sortField, searchValue, departmentId))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    /* Тэнхим дата авах функц */
	async function getDepartmentOption() {
		const { success, data } = await fetchData(departmentApi.getSelectSchool())
		if (success) {
			setDepartmentData(data)
		}
	}

    useEffect(() => {
        getDepartmentOption()
    },[])

    const editModal = (id) => {
		navigate(`/credit/profile/${id}/`)
    }
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }
    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

	useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
			} else {
		const timeoutId = setTimeout(() => {
			getDatas();
		}, 600);

		return () => clearTimeout(timeoutId);
    }
    }, [currentPage, rowsPerPage, sortField, searchValue, departmentId])

    return (
        <Fragment>
            <Card>
            {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Цагийн тооцоо багшийн жагсаалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1 gap-1'>
                        <></>
                    </div>
                </CardHeader>
                <Row className='mx-0 mt-50'>
                    <Col md={3}>
                        <Label className="form-label" for="salbar">
                            {t('Тэнхим')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="salbar"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="salbar"
                                        id="salbar"
                                        classNamePrefix='select'
                                        isClearable={true}
                                        className='react-select'
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={department_data || []}
                                        value={value && department_data.find((c) => c.id === departmentId)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setDepartmentId(val?.id)
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
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
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
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
                <div className='react-dataTable react-dataTable-selectable-rows'>
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
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
                        onSort={handleSort}
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count, editModal)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
        </Fragment>
    )
}

export default index;