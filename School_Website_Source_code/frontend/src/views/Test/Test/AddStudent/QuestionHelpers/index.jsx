
import { Trash2 } from 'react-feather'
import { Badge } from 'reactstrap';
import useModal from "@hooks/useModal"

export function getQuestionColumns(currentPage, rowsPerPage, total_count, handleDeleteQuestion) {

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
            name: <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>Асуулт</span>,
            selector: (row) => <span title={row?.question}>{row?.question}</span>,
            minWidth: "750px",
            maxWidth: "750px",
            left: true,
            wrap: true,
        },
        {
            name: <span title='Онлайн асуулт сан' style={{}}>Онлайн асуулт сан</span>,
            selector: (row) => <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>{row?.title}</span>,
            minWidth: "200px",
            maxWidth: "200px",
            center: true,
        },
        {
            name: <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>Асуултын түвшин</span>,
            selector: (row) => (
                <div>
                    {
                        row?.level === 1
                            ?
                            <span>Хөнгөн</span>
                            : row?.level === 2 ?
                                <span>Дунд</span>
                                :
                                <span>Хүнд</span>
                    }
                </div>
            ),
            maxWidth: "50px",
            center: true,
            wrap: true,
        },
        {
            name: <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>Асуултын оноо</span>,
            selector: (row) => row?.score,
            maxWidth: "50px",
            center: true,
            wrap: true,
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
            maxWidth: "50px",
        }
    ]
    return columns
}
