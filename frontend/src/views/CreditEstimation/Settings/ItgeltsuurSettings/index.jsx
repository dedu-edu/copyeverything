// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, Alert } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { ChevronDown, Plus, Search } from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { getPagination, get_lesson_types, ReactSelectStyles, student_count, degree_type, hutulbur_student_type } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select'
import classnames from 'classnames'
import SchoolContext from '@context/SchoolContext'


const ItgeltsuurSettings = () => {

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState("");

    const [filteredData, setFilteredData] = useState([]);
    const [datas, setDatas] = useState([]);
    const default_page = [20, 50, 75, 100]

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    const [edit_id, setEditId] = useState('')
    const { control} = useForm();
    const [lesson_type_option, setLessonTypeOption] = useState(get_lesson_types())

    // Loader
    const { isLoading, fetchData } = useLoader({});

    // Api
    const itgeltsuurApi = useApi().credit.itgeltsuur

    // Modal
    const [modal, setModal] = useState(false);
    const [lesson, setLesson] = useState('');
    const [studentNum, setstudentNum] = useState('');
    const [degree, setDegree] = useState('');
    const [hutulburStudent, sethutulburStudent] = useState('');
    const { school_id } = useContext(SchoolContext)

    /* Модал setState функц */
    const handleModal = () => {
        setModal(!modal)
        if(modal){
            setEditId()
        }
    }

    // Засах функц
    function handleUpdateModal(id) {
        if(id){
            setEditId(id)
        }
        handleModal()
    }

    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage,lesson, degree, studentNum, hutulburStudent, searchValue])

    /* Жагсаалтын дата авах функц */
    async function getDatas() {
        const { success, data } = await fetchData(itgeltsuurApi.getAll(rowsPerPage, currentPage, lesson, degree, studentNum, hutulburStudent, searchValue))
        if(success) {
            setDatas(data.results)
            setTotalCount(data.count)
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
	}, [searchValue]);

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }
    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    return (
        <Fragment>
            <Card body={true}>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Илгэлцүүрийн жагсаалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' disabled={!school_id} onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mb-50 mt-50">
                    <Col sm={2}>
                        <Label className='form-label' for='lesson_type'>
                            {t('Хичээлийн төрөл')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson_type"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="lesson_type"
                                        id="lesson_type"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={lesson_type_option ?? []}
                                        value={lesson_type_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            onChange(val?.id ?? '')
                                            setLesson(val?.id)
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                    </Col>
                    <Col sm={2}>
                        <Label className='form-label' for='degree'>
                            {t('Зэрэг')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="degree"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="degree"
                                        id="degree"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={degree_type ?? []}
                                        value={degree_type.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            onChange(val?.id ?? '')
                                            setDegree(val?.id)
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                    </Col>
                    <Col sm={2}>
                        <Label className='form-label' for='student_type'>
                            {t('Суралцагчийн тоо')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="student_type"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="student_type"
                                        id="student_type"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={student_count ?? []}
                                        value={student_count.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            onChange(val?.id ?? '')
                                            setstudentNum(val?.id)
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                    </Col>
                    <Col sm={2}>
                        <Label className='form-label' for='hutul_student_type'>
                            {t('Боловсролын түвшин')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="hutul_student_type"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="hutul_student_type"
                                        id="hutul_student_type"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={hutulbur_student_type ?? []}
                                        value={hutulbur_student_type.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            onChange(val?.id ?? '')
                                            sethutulburStudent(val?.id)
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={2} sm={2}>
                    <Input
                        className='dataTable-filter mb-50'
                        type='text'
                        bsSize='sm'
                        id='search-input'
                        placeholder={t("Хайх")}
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
                <Col className='d-flex align-items-center justify-content-start mt-1' md={3} sm={6}>
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
                </Row>
                <div className='react-dataTable react-dataTable-selectable-rows' id="datatableLeftTwo">
                    <DataTable
                        noHeader
                        pagination
                        className='react-dataTable'
                        progressPending={isLoading}
                        progressComponent={(
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' color={window.localStorage.skin === '"dark"' ? 'white' : 'dark'} size='sm'/><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        )}
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        columns={getColumns(currentPage, rowsPerPage, datas, handleUpdateModal, school_id)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, filteredData)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
                { modal &&  <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} editId={edit_id} handleEdit={handleUpdateModal} user={user}/>}
            </Card>
        </Fragment>
    )
}

export default ItgeltsuurSettings;
