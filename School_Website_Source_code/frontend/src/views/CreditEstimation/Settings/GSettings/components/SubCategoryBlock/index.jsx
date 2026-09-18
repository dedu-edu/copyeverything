import {
	Badge,
	Col,
	Input,
	Label,
	Row,
	UncontrolledTooltip
} from 'reactstrap'

import moment from 'moment'
import { Edit, Trash2 } from 'react-feather'
import { getPagination } from '@src/utility/Utils'

import './style.scss'
// import { ReactSortable } from 'react-sortablejs'

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
	is_lock = false
}) {
	return (
		<div style={{ overflow: 'auto' }}>
			<table className="customTable">
				<thead>
					<tr>
						<th style={{ width: '50px', textAlign: 'center' }}>№</th>
						<th style={{ textAlign: 'center' }}>{t('Шалгуурын тайлбар')}</th>
						<th style={{ textAlign: 'center' }}>{t('Хэмжих нэгж')}</th>
						<th style={{ textAlign: 'center', width: '100px' }}>{t('Багц цаг')}</th>
						<th style={{ width: '50px' }}>засах</th>
						<th style={{ width: '50px' }}>устгах</th>
					</tr>
				</thead>

				<tbody>
					{subCategoryOptions.map((row, index) => {
						const isFirstInGroup = row.category.id !== prevGroup
						prevGroup = row.category.id

						return (
							<tr key={row.id}>
								{/* Row number */}
								<td align="center">
									{(subCategoryCurrentPage - 1) *
										subCategoryRowsPerPage +
										index +
										1}
								</td>

								{/* Description */}
								<td>{row.name}</td>

								{/* Unit */}
								<td align="center">{row.value}</td>

								{/* Score */}
								<td align="center">{row.score}</td>

								{/* Edit */}
								<td align="center">
									<a
										role="button"
										onClick={() => handleSubCategoryModal(row)}
										id={`editSubCategory${row.id}`}
									>
										<Badge color="light-secondary" pill>
											<Edit size={15} />
										</Badge>
									</a>
									<UncontrolledTooltip
										placement="top"
										target={`editSubCategory${row.id}`}
									>
										{t('Засах')}
									</UncontrolledTooltip>
								</td>

								{/* Delete */}
								<td align="center">
									<a
										role="button"
										onClick={() =>
											showWarning({
												header: { title: t('Устгах') },
												question: t('Та энэхүү устгахдаа итгэлтэй байна уу?'),
												onClick: () => handleSubCategoryDelete(row.id),
												btnText: t('Устгах')
											})
										}
										id={`deleteSubCategory${row.id}`}
									>
										<Badge color="light-danger" pill>
											<Trash2 size={15} />
										</Badge>
									</a>
									<UncontrolledTooltip
										placement="top"
										target={`deleteSubCategory${row.id}`}
									>
										{t('Устгах')}
									</UncontrolledTooltip>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>

			<Row className="mt-1 align-items-center">
				<Col sm="auto">
					<Input
						type="select"
						bsSize="sm"
						style={{ height: '30px', width: '70px' }}
						value={subCategoryRowsPerPage}
						onChange={handleSubCategoryPerPage}
					>
						{default_page.map((page, idx) => (
							<option key={idx} value={page}>
								{page}
							</option>
						))}
					</Input>
				</Col>

				<Col sm="auto">
					<Label className="mb-0">{t('Хуудсанд харуулах тоо')}</Label>
				</Col>

				<Col md={6}>
					{getPagination(
						handleSubCategoryPagination,
						subCategoryCurrentPage,
						subCategoryRowsPerPage,
						subCategoryTotalCount
					)()}
				</Col>
			</Row>
		</div>
	)
}
