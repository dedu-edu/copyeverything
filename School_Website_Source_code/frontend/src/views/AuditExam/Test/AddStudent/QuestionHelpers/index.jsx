
import { Trash2 } from 'react-feather'
import { Badge } from 'reactstrap';
import useModal from "@hooks/useModal"
import PopoverCell from '@src/components/CPopoverCell';

export function getQuestionColumns(currentPage, rowsPerPage, total_count, handleDeleteQuestion) {

    const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
			name: "№",
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			center: true,
			minWidth: "1%",
		},
        {
            name: "Онлайн асуулт сан",
            cell: (row) => <PopoverCell value={row?.question} />,
            minWidth: "200px",
            left: true,
        },
        {
            name: "Түвшин",
            cell: (row) => (
                <span>{`Түвшин-${row?.level}`}</span>
            ),
            minWidth: "20%",
            center: true,
        },
        {
            name: "Оноо",
            selector: (row) => row?.score,
            minWidth: "5%",
            center: true,
        },
        {
            name: `${'Устгах'}`,
            selector: (row) => (
                <div className="text-center" style={{ width: "auto" }}  >
                    <a
                        role='button'
                        className='ms-1'
                        onClick={() => showWarning({
                            header: {
                                title: `Шалгалтын асуултыг устгах`,
                            },
                            question: `Уг асуултыг шалгалтнаас хасахад итгэлтэй байна уу?`,
                            onClick: () => handleDeleteQuestion(row?.id),
                            btnText: 'Устгах',
                        })}
                        id={`complaintListDatatableCancel${row?.id}`}
                    >
                        <Badge color="light-danger" pill><Trash2 width={"15px"} /></Badge>
                    </a>
                </div>
            ),
            center: true,
            minWidth: "10%",
        }
    ]
    return columns
}
