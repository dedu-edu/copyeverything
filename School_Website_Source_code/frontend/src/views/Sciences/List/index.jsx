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
    Alert,
} from 'reactstrap'

import {  Search, ChevronsLeft  } from 'react-feather'

import { useTranslation } from 'react-i18next'
// import { useForm, Controller } from "react-hook-form";
// import { useNavigate } from 'react-router-dom'

import Select from 'react-select'
import DataTable from 'react-data-table-component'

import classnames from 'classnames'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns, getColumnsDetail } from './helpers'
import AuthContext from '@src/utility/context/AuthContext'
import useModal from "@hooks/useModal";
// import useUpdateEffect from '@src/utility/hooks/useUpdateEffect'
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'

const List = () => {

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { showWarning } = useModal()

    const default_page = ['Бүгд', 10, 15, 50, 75, 100]
    const [datas, setDatas] = useState([])

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState('Бүгд')

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')
    const [isAllSend, setIsAllSend] = useState(false)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    const [dep_option, setDepOption] = useState([])
    const [schoolOption, setSchoolOption] = useState([])

    const location = useLocation()
    const state = location?.state || ''                         // шутг мэргэжилтэн эш хяналтаас сонгосон тэнхимийн Id


    // const [schoolId, setSchoolId] = useState((window.sessionStorage.getItem('school') || '')|| user?.school_id )
    // const [is_solved, setIsSolved] = useState(false)
    const [check_dep, setCheckDep] = useState(false)            // тэнхимийн эрхлэгч шийдвэрлэчихсэн
    const [check_science, setCheckScience] = useState(false)    // Эрдэм шинжилгээ, судалгаа хариуцсан шийдвэрлэчихсэн эсэх


    const navigate = useNavigate()
    const scienceApi = useApi().science.list

    // Api
    const estimateApi = useApi().science.list
    const departmentApi = useApi().hrms.department
    const schoolApi = useApi().hrms.subschool

    var is_department = false
    if (user?.permissions?.includes('lms-profession-department-approve') && user?.department) {
        is_department = true
    }

    var is_science = false
    if (user?.permissions?.includes('lms-profession-list-approve')) {
        is_science = true
    }

    // department
    const [dep_id, setDepId] = useState(
    user?.permissions?.includes('lms-science-control-read')
        ? window.sessionStorage.getItem('depId') || state?.depId || ''
        : user?.department || ''
    )

    // school
    const [schoolId, setSchoolId] = useState(
    user?.permissions?.includes('lms-science-control-read')
        ? window.sessionStorage.getItem('schoolId') || state?.schoolId || ''
        : user?.school_id || ''
    )
    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)
        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }
        let department_id = dep_id
        let school_id = schoolId
        if (user?.permissions?.includes('lms-profession-department-approve') && user?.department) {
            department_id = user?.department
            school_id = user?.school_id
        }
        if (school_id && school_id != 'undefined') {
            const { success, data } = await allFetch(estimateApi.get(rowsPerPage, currentPage, searchValue,  department_id, school_id))
            if (success) {
                setTotalCount(data?.count)
                setDatas(data?.results)
            }
        }
    }

    /**Тэнхимын жагсаалт */
    async function getDepartment() {
        const { success, data } = await fetchData(departmentApi.getSelectSchool(schoolId))
        if(success) {
            setDepOption(data)
        }
    }

    /**Сургуулийн жагсаалт */
    async function getSchool() {
        const { success, data } = await fetchData(schoolApi.get())
        if(success) {
            setSchoolOption(data)
        }
    }

    useEffect(
        () =>
        {
            if (datas?.length > 0) {
                var send_count = datas?.filter((c) => c.send_type === true)
                if (send_count && send_count?.length == total_count) {
                    setIsAllSend(true)
                } else {
                    setIsAllSend(false)
                }

                var dep_count = datas?.filter((c) => c.check_dep === true)

                if (dep_count && dep_count?.length == total_count) {
                    setCheckDep(true)
                } else {
                    setCheckDep(false)
                }

                var science_count = datas?.filter((c) => c.check_science === true)
                if (science_count && science_count?.length == total_count) {
                    setCheckScience(true)
                } else {
                    setCheckScience(false)
                }
            }
        },
        [datas]
    )

    useEffect(() => {
        getSchool()
    },[])

    useEffect(() => {
        getDepartment()
    },[schoolId])

    useEffect(() => {
        getDatas()
    }, [ currentPage, rowsPerPage, dep_id, schoolId])

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
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

    /* Хүсэлт илгээх */
    async function sendRequest () {
        const { success } = await fetchData(scienceApi.put(user?.department))
        if (success) {
            getDatas()
        }
    }

    /* Хүсэлт буцаах */
    async function sendBackRequest (id) {
        const { success } = await fetchData(scienceApi.putRequest(id))
        if (success) {
            getDatas()
        }
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Эрдэм шинжилгээний гүйцэтгэлийн онооны жагсаалт')}</CardTitle>
                    {
                        is_department
                        ?
                            check_dep && isAllSend
                            ?
                                check_dep
                                &&
                                    <Button>Хүсэлт илгээcэн</Button>
                            :
                                <Button
                                    color='primary'
                                    size='sm'
                                    onClick={() => showWarning({
                                        header: {
                                            title: `${t('Хүсэлт илгээх')}`,
                                        },
                                        question: `ШИНЖЛЭХ УХААН, ТЕХНОЛОГИЙН ГАЗАР-т багш нараас ирсэн файлыг шалгуулахаар хүсэлт илгээж байна. Хүсэлт илгээсний дараа багш файлаа засварлах боломжгүйг анхаарна уу.`,
                                        onClick: () => sendRequest(),
                                        btnText: 'Илгээх',
                                    })}
                                    disabled={!isAllSend}
                                >
                                    Хүсэлт илгээх
                                </Button>
                        :
                        ''

                    }
                </CardHeader>
                {
                    (is_department && !isAllSend)
                    &&
                    <Row className='m-1'>
                        <Alert className='p-1' color='warning'>
                            Багш нарын хүсэлт бүрэн ирээгүй тул ШИНЖЛЭХ УХААН, ТЕХНОЛОГИЙН ГАЗАР-т ХҮСЭЛТ
                            ИЛГЭЭХ боломжгүй.
                        </Alert>
                    </Row>
                }
                <Row className='mx-0 mt-50 mb-50'>
                    <Col className='mb-1'>
                        {
                            user?.permissions?.includes('lms-science-control-read') &&
                            <div role="button" style={{fontSize: "15px"}} onClick={() => navigate('/research/b-control/')}>
                                <ChevronsLeft/>{t('Буцах')}
                            </div>
                        }
                    </Col>
                    <Col md={3} className='mb-1'>
                        <Label className="form-label" for="school">
                            {t('Сургууль')}
                        </Label>
                        <Select
                            name="school"
                            id="school"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            isDisabled={user?.permissions?.includes('lms-science-department-approve') && !user?.is_superuser}
                            placeholder={t('-- Сонгоно уу --')}
                            options={schoolOption || []}
                            value={schoolOption?.find((c) => c.id == schoolId)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSchoolId(val?.id)
                                window.sessionStorage.setItem('school',is_department ? val?.id :state?.schoolId)

                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} className='mb-1'>
                        <Label className="form-label" for="department">
                            {t('Тэнхим')}
                        </Label>
                        <Select
                            name="department"
                            id="department"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            isDisabled={user?.permissions?.includes('lms-science-department-approve') && !user?.is_superuser}
                            placeholder={t('-- Сонгоно уу --')}
                            options={dep_option || []}
                            value={dep_option.find((c) => c.id == dep_id)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setDepId(val?.id || '' )
                                window.sessionStorage.setItem('department', is_department ? val?.id: state?.depId)
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    {/* <Col md={3} className='mb-1'>
                        <Label className="form-label" for="teacher">
                            {t('Багш')}
                        </Label>
                        <Select
                            name="teacher"
                            id="teacher"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={teacherOption || []}
                            value={teacherOption.find((c) => c.id === teacherId)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setTeacherId(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => `${option?.last_name[0]}.${option?.first_name}`}
                        />
                    </Col> */}
                </Row>
                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={4} xl={3} className='pe-1'>
                            <Input
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px" }}
                                value={rowsPerPage}
                                onChange={e => handlePerPage(e)}
                            >
                                {default_page.map((page, idx) => (
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
                <div className='react-dataTable react-dataTable-selectable-rows mx-1'>
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
                        columns={getColumns(currentPage, (rowsPerPage === 'Бүгд' ? total_count : rowsPerPage), total_count, is_department, is_science, check_science, check_dep, sendBackRequest)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage === 'Бүгд' ? total_count : rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        selectableRowDisabled={user?.permissions?.includes('lms-science-department-approve') ? false : true}
                    />
                </div>
            </Card>
            {/* {
                is_solved
                && <Solved is_open={is_solved} solved_data={datas} handleSolvedModal={handleSolvedModal} getDatas={getDatas}/>
            } */}
        </Fragment>
    )
}

export default List;
