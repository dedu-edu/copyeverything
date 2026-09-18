import { Fragment, useEffect, useState } from 'react';

import {
	Col,
	Row,
	Input,
	Label,
	Button,
	Spinner,
	Card,
	CardTitle,
	CardHeader,
} from 'reactstrap'

import { Search, ChevronDown } from 'react-feather';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import DataTable from 'react-data-table-component'

import { getPagination, ReactSelectStyles } from '@utils'

import classnames from "classnames";

import { getColumns } from './helpers';
import excelDownload from '@src/utility/excelDownload'
import DetailModal from './Detail'

const AllStudentList = () => {

    const { t } = useTranslation()

    const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: true })
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    const default_page = [10, 15, 50, 75, 100, 'Бүгд']

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState('');
    const [datas, setDatas] = useState([])
    const [sortField, setSort] = useState('')
    const [total_count, setTotalCount] = useState(1)
    const [club_option, setClubOption] = useState([])
    const [detail_data, setDetailData] = useState([])

    const [club_id, setClubId] = useState('')
    const [type_id, setTypeId] = useState('')
	const [anket_modal, setAnketModal] = useState(false)

    const type_option =[
        {
            'id': 1,
            'name': 'Оюутан илгээсэн'
        },
		{
            'id': 2,
            'name': 'Оюутан цуцалсан'
        },
        {
            'id': 3,
            'name': 'Зөвшөөрсөн'
        },
        {
            'id': 4,
            'name': 'Татгалзсан'
        },
		{
            'id': 5,
            'name': 'Хүлээгдэж буй'
        }
    ]

    // Api
    const clubApi = useApi().request.club

    async function getClubOption() {
        const { success, data } = await fetchData(clubApi.getList())
        if(success) {
            setClubOption(data)
        }
    }

    useEffect(() => {
        getClubOption()
    },[])

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handlePerPage(e) {
		setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
    }

    async function getDatas() {
        const { success, data } = await allFetch(clubApi.getRegisterStudent(rowsPerPage, currentPage, sortField, searchValue, club_id, type_id))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage, sortField, club_id, type_id])

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

	/** excel file аар татуулах датаг backend-ээс авах */
	async function excelToDownload() {
		const rowInfo = {
			headers: [
				'№',
				'Клубийн нэр',
				'Клубийн тэргүүн',
				'Оюутны код',
				'Нэр',
				'Хүсэлт',
				'Хүсэлтийн хариу',
				'Төлөв',
				'Суралцаж буй мэргэжил',
				'Суралцаж буй сургууль',
				'Анги, хэсэг',
				'Сургуулийн мэйл',
				'Холбоо барих утасны дугаар',
				'Яаралтай үед холбогдох утасны дугаар',
				'Давуу тал',
				'Сул тал',
				'Сонирхол болон хобби',
				'Хэлний мэдлэг, оноотой эсэх',
				'Компютерийн хэрэглээний программын мэдлэгээ тодорхойлно уу',
				'Ямар нэг урлаг, спортын авьяас байгаа эсэх',
				'Facebook хаягийн холбоос',
				'Өмнө нь ямар нэг олон нийтийн болон сайн дурын идэвхитэй үйл ажиллагаа хийж байсан туршлага',
				'Эрдэм шинжилгээний ажилд оролцож байсан эсэх',
			],

			datas: [
				'index',
				'club_name',
				'leader_name',
				'student_code',
				'student_full_name',
				'description',
				'answer',
				'type_name',
				'anket.profession',
				'anket.school',
				'anket.group',
				'anket.email',
				'anket.phone_number',
				'anket.emergency',
				'anket.advantages',
				'anket.weakness',
				'anket.interesting',
				'anket.language',
				'anket.com_ability',
				'anket.art_sport',
				'anket.link',
				'anket.volentuur_activate',
				'anket.work',
			]
		}
		excelDownload(datas, rowInfo, 'Клубийн оюутны жагсаалт')
	}

    function handleSearch() {
        getDatas()
    }

    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

	function handleAnketModal(row) {
		setDetailData(row)
        setAnketModal(!anket_modal)
    }

    return (
       <Fragment>
			<Card>
				{isLoading && Loader}
				<CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
					<CardTitle tag='h5'>{t('Клубд бүртгэлтэй оюутнууд')}</CardTitle>
					<Button
						color="primary"
						onClick={() => excelToDownload()}
					>
						Excel татах
					</Button>
				</CardHeader>
				<Row className='d-flex justify-content-start mx-0 mb-1 mt-1'>
					<Col md={3}>
						<Label className='form-label' for='type'>
							{t('Клуб')}
						</Label>
						<Select
							name="type"
							id="type"
							classNamePrefix='select'
							isClearable
							className={classnames('react-select')}
							isLoading={isLoading}
							placeholder={t('-- Сонгоно уу --')}
							options={club_option || []}
							value={club_option.find((c) => c.id === club_id)}
							noOptionsMessage={() => t('Хоосон байна')}
							onChange={(val) => setClubId(val?.id || '')}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
                    <Col md={3}>
						<Label className='form-label' for='type'>
							{t('Төлөвөөр')}
						</Label>
						<Select
							name="type"
							id="type"
							classNamePrefix='select'
							isClearable
							className={classnames('react-select')}
							isLoading={isLoading}
							placeholder={t('-- Сонгоно уу --')}
							options={type_option || []}
							value={type_option.find((c) => c.id === type_id)}
							noOptionsMessage={() => t('Хоосон байна')}
							onChange={(val) => setTypeId(val?.id || '')}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
				</Row>
				<Row className='mt-1 d-flex justify-content-between mx-0 mb-1'>
					<Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
						<Col lg={2} md={3} sm={4} xs={5} className='pe-1'>
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
					<Col className='d-flex align-items-end mobile-datatable-search'>
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
								<Spinner className='me-1' color="" size='sm' /><h5>Түр хүлээнэ үү...</h5>
							</div>
						}
						noDataComponent={(
							<div className="my-2">
								<h5>{t('Өгөгдөл байхгүй байна')}</h5>
							</div>
						)}
						onSort={handleSort}
						sortIcon={<ChevronDown size={10} />}
						columns={getColumns(currentPage, rowsPerPage === 'Бүгд' ? total_count : rowsPerPage, total_count, handleAnketModal)}
						paginationPerPage={rowsPerPage === 'Бүгд' ? total_count : rowsPerPage}
						paginationDefaultPage={currentPage}
						paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage === 'Бүгд' ? total_count : rowsPerPage, total_count)}
						data={datas}
						fixedHeader
						fixedHeaderScrollHeight='62vh'
					/>
				</div>
			</Card>
			{anket_modal && <DetailModal open={anket_modal} handleModal={handleAnketModal} refreshDatas={getDatas} detail_data={detail_data} />}
		</Fragment>
    )
};

export default AllStudentList;
