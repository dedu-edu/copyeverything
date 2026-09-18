import { t } from 'i18next'

import useModal from '@hooks/useModal'

import { X, Edit, Book } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap'
import { formatDate } from '@src/utility/Utils'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, user, handleEditModal, handleDelete) {

	const page_count = Math.ceil(total_count / rowsPerPage)
	const { showWarning } = useModal()

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true,
		},
		{
			header: 'title',
			name: `${t('Гарчиг')}`,
			selector: (row) => <span title={row?.title}>{row?.title}</span>,
            sortable: true,
			minWidth: "350px",
			left: true,
			wrap: true,
        },
		{
			header: 'is_open',
			name: `${t('Эхлэх хугацаа')}`,
			cell: (row) => row?.is_open ? formatDate(row?.start_date, 'YYYY-MM-DD HH:mm:ss') : '',
            sortable: true,
			minWidth: "150px",
			left: true,
        },
		{
			header: 'end_date',
			name: `${t('Дуусах хугацаа')}`,
			cell: (row) => row?.is_open ? formatDate(row?.end_date, 'YYYY-MM-DD HH:mm:ss'): '',
            sortable: true,
			minWidth: "150px",
			left: true,
        },
		{
			header: 'is_open',
			name: `${t('Нээлттэй эсэх')}`,
			cell: (row) => row?.is_open ? <Badge color="light-success" pill>{t('Нээлттэй')}</Badge>: <Badge color="light-primary" pill>{t('Оюутан болон багшийн системд нээлттэй')}</Badge>,
			minWidth: "180px",
			center: true,
        },
		{
			header: 'created_at',
			name: `${t('Бүртгэгдсэн огноо')}`,
			cell: (row) => formatDate(row?.created_at, 'YYYY-MM-DD HH:mm:ss'),
            sortable: true,
			minWidth: "180px",
			center: true,
		},
        {
			header: 'created_user',
			name: `${t('Оруулсан хэрэглэгч')}`,
			cell: (row) => row?.created_user_name,
            sortable: true,
			minWidth: '180px',
			wrap: true,
			center: true,
        },
	]

    if(Object.keys(user).length > 0) {
		columns.push(
        	{
				name: t("Үйлдэл"),
				maxWidth: "150px",
				mINWidth: "150px",
				selector: (row) => (
					<div className="text-center" style={{ width: "auto" }}>
						<a role="button"
							onClick={() => handleEditModal(row.id)}
							id={`complaintListDatatableEdit${row?.id}`}>
							<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
						</a>
						<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
						{
							user.permissions.includes('lms-service-news-delete')
							&&
							<>
								<a
									className='ms-1'
									role="button"
									onClick={() => showWarning({
										header: {
											title: t(`Зар мэдээ`),
										},
										question: t(`Зар мэдээг устгах уу?`),
										onClick: () => handleDelete(row.id),
										btnText: t('Устгах'),
									})}
									id={`complaintListDatatableCancel${row?.id}`}
								>
										<Badge color="light-danger" pill><X width={"100px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
							</>
						}

						<a
							id={`complaintListDatatableDetail${row.id}`}
							className='ms-1'
							href={`/service/show/${row.id}`}
							target={'_blank'}
						>
							<Badge color="light-info" pill><Book  width={"15px"} /></Badge>
						</a>

						<UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
					</div>
				),
				center: true,
			}
		)
	}

    return columns

}
