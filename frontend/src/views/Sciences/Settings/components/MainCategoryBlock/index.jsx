import {
	Badge,
	Button,
	Col,
	Input,
	Label,
	Row,
	UncontrolledTooltip
} from 'reactstrap';

import moment from 'moment';
import { Edit, Plus, Trash2 } from 'react-feather';

import { getPagination } from '@src/utility/Utils';

import '../SubCategoryBlock/style.scss';
import { ReactSortable } from 'react-sortablejs';


export default function MainCategoryBlock({
	handleMainCategoryModal,
	mainCategoryCurrentPage,
	mainCategoryRowsPerPage,
	mainCategoryOptions,
	showWarning,
	handleMainCategoryDelete,
	t,
	handleMainCategoryPerPage,
	default_page,
	handleMainCategoryPagination,
	mainCategoryTotalCount,
	is_lock = false,
	setMainCategoryOptions,
	changeOrder
}) {
	const columns = [
		{
			name: "№",
			selector: (row, index) => (mainCategoryCurrentPage - 1) * mainCategoryRowsPerPage + index + 1,
			headerStyle: { textAlign: 'center', width: '50px' },
			bodyStyle: { textAlign: 'center', width: '50px' }
		},
		{
			name: `${t('Үндсэн төрөл нэр')}`,
			selector: (row) => mainCategoryOptions.find(item => item.id === row?.id)?.name,
		},
		{
			name: `${t('Огноо')}`,
			selector: (row) => moment(row?.created_at).format('YYYY-MM-DD HH:mm:ss'),
			headerStyle: { textAlign: 'center', width: '180px' },
			bodyStyle: { textAlign: 'center', width: '180px' }
		},
		{
			name: `${t('Хэрэглэгч')}`,
			selector: (row) => row?.created_by,
			headerStyle: { textAlign: 'center', width: '150px' },
			bodyStyle: { textAlign: 'center', width: '150px' }
		},
		{
			name: <Edit width={"15px"} />,
			selector: (row) => (
				<>
					<a
						role='button'
						onClick={() => handleMainCategoryModal(row)}
						id={`complaintListDatatableEditCategory${row?.id}`}
					>
						<Badge color="light-secondary" pill><Edit width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEditCategory${row.id}`} >{t('Засах')}</UncontrolledTooltip>
				</>
			),
			headerStyle: { textAlign: 'center', width: '70px' },
			bodyStyle: { textAlign: 'center', width: '70px' }
		},
		{
			name: <Trash2 width={"15px"} />,
			selector: (row) => (
				<>
					<a
						role='button'
						onClick={() => showWarning({
							header: {
								title: t(`Устгах`),
							},
							question: t(`Та энэхүү устгахдаа итгэлтэй байна уу (хамааралтай бүх дэд ангиллууд мөн устгагдана)?`),
							onClick: () => handleMainCategoryDelete(row?.id),
							btnText: t('Устгах'),
						})}
						id={`complaintListDatatableDeleteCategory${row?.id}`}
					>
						<Badge color="light-danger" pill><Trash2 width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableDeleteCategory${row.id}`} >{t('Устгах')}</UncontrolledTooltip>
				</>
			),
			center: true,
			minWidth: "50px",
			maxWidth: "50px",
			conditionalCellStyles: [
				{
					when: (row) => true,
					style: {
						padding: '0px',
					},
				},
			],
		},
	]

	return (
		<div style={{ overflow: 'auto' }}>
			<Row className='mb-1'>
				<Col className='d-flex justify-content-end'>
					<Button
						color='primary'
						onClick={() => handleMainCategoryModal()}
						style={{
							height: '40px',
						}}
					>
						<Plus size={15} />
						<span className='align-middle ms-50'>{t('Нэмэх')}</span>
					</Button>
				</Col>
			</Row>
			<table className='customTable'>
				<thead>
					<tr>
						{columns.map((col, index) => (
							<th key={index} style={col.headerStyle}>
								{col.name}
							</th>
						))}
					</tr>
				</thead>
				{/* <ReactSortable
					list={mainCategoryOptions}
					setList={setMainCategoryOptions}
					onEnd={changeOrder}
					animation={150}
					tag="tbody"
					className="table-striped"
					disabled={true}
				> */}
					{mainCategoryOptions.map((row, index) =>
						<tr key={row.id}>
							{columns.map((col, colIndex) => (
								<td
									key={colIndex}
									style={col.bodyStyle}
								>
									{col.selector(row, index, is_lock)}
								</td>
							))}
						</tr>
					)}
				{/* </ReactSortable> */}
			</table>
			<Row className='mt-1'>
				<Col sm='auto'>
					<Input
						type='select'
						bsSize='sm'
						style={{ height: "30px", width: "70px" }}
						value={mainCategoryRowsPerPage}
						onChange={e => handleMainCategoryPerPage(e)}
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
				<Col>
					<Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
				</Col>
				<Col md={6}>
					{getPagination(handleMainCategoryPagination, mainCategoryCurrentPage, mainCategoryRowsPerPage, mainCategoryTotalCount)()}
				</Col>
			</Row>
		</div>
	)
}
