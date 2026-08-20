
import { Edit, Eye, Trash2 } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap';
import useModal from "@hooks/useModal"
import { t } from 'i18next';

export function getColumns(currentPage, rowsPerPage, total_count, handleDelete, showStudentQuestions) {

    const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

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
            name: `${'Дамжаа'}`,
            selector: (row) => row?.group_name,
            minWidth: "100px",
            center: true,
        },
        {
            name: `${'Оюутны код'}`,
            selector: (row) => row?.code,
            minWidth: "100px",
            center: true,
        },
        {
            name: `${'Овог'}`,
            selector: (row) => row?.last_name,
            minWidth: "200px",
            wrap:true,
            center: true,
        },
        {
            name: `${'Нэр'}`,
            selector: (row) => row?.first_name,
            minWidth: "200px",
            wrap:true,
            center: true,
        },
        {
            name: t('Асуултууд'),
            selector:  (row) => (
                <>
                    <a
                        role="button"
                        onClick={() => { showStudentQuestions(row?.id) }}
                        id={`showQuestions${row?.id}`}
                        className='me-1'
                    >
                        <Badge color="light-primary" ><Eye width={"10px"} /></Badge>
                    </a>
                    <UncontrolledTooltip placement='top' target={`showQuestions${row.id}`} >{t('Асуултуудыг харах')}</UncontrolledTooltip>
                </>
            ),
            center: true,
            minWidth: "50px",
        },
        {
            name: `${'Устгах'}`,
            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}  >
                    <a
                        role='button'
                        className='ms-1'
                        onClick={() => showWarning({
                            header: {
                                title: `Оюутныг шалгалтнаас хасах`,
                            },
                            question: `Та энэ оюутныг тухайн шалгалтнаас хасахдаа итгэлтэй байна уу?`,
                            onClick: () => handleDelete(row?.id),
                            btnText: 'Устгах',
                        })}
                        id={`complaintListDatatableCancel${row?.id}`}
                    >
                        <Badge color="light-danger" pill><Trash2  width={"15px"} /></Badge>
                    </a>
				</div>
            ),
            center: true,
            minWidth: "50px",
        }
    ]
    return columns
}
