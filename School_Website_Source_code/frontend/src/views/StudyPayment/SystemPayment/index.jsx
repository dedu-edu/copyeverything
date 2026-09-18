// ** React Imports
import { Fragment, useState, useEffect } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, UncontrolledTooltip } from 'reactstrap'

import { ChevronDown, Search } from 'react-feather'

import DataTable from 'react-data-table-component'

import moment from 'moment';

import classnames from "classnames";

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useUpdateEffect from '@hooks/useUpdateEffect'

import { getPagination, ReactSelectStyles, moneyFormat, generateLessonYear } from '@utils'

import { getColumns, getFooter } from './helpers';

import { utils, writeFile } from 'xlsx-js-style';

import { HiOutlineDocumentReport } from "react-icons/hi";

const SystemPayment = () => {

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const { t } = useTranslation()

    const default_page = ['Бүгд', 10, 20, 50, 75, 100]

    const [searchValue, setSearchValue] = useState("");
    const [datas, setDatas] = useState([]);
    const [footerDatas, setFooterDatas] = useState({})
    const [status_option, setStatusOption] = useState([])

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas?.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({ isFullScreen: false })

    const [statusId, setStatusId] = useState('')
    const [degree, setDegree] = useState('')
    const [kindType, setKind] = useState('')
    const [lessonYear, setLessonYear] = useState('')
    const [degreeOption, setDegreeOption] = useState([])

    const typeOption = [
        {
            'id': 1,
            'name': 'Банк'
        },
        {
            'id': 2,
            'name': 'QPay'
        }
    ]
    // Api
    const settingsApi = useApi().settings
    const systemPaymentApi = useApi().payment.systempayment

    async function getDegreeOption() {
        const { success, data } = await fetchData(settingsApi.professionaldegree.get())
        if(success) {
            setDegreeOption(data)
        }
    }

    // Суралцаж буй хэлбэрийн жагсаалт
    async function getStatus() {
        const { success, data } = await fetchData(settingsApi.studentRegisterType.get())
        if (success) {
            setStatusOption(data)
        }
    }

    /* Жагсаалтын дата авах функц */
    async function getDatas() {
        const { success, data } = await allFetch(systemPaymentApi.get(rowsPerPage, currentPage, sortField, searchValue, lessonYear, degree, kindType, statusId))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
            setFooterDatas(data?.footer)

            // Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
            setPageCount(cpage_count)
        }
    }

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

    function handleSearch() {
        getDatas()
    }

    // Хуудас солих үед ажиллах хэсэг
    function handlePagination(page) {
        setCurrentPage(page.selected + 1);
    };

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
    }, [sortField, currentPage, rowsPerPage, searchValue, lessonYear, statusId, kindType, degree])

    useEffect(() => {
        getStatus()
        getDegreeOption()
    }, [])

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
    }

    function convert() {
        const mainData = datas.map((data, idx) => {
            return (
                {
                    '№': idx + 1,
                    'Овог Нэр': data?.full_name || '',
                    'Анги': data?.group_name || '',
                    'Төлсөн дүн': moneyFormat(data?.total_qpay_transaction_amount) || '',
                    'Төлсөн огноо': moment(data?.payed_date).format('YYYY-MM-DD HH:ss:mm') || '',

                }
            )
        })

        const combo = [
            // ...header,
            ...mainData
        ]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Sheet1");

        const staticCells = [
            '№',
            'Овог Нэр',
            'Анги',
            'Төлсөн дүн',
            'Төлсөн огноо',
        ];

        utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A1" });


        const headerCell = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true
            },
            font: {
                sz: 10,
                bold: true
            }
        };

        const defaultCell = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: {
                horizontal: 'left',
                vertical: 'center',
                wrapText: true
            },
            font: {
                sz: 10
            }
        };

        const defaultCenteredCell = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true
            },
            font: {
                sz: 10
            }
        };

        const styleRow = 0;
        const sendRow = datas?.length + 1;
        const styleCol = 0;
        const sendCol = 17;

        for (let row = styleRow; row <= sendRow; row++) {
            for (let col = styleCol; col <= sendCol; col++) {
                const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                worksheet[cellNum].s = row === 0 ? headerCell : col === 0 ? defaultCenteredCell : defaultCell

            }
        }

        const phaseZeroCells = Array.from({ length: 4 }, (_) => { return ({ wch: 10 }) })

        worksheet["!cols"] = [
            { wch: 3 },
            ...phaseZeroCells,
            { wch: 25 },
            { wch: 11 },
            { wch: 11 },
            { wch: 25 },
            { wch: 20 },
        ];

        const phaseOneRow = Array.from({ length: datas.length }, (_) => { return ({ hpx: 30 }) })

        worksheet["!rows"] = [
            { hpx: 40 },
            ...phaseOneRow
        ]

        writeFile(workbook, "Систем ашиглалтын төлбөрийн мэдээлэл.xlsx", { compression: true });
    }

    return (
        <Fragment>
            {isLoading && Loader}
            <Card>
                <CardHeader className="flex-md-row flex-row align-md-items-center align-items-start border-bottom justify-content-between">
                    <CardTitle tag="h4">{t('Систем ашиглалтын төлбөр')}</CardTitle>
                    <div className='d-flex gap-2'>
                        <Button color='primary' className='d-flex align-items-center' id='excel_button' onClick={() => convert()}>
                            <HiOutlineDocumentReport className='me-25' />
                            Excel
                        </Button>
                        <UncontrolledTooltip target='excel_button'>
                            Доорхи хүснэгтэнд харагдаж байгаа мэдээллийн жагсаалтаар эксел файл үүсгэнэ
                        </UncontrolledTooltip>
                    </div>
                </CardHeader>
                <Row className='d-flex justify-content-start w-100 align-items-center mx-0 '>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="lesson_year">
                            {t('Хичээлийн жил')}
                        </Label>
                            <Select
                                name="lesson_year"
                                id="lesson_year"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={generateLessonYear(10) || []}
                                value={generateLessonYear(10).find((c) => c.id === lessonYear)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setLessonYear(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="degree">
                            {t('Боловсролын зэрэг')}
                        </Label>
                        <Select
                            name="degree"
                            id="degree"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={degreeOption || []}
                            value={degreeOption.find((c) => c.id === degree)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                setDegree(val?.degree_code || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.degree_code}
                            getOptionLabel={(option) => option.degree_name}
                        />
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="kind">
                            {t('Төлбөрийн төрөл')}
                        </Label>
                        <Select
                            name="kind"
                            id="kind"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={typeOption || []}
                            value={typeOption.find((c) => c.id === kindType)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                               setKind(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col sm={6} md={3} className='mt-1'>
                        <Label className="form-label" for="status">
                            {t("Суралцагчийн төлөв")}
                        </Label>
                        <Select
                            name="status"
                            id="status"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={status_option || []}
                            value={status_option.find((c) => c.id === statusId)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                setStatusId(val?.id || "")
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <Row className="justify-content-between mx-0 mt-1" >
                    <Col className='d-flex align-items-center justify-content-start' md={4}>
                        <Col md={3} sm={2} className='pe-1'>
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
                        <Col md={9} sm={3}>
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
                <div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftOneRightOne'>
                    <DataTable
                        noHeader
                        paginationServer
                        pagination
                        className='react-dataTable'
                        progressPending={isTableLoading}
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
                        print='true'
                        theme="solarized"
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage === 'Бүгд' ? 1 : rowsPerPage, total_count)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage === 'Бүгд' ? 1 : rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage === 'Бүгд' ? total_count : rowsPerPage, total_count, '', '')}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        direction="auto"
                        defaultSortFieldId={'payed_date'}
                        style={{ border: '1px solid red' }}
                    />
                </div>
            </Card>
        </Fragment>
    )
}

export default SystemPayment;