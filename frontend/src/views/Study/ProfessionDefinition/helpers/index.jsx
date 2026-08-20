import { X, Edit, BookOpen, Copy } from 'react-feather'

import { Badge, UncontrolledTooltip } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import useModal from '@hooks/useModal'
import PopoverCell from '@src/components/CPopoverCell';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, planhandleModal, user, copyModalHandler) {

	const { t } = useTranslation()
	const { showWarning } = useModal()

	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'code',
			name: t("Индекс"),
			selector: (row) => <PopoverCell value={row?.code}/>,
			sortable: true,
			center: true,
			wrap: true
		},
		{
			header: 'name',
			name: t("Хөтөлбөр нэр"),
			selector: (row) => <PopoverCell value={row?.name}/>,
			sortable: true,
			minWidth: "250px",
			left: true,
			wrap: true
		},
		{
			header: 'duration',
			name: `${t('Хугацаа')}`,
			selector: (row) => <PopoverCell value={row?.duration}/>,
            sortable: true,
			center: true,
        },
		{
			header: 'degree',
			name: t("Боловсролын зэрэг"),
			selector: (row) => <PopoverCell value={row?.degree?.degree_name}/>,
			sortable: true,
			minWidth: "250px",
			maxWidth: "200px",
			center: true,
		},
		{
			header: 'confirm_year',
			name: t("Батлагдсан он"),
			selector: (row) => <PopoverCell value={row?.confirm_year}/>,
			sortable: true,
			minWidth: "150px",
			maxWidth: "200px",
			center: true,
		},
		{
			header: 'volume_kr',
			name: t("Нийт багц цаг"),
			selector: (row) => <PopoverCell value={row?.volume_kr}/>,
			sortable: true,
			minWidth: "150px",
			maxWidth: "200px",
			center: true,
		},
		{
			header: 'dep_name',
			name: t("Төрөлжсөн чиглэл"),
			selector: (row) => <PopoverCell value={row?.dep_name}/>,
			sortable: true,
			minWidth: "150px",
			maxWidth: "200px",
			center: true,
		},
			{
			header: 'groups',
			name: t("Бүртгэлтэй дамжаа"),
			selector: (row) => <PopoverCell value={row?.groups?.join(', ')}/>,
			sortable: true,
			minWidth: "450px",
			maxWidth: "400px",
			center: true,
		},
	]

	if(Object.keys(user).length > 0 ) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			minWidth: '200px',
			maxWidth: "200px",
			center: true,
			selector: (row) => (
				<div style={{ width: "auto" }}>
					{
						user.permissions.includes('lms-study-learningplan-update') &&
						<>
							<a role="button" onClick={(e) => { copyModalHandler(e, row)} }
								id={`complaintCopyDatatablePlan${row?.id}`}
								className="me-1"
							>
								<Badge color="light-success" pill><Copy  width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintCopyDatatablePlan${row.id}`} >Хувилах</UncontrolledTooltip>
						</>

					}
					{
						user.permissions.includes('lms-study-learningplan-read') &&
						<>
							<a role="button" onClick={() => { planhandleModal(row.id)} }
								id={`complaintListDatatablePlan${row?.id}`}
								className="me-1"
							>
								<Badge color="light-info" pill><BookOpen  width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatablePlan${row.id}`} >Сургалтын төлөвлөгөө</UncontrolledTooltip>
						</>

					}
					{
						user.permissions.includes('lms-study-profession-update') &&
						<>
							<a role="button" onClick={() => { editModal(row.id)} }
								id={`complaintListDatatableEdit${row?.id}`}
								className="me-1"
							>
								<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
							</a>

							<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
						</>
					}
					{
						user.permissions.includes('lms-study-profession-delete') &&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Хөтөлбөр устгах')}`,
									},
									question: `Та "${row.code}" индекстэй хөтөлбөрыг устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: `${t('Устгах')}`,
								})}
								id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
				</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
