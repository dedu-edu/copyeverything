import { useContext, useEffect, useState } from 'react';

import AuthContext from '@context/AuthContext';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { ReactSelectStyles } from '@utils';
import { Search, Upload } from 'react-feather';
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import {
	Button,
	Col,
	Input,
	Label,
	Pagination,
	PaginationItem,
	PaginationLink,
	Row
} from 'reactstrap';
import SchoolContext from '@context/SchoolContext'
import { useNavigate } from 'react-router-dom';

function index() {
	const { control, formState: { errors } } = useForm({});
	const { user } = useContext(AuthContext)
	const navigate = useNavigate()

	const default_page = [10, 15, 50, 75, 100]
	const { t } = useTranslation()
	const [modal, setModal] = useState(false)
	const [datas, setDatas] = useState([])
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(100)
	const [searchValue, setSearchValue] = useState('')
	const [total_count, setTotalCount] = useState(1)
	const [sortField, setSort] = useState('')
	const [department_data, setDepartmentData] = useState([]);
	const [depId, setDepartmentId] = useState('');
	const totalPages = Math.ceil(total_count / rowsPerPage);

	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})
	const { school_id } = useContext(SchoolContext)
	const BApi = useApi(true).a_time.main;
	const departmentApi = useApi().hrms.department

	/* Тэнхим дата авах функц */
	async function getDepartmentOption() {
		const { success, data } = await fetchData(departmentApi.getSelectSchool())
		if (success) {
			setDepartmentData(data)
		}
	}

	async function getDatas() {

		const page_count = Math.ceil(total_count / rowsPerPage)

		if (page_count < currentPage && page_count != 0) {
			setCurrentPage(page_count)
		}
		const { success, data } = await allFetch(BApi.getList(depId, searchValue))
		if (success) {
			setTotalCount(data?.length)
			setDatas(data)
		}

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
			getDepartmentOption()
			} else {
		const timeoutId = setTimeout(() => {
			getDatas();
			getDepartmentOption()
		}, 600);

		return () => clearTimeout(timeoutId);
	}
	}, [depId, searchValue])

  return (
	<>
		<>
			<Row className='mx-0 mt-2 d-flex align-items-end'>
				<Col md={4} lg={3}>
					<Label className="form-label fw-bold" for="salbar">
						{t('Тэнхимээр хайх')}
					</Label>
					<Controller
						control={control}
						defaultValue=''
						name="salbar"
						render={({ field: { value, onChange} }) => (
							<Select
								name="salbar"
								id="salbar"
								classNamePrefix='select'
								isClearable
								className='react-select'
								isLoading={isLoading}
								placeholder={t('-- Сонгоно уу --')}
								options={department_data || []}
								value={department_data?.find((c) => c.id === value) || null}
								noOptionsMessage={() => t('Хоосон байна.')}
								onChange={(val) => {
									onChange(val?.id || '')
									setDepartmentId(val?.id || '')
								}}
								styles={ReactSelectStyles}
								getOptionValue={(option) => option.id}
								getOptionLabel={(option) => option.name}
							/>
						)}
					/>
				</Col>

				{/* <Col className='d-flex mb-0-5'>
					<Button
						color='primary'
						className='px-2'
						onClick={() => excelHandler()}
						// Хэрэв дата ачаалж байгаа бол товчийг идэвхгүй болгох нь тохиромжтой
						disabled={isLoading}
					>
						<Upload size={16} className='me-50' />
						<span className='align-middle'>{t('Excel татах')}</span>
					</Button>
				</Col> */}
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
						<Pagination>
							<PaginationItem disabled={currentPage === 1}>
								<PaginationLink
									previous
									onClick={() => setCurrentPage(prev => prev - 1)}
								/>
							</PaginationItem>

							{[...Array(totalPages)].map((_, i) => (
								<PaginationItem
									key={i}
									active={currentPage === i + 1}
								>
									<PaginationLink onClick={() => setCurrentPage(i + 1)}>
										{i + 1}
									</PaginationLink>
								</PaginationItem>
							))}

							<PaginationItem disabled={currentPage === totalPages}>
								<PaginationLink
									next
									onClick={() => setCurrentPage(prev => prev + 1)}
								/>
							</PaginationItem>
						</Pagination>
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
		</>
		{isTableLoading && Loader}
		<div style={{ overflowX: "auto" }}>
			<table
				border="1"
				cellPadding="4"
				cellSpacing="0"
				style={{ borderCollapse: "collapse", width: "100%", fontSize: "12px"}}
				className="table table-sm table-bordered text-center tb"
			>
				<thead>
				<tr>
					<th rowSpan="5">№</th>
					<th rowSpan="5">Багш нарын нэр</th>
					{/* <th colSpan="22">Танхимын сургалт</th> */}
					<th colSpan="22">Танхимын сургалт</th>
					{/* <th colSpan="32">Танхимын сургалт</th> */}
					{/* <th colSpan="27">Танхимын бус сургалт</th> */}
					{/* <th colSpan="24">Биеийн тамир, албаны бэлтгэлийн институт</th> */}
					<th rowSpan="5" colSpan="5">Дүн</th>
					{/* <th rowSpan="5" colSpan="5">Дүн</th> */}
				</tr>
				<tr>
					<th colSpan="8" >Ахисан түвшин</th>
					<th colSpan="6">Бакалаврын түвшин Лекц</th>
					<th colSpan="2" rowSpan="3">Бакалаврын хөтөлбөрийн бямба гарагийн танхимын лекцийн цагийг суралцагчийн тоог үл харгалзан (Журмын 1.2.1)</th>
					<th colSpan="2" rowSpan="3">Тойм лекц (Журмын 1.1.4)</th>
					{/* <th colSpan="2" rowSpan="3"> Бакалавр семинар (Журмын 1.1.2, 1.2.2)</th> */}
					<th colSpan="3" rowSpan="3"> Бакалавр семинар (Журмын 1.1.2, 1.2.2)</th>
					{/* <th colSpan="2"  rowSpan="3">1.2.5. Хээрийн сургалт дадлагын удирдагчаар (тушаалаар) ажилласан</th>
					<th colSpan="4">Команд штабын сургууль</th>
					<th colSpan="4">Сургалтын тоглолт</th>
					<th colSpan="4">Хээрийн сургалт дадлага </th>
					<th colSpan="6" rowSpan="2">1.2.6. Тусгайлан боловсруулсан цахим, зайн сургалтын хөтөлбөрийн дагуу онлайн сургалт зохион байгуулсан </th>
					<th colSpan="4" rowSpan="2">1.2.7. Тусгай хэрэгцээт суралцагчид зориулсан хичээлийн хөтөлбөр боловсруулсан</th>
					<th colSpan="6" rowSpan="2">1.2.8. Сургалтын хөтөлбөрийн дагуу англи хэлээр хичээл зохион байгуулсан </th>
					<th colSpan="4" rowSpan="3">1.2.9. Нөхөн хичээлийг цахимаар зохион байгуулсан </th>
					<th colSpan="3" rowSpan="2">1.3.1. Бие даалт болон төсөлт ажил</th>
					<th colSpan="4" rowSpan="1">1.3.2. Ангийн ажил</th>
					<th colSpan="4" rowSpan="1">1.3.3. Дадлагын тайлан хамгаалах</th>
					<th colSpan="4" rowSpan="2">Нэгдсэн шалгалтын комисст ажиллах (Магистр, доктор, бакалаврын түвшний сургалтад тооцно)</th>
					<th colSpan="4" rowSpan="2">Төгсөлтийн шалгалтын комисст ажиллах(Магистр, бакалавр түвшний сургалтад тооцно)</th>
					<th colSpan="2" rowSpan="3">1.3.8. Сургалтын хөтөлбөрт багтсан хээрийн гаралтаар буудлага үйлдэх(Тушаалаар)</th>
					<th colSpan="2" rowSpan="3">1.3.9. Иж бүрэн цахим хичээл боловсруулсан</th>
					<th colSpan="2" rowSpan="3">1.3.10. Сургалтын хөтөлбөрт тусгасан мэргэжлийн дадлага биечлэн шалгаж зөвлөгөө өгсөн</th>
					<th colSpan="2" rowSpan="2">Их сургуулийн захирлын тушаалаар дадлага удирдсан</th>
					<th colSpan="8" rowSpan="2">Олимп, дэлхий, тивийн аварга шалгаруулах тэмцээн</th>
					<th colSpan="8" rowSpan="2">Олон улсын бусад тэмцээн</th>
					<th colSpan="8" rowSpan="2">Улсын аварга шалгаруулах тэмцээн</th> */}
				</tr>

				<tr>
					<th colSpan="4">Доктор</th>
					<th colSpan="4">Магистр</th>
					<th colSpan="6">Суралцагчдын тоо (Журмын 1.1.1, 1.2.1)</th>
					{/* <th colSpan="12">Журмын 1.1.3, 1.2.4</th>
					<th colSpan="8">Комиссын бүрэлдэхүүнд багц цагийг хуваана</th> */}
				</tr>

				<tr>
					<th colSpan="8">Журмын 1.1.1, 1.1.2, 1.2.3</th>
					<th colSpan="2">1-60 хүртэл</th>
					<th colSpan="2">61-90 хүртэл</th>
					<th colSpan="2">91-дээш</th>

					{/* <th colSpan="2">Өдөр</th>
					<th colSpan="2">Шөнө</th>
					<th colSpan="2">Өдөр</th>
					<th colSpan="2">Шөнө</th>
					<th colSpan="2">Өдөр</th>
					<th colSpan="2">Шөнө</th>

					<th colSpan="2">Бакалавр</th>
					<th colSpan="2">Магистр</th>
					<th colSpan="2">Доктор</th> */}

					{/* <th colSpan="2">Хөгжлийн бэрхшээлтэй</th>
					<th colSpan="2">Гоц авьяастай</th>

					<th colSpan="2">Бакалавр</th>
					<th colSpan="2">Магистр</th>
					<th colSpan="2">Доктор</th>

					<th colSpan="11">Журмын 1.3</th>
					<th colSpan="2">1.3.4. Нарийн бичгийн дарга</th>
					<th colSpan="2">1.3.5. Гишүүн</th>
					<th colSpan="2">1.3.6. Нарийн бичгийн дарга</th>
					<th colSpan="2">1.3.7. Гишүүн</th>
					<th colSpan="2">Журмын 1.4</th>
					<th colSpan="24">Журмын 1.5 /25%-иас хэтрэхгүй/</th> */}
				</tr>
				<tr>
					<th>Лекц цаг</th>
					<th>1.3</th>
					<th>Сем цаг</th>
					<th>1.3</th>

					<th>Лекц цаг</th>
					<th>1.2</th>
					<th>Сем цаг</th>
					<th>1.3</th>

					<th>Лекц цаг</th>
					<th>1.2</th>

					<th>Лекц цаг</th>
					<th>1.2</th>

					<th>Лекц цаг</th>
					<th>1.4</th>

					<th>Цаг</th>
					<th>1.2</th>

					<th >Цаг</th>
					<th >Коэф</th>

					<th >Сем цаг </th>
					<th colSpan={2} rowSpan={2}>Коэф</th>
					{/* <th >Сем цаг </th>
					<th >32</th> */}

					{/* <th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >1 өдөр</th>
					<th >Коэф</th>
					<th >Коэф</th> */}
				</tr>
				</thead>
				<tbody>
  				{datas?.length > 0 ? (
					datas.map((teacher, index) => {
						// лекц, сем
						let lekts_magister = { total_tsag: 0, guitsetgel: 0, e_guitsetgel:0 };
						let lekts_doctor = { total_tsag: 0, guitsetgel: 0, f_guitsetgel:0 };
						let lekts_bak = { total_tsag: 0, guitsetgel: 0 , d_lekts_total:0, st1_guitsetgel:0, st2_guitsetgel:0, st3_guitsetgel:0, satur_total:0, satur_total_tsag:0, d_l_guitsetgel:0};

						let sem_magister = { total_tsag: 0, guitsetgel: 0, e_guitsetgel:0 };
						let sem_doctor = { total_tsag: 0, guitsetgel: 0, f_guitsetgel:0 };
						let sem_bak = { total_tsag: 0, guitsetgel: 0,d_s_guitsetgel:0};

						const seminarType = teacher?.lesson_types?.find(item => item.lesson_type_id === 3);
						const lektsType = teacher?.lesson_types?.find(item => item.lesson_type_id === 2);

						if (seminarType && seminarType.degree) {
							const deg = seminarType.degree;

							// 'F' - Доктор
							if (deg['F']) {
								sem_doctor = {
									total_tsag: deg['F'].total_tsag || 0,
									guitsetgel: deg['F'].guitsetgel || 0,
									f_guitsetgel: deg['F'].f_guitsetgel || 0
								};
							}
							// 'E' - Магистр
							if (deg['E']) {
								sem_magister = {
									total_tsag: deg['E'].total_tsag || 0,
									guitsetgel: deg['E'].guitsetgel || 0,
									e_guitsetgel: deg['E'].e_guitsetgel || 0
								};
							}
							// 'D' - Бакалавр
							if (deg['D']) {
								sem_bak = {
									total_tsag: deg['D'].total_tsag || 0,
									guitsetgel: deg['D'].guitsetgel || 0,
									d_sem_total: deg['D'].d_sem_total || 0,
									d_s_guitsetgel: deg['D'].d_s_guitsetgel || 0,

									d_lekts_total: deg['D'].d_lekts_total || 0,
									satur_total: deg['D'].satur_total || 0,
									st_1guitsetgel:deg['D'].st_1guitsetgel || 0,
									st_2guitsetgel:deg['D'].st_2guitsetgel || 0,
									st_3guitsetgel:deg['D'].st_3guitsetgel || 0
								};
							}
						}

						if (lektsType && lektsType.degree) {
							const deg = lektsType.degree;

							// 'F' - Доктор
							if (deg['F']) {
								lekts_doctor = {
									total_tsag: deg['F'].total_tsag || 0,
									guitsetgel: deg['F'].guitsetgel || 0,
									f_guitsetgel: deg['F'].f_guitsetgel || 0
								};
							}
							// 'E' - Магистр
							if (deg['E']) {
								lekts_magister = {
									total_tsag: deg['E'].total_tsag || 0,
									guitsetgel: deg['E'].guitsetgel || 0,
									e_guitsetgel: deg['E'].e_guitsetgel || 0
								};
							}
							// 'D' - Бакалавр
							if (deg['D']) {
								lekts_bak = {
									total_tsag: deg['D'].total_tsag || 0,
									d_sem_total: deg['D'].d_sem_total || 0,
									d_lekts_total: deg['D'].d_lekts_total || 0,
									guitsetgel: deg['D'].guitsetgel || 0,
									d_l_guitsetgel:deg['D'].d_l_guitsetgel || 0,
									st1_guitsetgel: deg['D'].st1_guitsetgel || 0,
									st2_guitsetgel: deg['D'].st2_guitsetgel || 0,
									st3_guitsetgel: deg['D'].st3_guitsetgel || 0,
									d_s_guitsetgel: deg['D'].d_s_guitsetgel || 0,
								};
							}
						}

						return (
							<tr key={teacher?.teacher_id || index}>
							<td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
							<td
								className='cursor-pointer text-start'
								onClick={() => navigate(`/credit/profile/${teacher?.teacher_id}/`)}
							>
								{teacher?.full_name}
							</td>

							{/* Доктор (F) */}
							<td>{lekts_doctor.total_tsag || 0}</td>
							<td>{lekts_doctor.f_guitsetgel || 0}</td>
							<td>{sem_doctor.total_tsag || 0}</td>
							<td>{sem_doctor.f_guitsetgel || 0}</td>

							{/* Магистр (E) */}
							<td>{lekts_magister.total_tsag || 0}</td>
							<td>{lekts_magister.e_guitsetgel || 0}</td>
							<td>{sem_magister.total_tsag || 0}</td>
							<td>{sem_magister.e_guitsetgel || 0}</td>

							<td>{lekts_bak?.st1_guitsetgel <=60 ? lekts_bak?.st1_guitsetgel : 0}</td>
							<td>{lekts_bak?.st1_guitsetgel <=60 ? lekts_bak.d_l_guitsetgel : 0 }</td>
							<td>{lekts_bak.st2_guitsetgel >= 61 && lekts_bak.st2_guitsetgel <= 90 ? lekts_bak.st2_guitsetgel : 0 }</td>
							<td>{lekts_bak.st2_guitsetgel >= 61 && lekts_bak.st2_guitsetgel <= 90 ? lekts_bak.d_l_guitsetgel : 0}</td>
							<td>{(lekts_bak?.st3_guitsetgel > 90)? lekts_bak?.st3_guitsetgel : 0 }</td>
							<td>{(lekts_bak?.st3_guitsetgel > 90) ? lekts_bak.d_l_guitsetgel: 0 }</td>

							<td>{lekts_bak.satur_total_tsag || 0}</td>
							<td>{lekts_bak.satur_total || 0}</td>
							{/* Тойм лекц */}
							<td>0</td>
							<td>0</td>
							{/* Бакалавр (D) */}
							<td>{sem_bak.d_s_guitsetgel || 0}</td>
							<td colSpan={3}>{sem_bak.guitsetgel || 0}</td>
							<td colSpan={1}>{teacher?.all_total_time || 0}</td>
							{/* /Зай бөглөх нүднүүд */}
							{/* {Array.from({ length: 80 }).map((_, i) => (
								<td key={`empty-${i}`}>-</td>
							))} */}

							</tr>
						);
						})
					) : (
						<tr>
						<td colSpan="90">Мэдээлэл олдсонгүй</td>
						</tr>
					)}
					</tbody>
					{/* <tfoot>
					<tr>
						<th colSpan="2"></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th rowSpan='4' colSpan='4'></th>
						<th rowSpan='4' colSpan='4'></th>
					</tr>
					</tfoot> */}

			</table>
		</div>
	</>
  );
}

export default index;
