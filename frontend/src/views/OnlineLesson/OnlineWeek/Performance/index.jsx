import React, { Fragment, useContext, useEffect, useState } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    Col,
    Input,
    Label,
    Row,
	UncontrolledTooltip
} from 'reactstrap';

import Select from 'react-select';

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader";

import {
	Edit3,
    Search
} from 'react-feather';
import { useTranslation } from "react-i18next";

import DataTable from "react-data-table-component";

import { getPagination, ReactSelectStyles } from "@utils";
import { getColumns } from "./helpers";

import Add from "./Add";
import DetailModal from "./DetailModal";
import AuthContext from "@context/AuthContext";
import useUpdateEffect from "@hooks/useUpdateEffect";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { downloadExcel } from "@src/utility/Utils";

function Performance({lesson}) {
	const { user } = useContext(AuthContext)
    const default_page = [10, 20, 50, 75, 100, 500]
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
	const groupAPI =  useApi().get_group;

	async function getDatas() {
		const { success, data } = await getFetchData(studentAPi.get(rowsPerPage, currentPage, searchValue, selectedGroup, lesson.id));
		if (success) {
			setDatas(data?.datas)
			setTotalCount(data?.datas?.length)
			setSelectedGroups(data?.groups)
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

	function convert() {
		const excelColumns = {
			"code": "Оюутны код",
			"last_name": "Овог",
			"first_name": "Нэр",
			"register_num": "Регистр",
			"count_homework": "Нийт даалгавар",
			"study_homework_count": "Гүйцэтгэсэн даалгавар",
			"count_challenge": "Нийт шалгалт",
			"study_challenge_count": "Өгсөн шалгалт",
			"total_count": "Нийт материал",
			"view_count": "Үзсэн материал",
			"percent": "Хувь",
		}
		let cDatas = datas?.map((data) => {
                data["count_homework"] = data?.online_lesson_review?.count_homework
                data["study_homework_count"] = data?.online_lesson_review?.study_homework_count
                data["count_challenge"] = data?.online_lesson_review?.count_challenge
                data["study_challenge_count"] = data?.online_lesson_review?.study_challenge_count
                data["total_count"] = data?.online_week_datas?.total_count
                data["view_count"] = data?.online_week_datas?.view_count
                data["percent"] = data?.online_week_datas?.percent

                return data
            })
		downloadExcel(cDatas, excelColumns, `Судалж_буй_оюутан`)
	}


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
						<div className='px-0'>
							<Button color='primary' className='d-flex align-items-center px-75' id='excel_button' onClick={() => convert()}>
								<HiOutlineDocumentReport className='me-25'/>
								Excel татах
							</Button>
							<UncontrolledTooltip target='excel_button'>
								Доорхи хүснэгтэнд харагдаж байгаа мэдээллийн жагсаалтаар эксел файл үүсгэнэ
							</UncontrolledTooltip>
						</div>
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

export default Performance