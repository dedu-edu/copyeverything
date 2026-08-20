import moment from 'moment'
import { X, Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap'
import { t } from 'i18next'

import useModal from '@hooks/useModal'

// Хүснэгтийн баганууд
export function getColumns(
	currentPage,
	rowsPerPage,
	pageCount,
	handleEditModal,
	handleDelete,
	user
) {
	const { showWarning } = useModal()

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
	if (currentPage > pageCount) currentPage = 1

	const defaultFields = {
		center: true,
		sortable: true,
		wrap: true,
	}

	const columns = [
		{
			...defaultFields,
			name: <div className='text-center'>№</div>,
			cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			maxWidth: '50px',
			minWidth: '50px',
			sortable: false,
		},
		{
			...defaultFields,
			name: <div className='text-center'>{t('Бүлэг асуултын нэр')}</div>,
			cell: (row) => row?.name,
			header: 'name',
			minWidth: '200px',
		},
		{
			...defaultFields,
			name: <div className='text-center'>{t('Хэнд харагдах төрөл')}</div>,
			cell: (row) => row?.type_name,
			header: 'type_name',
		},
		{
			...defaultFields,
			name: <div className='text-center'>{t('Үүссэн')}</div>,
			cell: (row) =>
				row?.created_at
					? moment(row?.created_at).format('YYYY-MM-DD HH:mm:ss')
					: '',
			header: 'created_at',
			minWidth: '80px',
		},
	]

	if (Object.keys(user).length > 0) {
		columns.push({
			...defaultFields,
			name: <div className='text-center'>{t('Үйлдэл')}</div>,
			cell: (row) => (
				<div className='text-center' style={{ width: 'auto' }}>
					<a
						role='button'
						onClick={() => {
							handleEditModal(row)
						}}
						id={`editFaqGroup${row?.id}`}
						className='me-1'
					>
						<Badge color='light-secondary' pill>
							<Edit width={'15px'} />
						</Badge>
					</a>
					<UncontrolledTooltip
						placement='top'
						target={`editFaqGroup${row.id}`}
					>
						{t('Засах')}
					</UncontrolledTooltip>
					{
						<>
							<a
								role='button'
								onClick={() =>
									showWarning({
										header: {
											title: t(`Бүлэг устгах`),
										},
										question: <>
											{t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`)} {t('Холбогдсон асуултууд болон хариултууд автоматаар устгагдана.')}
										</>,
										onClick: () => handleDelete(row.id),
										btnText: t('Устгах'),
									})
								}
								id={`deleteFaqGroup${row?.id}`}
							>
								<Badge color='light-danger' pill>
									<X width={'100px'} />
								</Badge>
							</a>
							<UncontrolledTooltip
								placement='top'
								target={`deleteFaqGroup${row.id}`}
							>
								{t('Устгах')}
							</UncontrolledTooltip>
						</>
					}
				</div>
			),
			maxWidth: '180px',
			minWidth: '180px',
			sortable: false,
		})
	}

	return columns
}
