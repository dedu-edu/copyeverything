// ** React Imports
import { useContext, useEffect, useState } from 'react'

import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardTitle,
	Col,
	Input,
	Label,
	Row,
	Spinner,
} from 'reactstrap'

import DataTable from 'react-data-table-component'
import { ChevronDown, Plus, Search } from 'react-feather'
import { useTranslation } from 'react-i18next'

import AuthContext from '@context/AuthContext'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { getPagination } from '@utils'

import AddModal from './components/AddModal'
import { getColumns } from './helpers'

export default function FaqRegister() {
	// other simple variables
	const defaultPage = [10, 20, 50, 75, 100, 'Бүгд']

	// other hooks
	const { user } = useContext(AuthContext)
	const { t } = useTranslation()
	const faqApi = useApi().faq

	// for datatable component
	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(defaultPage[1])
	const [totalCount, setTotalCount] = useState(0)
	const limitForPagination = limit === 'Бүгд' ? totalCount : limit
	const [pageCount, setPageCount] = useState(1)
	const [sorting, setSorting] = useState('')

	// other states
	const [search, setSearch] = useState('')
	const [datas, setDatas] = useState([])

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false })
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({
		isFullScreen: false,
	})

	// Modal
	const [modal, setModal] = useState(false)
	const [editModal, setEditModal] = useState(false)
	const [editData, setEditData] = useState({})

	/* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
	}

	/* Устгах функц */
	const handleDelete = async (id) => {
		const { success } = await fetchData(faqApi.delete(id))
		if (success) getDatas()
	}

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await allFetch(
			faqApi.get({
				limit,
				page,
				sorting,
				search,
			})
		)

		if (success) {
			setTotalCount(data?.count)
			setDatas(data?.results)

			// Нийт хуудасны тоо
			setPageCount(Math.ceil(data?.count / limitForPagination))
		}
	}

	const handleEditModal = (row = {}) => {
		/** NOTE Засах гэж буй хичээлийн стандартын id-г авна */
		setEditModal(!editModal)
		setEditData(row)
	}

	// ** Function to handle filter
	const handleFilter = (e) => {
		const value = e.target.value.trimStart()
		setSearch(value)
	}

	function handleSort(column, sort) {
		if (sort === 'asc') setSorting(column.header)
		else setSorting('-' + column.header)
	}

	// Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setPage(page.selected + 1)
	}

	// ** Function to handle per page
	function handlePerPage(e) {
		setLimit(
			e.target.value == 'Бүгд' ? e.target.value : parseInt(e.target.value)
		)
	}

	// Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
	useEffect(() => {
		if (search.length == 0) getDatas()
		else {
			const timeoutId = setTimeout(() => {
				getDatas()
			}, 600)

			return () => clearTimeout(timeoutId)
		}
	}, [sorting, page, limit, search])

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Нийтлэг асуулт хариулт')}</CardTitle>
				<Button color='primary' onClick={() => handleModal()}>
					<Plus size={15} />
					<span className='align-middle ms-50'>{t('Нэмэх')}</span>
				</Button>
			</CardHeader>
			<CardBody>
				{isLoading && Loader}
				<Row className='mb-1'>
					<Col>
						<div className='d-flex align-items-center'>
							<Input
								type='select'
								bsSize='sm'
								style={{
									height: '30px',
									width: '80px',
								}}
								className='me-50'
								value={limit}
								onChange={(e) => handlePerPage(e)}
							>
								{defaultPage.map((page, idx) => (
									<option key={idx} value={page}>
										{page}
									</option>
								))}
							</Input>
							<Label>{t('Хуудсанд харуулах тоо')}</Label>
						</div>
					</Col>
					<Col>
						<div className='d-flex justify-content-end'>
							<Input
								type='text'
								bsSize='sm'
								id='search-input'
								placeholder={t('Хайх үг....')}
								value={search}
								onChange={handleFilter}
								onKeyDown={(e) =>
									e.key === 'Enter' && getDatas()
								}
								style={{ width: '180px' }}
								className='me-50'
							/>
							<Button
								size='sm'
								color='primary'
								onClick={getDatas}
							>
								<Search size={15} />
							</Button>
						</div>
					</Col>
				</Row>
				<div className='react-dataTable'>
					<DataTable
						noHeader
						paginationServer
						pagination
						progressPending={isTableLoading}
						progressComponent={
							<div className='d-flex align-items-center justify-content-center'>
								<Spinner className='me-1' size='sm' />
								<h5>{t('Түр хүлээнэ үү')}...</h5>
							</div>
						}
						noDataComponent={
							<div className='my-2'>
								<h5>{t('Өгөгдөл байхгүй байна')}</h5>
							</div>
						}
						onSort={handleSort}
						columns={getColumns(
							page,
							limitForPagination,
							pageCount,
							handleEditModal,
							handleDelete,
							user
						)}
						sortIcon={<ChevronDown size={10} />}
						paginationPerPage={limitForPagination}
						paginationDefaultPage={page}
						data={datas}
						paginationComponent={getPagination(
							handlePagination,
							page,
							limitForPagination,
							totalCount
						)}
						fixedHeader
						fixedHeaderScrollHeight='62vh'
					/>
				</div>
				{modal && (
					<AddModal
						open={modal}
						handleModal={handleModal}
						refreshDatas={getDatas}
						editData={{}}
					/>
				)}
				{editModal && (
					<AddModal
						open={editModal}
						handleModal={handleEditModal}
						refreshDatas={getDatas}
						editData={editData}
					/>
				)}
			</CardBody>
		</Card>
	)
}
