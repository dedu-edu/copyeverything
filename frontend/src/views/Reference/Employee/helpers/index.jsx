import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { Lock, Edit, X} from 'react-feather'
import useModal from "@hooks/useModal"
import PopoverCell from '@src/components/CPopoverCell';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleEdit, handleDelete, user, changePassModal) {
	const page_count = Math.ceil(total_count/ rowsPerPage)
	if (currentPage > page_count) {
        currentPage = 1
    }
	const { showWarning } = useModal()

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'full_name',
			name: t("Нэр"),
			selector: (row) => <PopoverCell value={`${row?.full_name} ${row?.code ? `/${row?.code}/` : ''}`}/>,
			minWidth: "150px",
			left: true,
		},
		{
			header: 'email',
			name: t("И-мэйл"),
			selector: (row) => <PopoverCell value={row?.email}/>,
			minWidth: "150px",
			left: true,
		},
		{
			header: 'register',
			name: t("Регистр"),
			selector: (row) => <PopoverCell value={row?.register}/>,
			maxWidth: "300px",
			center: true,
		},
       {
			header: 'org_position',
			name: t("Албан тушаал"),
			selector: (row) => (
				<PopoverCell
					value={`${row?.org_position_name || ''} ${row?.rank_name || ''}`}
				/>
			),
			sortable: true,
			minWidth: "200px",
			left: true,
			sortable: true,
		},
		{
			header: 'salbar',
			name: t("Тэнхим"),
			selector: (row) => <PopoverCell value={row?.salbar?.name}/>,
			maxWidth: "300px",
			left: true,
			sortable: true,
			wrap: true,
		},
		{
			header: 'state',
			name: t("Ажилтны төлөв"),
			selector: (row) => {
                return (
                    row?.state == 1
                    ?
                        <Badge color="light-success" pill>
                            {t('Ажиллаж байгаа')}
                        </Badge>
					:
						row?.state == 5
						?
							<Badge color="light-warning" pill>
								{t('Тэтгэвэрт гарсан')}
							</Badge>
						:
							row?.state == 4
							?
								<Badge color="light-warning" pill>
									{t('Шилжсэн')}
								</Badge>
							:
								<Badge color="light-danger" pill>
									{t('Чөлөөлөгдсөн')}
								</Badge>
                )
            },
            sortable: false,
            center: true,
            minWidth: '230px'
        },
		{
            name: `${t('Үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    {
						user?.permissions?.includes('lms-reference-teacher-update')
						&&
                        <>
                            <a role="button"
                                onClick={() => handleEdit(row)}
                                id={`updateSchool${row?.id}`}
                            >
                                <Badge color="light-primary" pill><Edit width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`} hideArrow>Засах</UncontrolledTooltip>
						</>
                    }
					{
						user?.permissions?.includes('lms-reference-teacher-delete')
						&&
						<>
							<a role="button"
								className='ms-1'
								onClick={() => showWarning({
									header: {
										title: `${t('Ажилтны мэдээлэл устгах')}`,
									},
									question: `Та  ${row?.full_name} ажилтны мэдээллийг устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row?.id),
									btnText: 'Устгах',
								})}
								id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row?.id}`} hideArrow>Устгах</UncontrolledTooltip>
						</>
					}
					{
						(user.permissions.includes('lms-subschools-password-update')) &&
                        <>
                            <a
								role="button"
								onClick={() => showWarning({
									header: {
										title: t(`Ажилтны нууц үг`),
									},
									question: t(`Ажилтны нууц үг сэргээх үү?`),
									onClick: () => changePassModal(row?.id)
								})}
								id={`complaintListDatatableEditPass${row?.id}`}
								className="ms-1"
							>
								<Badge color="light-info" pill><Lock  width={"15px"}/></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableEditPass${row.id}`} hideArrow>Нууц үг сэргээх</UncontrolledTooltip>
						</>
                    }
				</div>
            ),
            minWidth: "200px",
            maxWidth: "200px",
            center: true,
        },
	]
    return columns
}

