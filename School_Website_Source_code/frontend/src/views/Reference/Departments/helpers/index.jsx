import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { Edit, X} from 'react-feather'
import useModal from "@hooks/useModal"
import PopoverCell from '@src/components/CPopoverCell';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleUpdateModal, handleDelete) {
	const page_count = Math.ceil(total_count / rowsPerPage)
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
			header: 'name',
			name: t("Тэнхимийн нэр"),
			selector: (row) => <PopoverCell value={row?.name}/>,
			minWidth: "150px",
			center: true,
		},
		{
			header: 'school',
			name: t("Бүрэлдэхүүн сургууль"),
			selector: (row) => <PopoverCell value={row?.school}/>,
			minWidth: "150px",
			center: true,
			wrap: true,
		},
		{
			header: 'leaders',
			name: t("Тэнхимийн эрхлэгч"),
			selector: (row) => <PopoverCell value={row?.leaders}/>,
			wrap: true,
			center: true,
		},
        // {
		// 	name: `${t('Нийтийн сүлжээ')}`,
		// 	selector: (row) => row?.social,
		// 	minWidth: "50px",
		// 	center: true
		// },
        // {
		// 	name: `${t('Вэб')}`,
		// 	selector: (row) => row?.web,
		// 	minWidth: "50px",
		// 	center: true
		// },
		// {
		// 	name: `${t('Хаяг')}`,
		// 	selector: (row) => row?.address,
		// 	minWidth: "50px",
		// 	center: true
		// },
		{
            name: `${t('Үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    {
                        <>
                            <a role="button"
                                onClick={() => handleUpdateModal(row?.id, row)}
                                id={`updateSchool${row?.id}`}
                            >
                                <Badge color="light-primary" pill><Edit width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`} hideArrow>засах</UncontrolledTooltip>
						</>
                    }
					{
						<>
							<a role="button"
								className='ms-1'
								onClick={() => showWarning({
									header: {
										title: `${t('Тэнхимийн мэдээлэл устгах')}`,
									},
									question: `Та  ${row?.name} устгахдаа итгэлтэй байна уу?`,
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
				</div>
            ),
            minWidth: "200px",
            maxWidth: "200px",
            center: true,
        },
	]


    return columns

}
