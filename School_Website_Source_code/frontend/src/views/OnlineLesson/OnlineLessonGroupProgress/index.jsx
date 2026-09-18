import React, { Fragment, useContext, useEffect, useState } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    Col,
    Input,
    Label,
    Row
} from 'reactstrap';

import Select from 'react-select';

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader";

import * as XLSX from 'sheetjs-style';

import {
	Edit3,
    Search
} from 'react-feather';
import { useTranslation } from "react-i18next";

import DataTable from "react-data-table-component";

import { getPagination, ReactSelectStyles, formatDate } from "@utils";
import { getColumns } from "./helpers";

import Add from "./Add";
import DetailModal from "./DetailModal";
import AuthContext from "@context/AuthContext";
import useUpdateEffect from "@hooks/useUpdateEffect";

function OnlineLessonGroupProgress({lesson}) {
	const { user } = useContext(AuthContext)
    const default_page = [10, 20, 50, 75, 100]
	const { t } = useTranslation();
	const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: true });
	const { isLoading: mainLoading, fetchData: getFetchData } = useLoader({ isFullScreen: true });

	const [datas, setDatas] = useState([])
	const [currentPage, setCurrentPage] = useState(1);
    const [selectedGroup,setSelectedGroup] = useState([]);
	const [rowsPerPage, setRowsPerPage] = useState(50);
	const [total_count, setTotalCount] = useState(1);
	const [searchValue, setSearchValue ] = useState('');
	const [groups, setGroups] = useState([])
	const [selectedGroups, setSelectedGroups] = useState([])
	const [isDetailModal, setDetailModal] = useState(false)
	const [rowData, setRowData] = useState({})


	const [modal, setModal] = useState(false);

	const handleModal = () => {
		setModal(!modal)
	}

	const studentAPi = useApi().get_lesson_students;
	const groupApi = useApi().get_group_lesson_progress;
	const groupAPI =  useApi().get_group;

	function convert(datas, title) {
		// Create a new workbook
		const workbook = XLSX.utils.book_new();
		const rows = []

		let currentRow = 5; // Start after the header

		const merges = [
			{ s: { r: 0, c: 0 }, e: { r: 1, c: 7 } },                                          // Сургалтын төлбөрийн мэдээлэл
			{ s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
		];

		datas?.forEach((data) => {
			const degree_datas = data?.lessons || [];

			degree_datas.forEach((degree, index) => {
				rows.push([
					index === 0 ? `${data?.last_name} ${data?.first_name} ${data?.code}` : '', // Rowspan-like effect: only display once for the first row
					degree?.lesson_code,
					degree?.lesson_name,
					degree?.kredit,
					degree?.total_count,
					degree?.view_count,
					degree?.percent,
				]);
				if (index === 0 && degree_datas.length > 1) {
					merges.push({
						s: { r: currentRow, c: 0 },
						e: { r: currentRow + degree_datas.length - 1, c: 0 },
					});
				}
				currentRow++;
			});
		});

		const customHeaderRows = [
			['2311 дүгээр дамжааны сурагчдын цахим хичээлийн үзэлт'],
			[`ДХИС`], // Or any other org name
			[`Хичээл үзэлт`],
			[formatDate(new Date())]
		];

		// Create the worksheet data
		const worksheetData = [
			...customHeaderRows,
			['Оюутан', 'Хичээлийн код', 'Хичээлийн нэр', 'Кредит', 'Нийт үзэх', 'ҮЗсэн', 'Хувь'],
			...rows,
		];

		// Create worksheet
		const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

		worksheet['!merges'] = merges;

		// Set column widths based on header length
		worksheet['!cols'] = [
			{ wpx: 100 },   // Сургууль
			{ wpx: 90 },    // Курс
			{ wpx: 60 },    // Оюутны тоо
			{ wpx: 90 },    // Авлага
			{ wpx: 90 },    // Төлөлт
			{ wpx: 90 },    // Авлага бууруулалт
			{ wpx: 90 },    // Төлбөр буцаалт
			{ wpx: 110 },   // Үлдэгдэл now_year
			{ wpx: 130 },   // Үлдэгдэлтэй оюутны тоо
			{ wpx: 110 },   // Илүү төлөлт now_year
			{ wpx: 130 },   // Илүү төлөлтэй оюутны тоо
		];

		// header-т өндөр өгөх
		worksheet['!rows'] = [
			{ hpx: 50 }, // Header row 1
			{ hpx: 40 }, // Header row 1
			{ hpx: 25 }, // Header row 1
			{ hpx: 25 }, // Header row 2
			// Хүснэгтийн дата мөрүүдийн өндөр
			...Array(rows.length + 1).fill({ hpx: 25 }),
			{ hpx: 25 }, // Header row 2
		];

		// Хүснэгтийн баганад стайл өгөх
		const range = XLSX.utils.decode_range(worksheet['!ref']);
		for (let R = range.s.r; R <= range.e.r; R++) {
			for (let C = range.s.c; C <= range.e.c; C++) {
				const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
				if (!worksheet[cellAddress]) continue;

				// Add black border to each side of the cell
				if (!worksheet[cellAddress].s) {
					worksheet[cellAddress].s = {}; // Ensure the cell style object exists
				}

				worksheet[cellAddress].s = {
					...worksheet[cellAddress].s,
					alignment: { horizontal: "right", vertical: "right", wrapText: true },
					font: { sz: 9 },
					border: {
						top:    { style: "thin", color: { rgb: "000000" } },
						bottom: { style: "thin", color: { rgb: "000000" } },
						left:   { style: "thin", color: { rgb: "000000" } },
						right:  { style: "thin", color: { rgb: "000000" } }
					}
				};
			}
		}

		// Apply bold and wrap text styles to header cells
		const fixHeaderStyle = {
			font: { bold: true, sz: 14 }, // Make the text bold
		};

		// Apply bold and wrap text styles to header cells
		const headerStyle = {
			font: { bold: true, sz: 9 }, // Make the text bold
			alignment: { horizontal: "center", vertical: "center", wrapText: true }, // Center align and wrap text
		};

		// Apply style to header row 1
		for (let col = 0; col < worksheetData[0].length; col++) {
			const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
			worksheet[cellAddress]['s'] = { ...worksheet[cellAddress].s, ...headerStyle, ...fixHeaderStyle };
		}

		const headersIndex = [3, 4]

		headersIndex.map((num) => {
			// Apply style to header row 1
			for (let col = 0; col < worksheetData[num].length; col++) {
				const cellAddress = XLSX.utils.encode_cell({ r: num, c: col });
				worksheet[cellAddress]['s'] = { ...worksheet[cellAddress].s, ...headerStyle };
			}
		})

		// Add the worksheet to the workbook
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

		// Write the workbook to a file
		XLSX.writeFile(workbook, `${title}.xlsx`);
	}

	// Ангийн хүүхдийн үзэж буй хичээлийн үзэлтийн хувь
	async function getDatas() {
		const { success, data } = await fetchData(groupApi.get(rowsPerPage, currentPage, searchValue, selectedGroup))
		if(success) {
			convert(data, "2311 анги")
			setDatas(data)
		}
	}

    async function getGroupList() {
		const {success, data} = await fetchData(groupAPI.get())
		if(success) {
			setGroups(data)
		}
	}

	useEffect(() => {
		getDatas();
	},[rowsPerPage, currentPage, selectedGroup, lesson]);

    useEffect(() => {
        getGroupList();
    }, []);

	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};


	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handlePerPage(e)
    {
		setRowsPerPage(parseInt(e.target.value))
	}


	useUpdateEffect(
		() =>
		{
			if (searchValue.length == 0 || searchValue.length > 2) getDatas()
		},
		[searchValue]
	)


	async function handleSearch() {
		if (searchValue.length > 0) getDatas()
    }

	// Анги сонгох хэсэг
	const handleSelectGroup = (group) => {
		setSelectedGroups(group)
	}

	// Анги сонгож хадгалах хэсэг
	async function onSubmit() {
		const { success} = await fetchData(studentAPi.put(selectedGroups, lesson.id));
		if (success) {
			handleModal();
			getDatas()
		}
	}

	// Суралцаж байгаа оюутнаас нэгийг нь хасах
	async function handleDelete(id) {
		const { success} = await fetchData(studentAPi.delete(id, lesson.id));
		if (success) {
			getDatas()
		}
	}

	const isCardCompleted = (testData, challengeId, lekts) => {
        const hasLectureMaterial = !!lekts;
        const challenge = testData.find(data => data.challenge_id === challengeId);
        // Check if the test score is higher than or equal to 60% and homework score is given
        const isTestPassed = challenge ? (challenge.score / challenge.take_score) >= 0.6 : false;

        return isTestPassed && hasLectureMaterial;
    };

	async function handleDetail(row) {
		setRowData(row)
		setDetailModal(!isDetailModal)
	}

    return (
		<Fragment>
			<Card>
				{mainLoading && Loader}
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t("")}</CardTitle>
				</CardHeader>
				<Row className='m-50'>
					<Col md={4} sm={12}>
						<Label className="form-label" htmlFor="time">
							{t('Анги сонгох')}
						</Label>
						<Select
							id="group"
							name="group"
							isClearable
							classNamePrefix='select'
							className='react-select'
							placeholder={`-- Сонгоно уу --`}
							options={groups|| []}
							noOptionsMessage={() => 'Хоосон байна'}
							onChange={(val) => {
								setSelectedGroup(val?.id || '')
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
                    </Col>
					<Col md={4}></Col>
					<Col md={4} sm={12}>
						<div className="d-flex flex-wrap mt-md-0 mt-1 justify-content-end">
							<Button
								color="primary"
								onClick={() => handleModal()}
							>
								<Edit3 size={15} />
								<span className="align-middle ms-50">
									{t("Засах")}
								</span>
							</Button>
						</div>
                    </Col>
				</Row>
				<Row className="m-50">
					<Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
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
									))
								}
							</Input>
						</Col>
						<Col md={10} sm={3}>
							<Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
						</Col>
					</Col>
					<Col className='d-flex align-items-end mobile-datatable-search '>
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

				<div className="react-dataTable react-dataTable-selectable-rows mx-1">
					<DataTable
						noHeader
						pagination
						className="react-dataTable"
						progressPending={isLoading}
						progressComponent={
							<div className="my-2">
								<h5>{t("Түр хүлээнэ үү...")}</h5>
							</div>
						}
						noDataComponent={
							<div className="my-2">
								<h5>{t("Өгөгдөл байхгүй байна")}</h5>
							</div>
						}
						columns={getColumns(
							currentPage,
							rowsPerPage,
							total_count,
							handleDelete,
							handleDetail,
							user,

						)}
						paginationPerPage={rowsPerPage}
						paginationDefaultPage={currentPage}
						data={datas}
						paginationComponent={getPagination(
							handlePagination,
							currentPage,
							rowsPerPage,
							total_count
						)}
						fixedHeader
						fixedHeaderScrollHeight="62vh"
					/>
				</div>
			</Card>
			{
				modal &&
				<Add
					open={modal}
					handleModal={handleModal}
					refreshDatas={getDatas}
					groups={groups}
					selected_groups={selectedGroups}
					handleSelectGroup={handleSelectGroup}
					onSubmit={onSubmit}
				/>
			}
			{
				isDetailModal &&
				<DetailModal
					lesson={lesson}
					rowData={rowData}
					open={isDetailModal}
					handleModal={() => setDetailModal(!isDetailModal)}
				/>
			}
        </Fragment>
    )
}

export default OnlineLessonGroupProgress