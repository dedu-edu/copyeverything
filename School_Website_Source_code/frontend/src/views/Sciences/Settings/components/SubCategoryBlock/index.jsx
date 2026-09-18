import {
	Badge,
	Col,
	Input,
	Label,
	Row,
	UncontrolledTooltip
} from 'reactstrap';

import moment from 'moment';
import { Edit, Trash2 } from 'react-feather';

import { getPagination } from '@src/utility/Utils';

import './style.scss'
import { ReactSortable } from 'react-sortablejs';


export default function SubCategoryBlock({
	t,
	subCategoryOptions,
	prevGroup,
	subCategoryCounts,
	subCategoryCurrentPage,
	subCategoryRowsPerPage,
	handleSubCategoryModal,
	showWarning,
	handleSubCategoryDelete,
	handleSubCategoryPerPage,
	default_page,
	handleSubCategoryPagination,
	subCategoryTotalCount,
	is_lock = false,
	setSubCategoryOptions,
	changeOrder
}) {
	// to define columns that not contains rows with "rowSpan"
	const columns = [
		{
			name: "",
			selector: (row, index) => (subCategoryCurrentPage - 1) * subCategoryRowsPerPage + index + 1,
			headerStyle: { textAlign: 'center', width: '50px' },
		},
		{
			name: t('Дэд үзүүлэлт'),
			selector: (row, index) => row.name,
			headerStyle: { textAlign: 'center' },
		},
		{
			name: t('Оноо'),
			selector: (row, index) => row.score,
			headerStyle: { textAlign: 'center', width: '100px' },
		},
		{
			name: t('Огноо'),
			selector: (row, index) => moment(row?.created_at).format('YYYY-MM-DD HH:mm:ss'),
			headerStyle: { textAlign: 'center', width: '150px' },
		},
		{
			name: t('Хэрэглэгч'),
			selector: (row, index) => row.created_by,
			headerStyle: { textAlign: 'center', width: '150px' },
		},
		{
			name: <Edit width={"15px"} />,
			selector: (row, index) =>
				<>
					<a
						role='button'
						onClick={() => handleSubCategoryModal(row)}
						id={`complaintListDatatableEditSubCategory${row?.id}`}
					>
						<Badge color="light-secondary" pill><Edit width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEditSubCategory${row.id}`} >{t('Засах')}</UncontrolledTooltip>
				</>,
			headerStyle: { textAlign: 'center', width: '50px' },
		},
		{
			name: <Trash2 width={"15px"} />,
			selector: (row, index) =>
				<>
					<a
						role='button'
						onClick={() => showWarning({
							header: {
								title: t(`Устгах`),
							},
							question: t(`Та энэхүү устгахдаа итгэлтэй байна уу?`),
							onClick: () => handleSubCategoryDelete(row?.id),
							btnText: t('Устгах'),
						})}
						id={`complaintListDatatableDeleteSubCategory${row?.id}`}
					>
						<Badge color="light-danger" pill><Trash2 width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableDeleteSubCategory${row.id}`} >{t('Устгах')}</UncontrolledTooltip>
				</>,
			headerStyle: { textAlign: 'center', width: '50px' },
		},
	]

	return (
		<div style={{ overflow: 'auto' }}>
			<table className='customTable'>
				<thead>
					<tr>
						<th style={{ textAlign: 'center', width: '50px' }}>{t('№')}</th>
						<th style={{ textAlign: 'center' }}>{t('Үзүүлэлт')}</th>
						{columns.map((col, index) => (
							<th key={index} style={col.headerStyle}>
								{col.name}
							</th>
						))}
					</tr>
				</thead>
				{/* <ReactSortable
					list={subCategoryOptions}
					setList={setSubCategoryOptions}
					onEnd={changeOrder}
					animation={150}
					tag="tbody"
					className="table-striped"
					disabled={is_lock}
				> */}
					{subCategoryOptions.map((row, index) => {
						const isFirstInGroup = row.category.id !== prevGroup;
						prevGroup = row.category.id;

						return (
							<tr key={row.id}>
								{isFirstInGroup ? (
									<>
										<td
											rowSpan={subCategoryCounts[row.category.id]}
											valign='middle'
											align='center'
										>
											{row.groupIndex + 1}
										</td>
										<td
											rowSpan={subCategoryCounts[row.category.id]}
											valign='middle'
											align='center'
										>
											{row.category.name}
										</td>
									</>
								) : (
									<></>
								)}
								{columns.map((col, colIndex) => (
									<td
										key={colIndex}
										style={col.bodyStyle}
									>
										{col.selector(row, index, is_lock)}
									</td>
								))}
							</tr>
						);
					})}
				{/* </ReactSortable> */}
			</table>
			<Row className='mt-1'>
				<Col sm='auto'>
					<Input
						type='select'
						bsSize='sm'
						style={{ height: "30px", width: "70px" }}
						value={subCategoryRowsPerPage}
						onChange={e => handleSubCategoryPerPage(e)}
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
					{getPagination(handleSubCategoryPagination, subCategoryCurrentPage, subCategoryRowsPerPage, subCategoryTotalCount)()}
				</Col>
			</Row>
		</div>
	)
}
