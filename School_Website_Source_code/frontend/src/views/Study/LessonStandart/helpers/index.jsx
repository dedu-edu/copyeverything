import { Badge,UncontrolledTooltip} from 'reactstrap';

import { t } from 'i18next';

import { X, Edit, Edit2 } from 'react-feather'

import useModal from '@hooks/useModal'
import PopoverCell from '@src/components/CPopoverCell';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user, handleScoreEdit) {

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
			minWidth: "150px",
			center: true,
		},
		{
			header: 'name',
			name: t("Нэр"),
			selector: (row) => <PopoverCell value={row?.name}/>,
			sortable: true,
			minWidth: "300px",
			center: true,
			wrap: true
		},
		{
			header: 'kredit',
			name: t("Багц цаг"),
			selector: (row) => <PopoverCell value={row?.ckredit}/>,
			sortable: true,
			minWidth: "150px",
			center: true,
		},
		{
			header: 'professions',
			name: t("Холбоотой хөтөлбөр"),
			selector: (row) => <PopoverCell value={row?.professions}/>,
			sortable: true,
			minWidth: "230px",
			width: "300px",
			center: true,
            wrap: true
		},
		{
			name: `${t('Дүнтэй эсэх')}`,
			selector: (row) => (
				<div>
					<Badge color={row?.is_score ? 'success' : 'primary'}>{row?.is_score ? 'Байгаа' : 'Байхгүй'}</Badge>
				</div>
			),
			minWidth: "150px",
			width: "200px",
			center: true,
        },
		{
			header: 'department__name',
			name: t("Тэнхим"),
			selector: (row) => <PopoverCell value={row?.department?.name}/>,
			sortable: true,
			minWidth: "180px",
			wrap: true
		},
		{
			header: 'teachers',
			name: t("Заах багш"),
			selector: (row) => <PopoverCell value={row?.teachers?.teacher_name}/>,
			sortable: true,
			minWidth: "250px",
			wrap: true
		},
	]

	if(Object.keys(user).length > 0 ) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			maxWidth: "180px",
			minWidth: "180px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { editModal(row.id)}} id={`complaintListDatatableEdit${row?.id}`} className="me-1">
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
					{
						user.permissions?.includes('lms-study-score-update')
						&&
						<>
							<a role="button" onClick={() => { handleScoreEdit(row)}} id={`groupScoreEdit${row?.id}`} className="me-1">
								<Badge color="light-secondary" pill><Edit2  width={"15px"}/></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`groupScoreEdit${row.id}`} >Дүн шилжүүлэх</UncontrolledTooltip>
						</>
					}

					{
						user.permissions.includes('lms-study-lessonstandart-delete')&&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Хичээлийн стандарт устгах')}`,
									},
									question: `Та "${row.code}" кодтой хичээлийн стандартыг устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: 'Устгах',
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
