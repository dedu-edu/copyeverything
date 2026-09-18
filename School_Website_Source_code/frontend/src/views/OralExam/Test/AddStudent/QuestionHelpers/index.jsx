import { UncontrolledTooltip } from 'reactstrap'
export function getQuestionColumns(currentPage, rowsPerPage, total_count) {
    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: '№',
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            width: '50px',
            center: true,
            wrap: true,
            conditionalCellStyles: [{
                when: () => true,
                style: {
                    padding: '0px',
                    margin: '0px',
                },
            }],
        },
        {
            name: (
                <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>
                    Билет №
                </span>
            ),
            selector: (row) => <span>{row?.question_card_number}</span>,
            width: '70px',
            center: true
        },
        {
            name: (
                <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>
                    Асуулт
                </span>
            ),
            cell: (row) => (
                <>
                    <div
                        id={`questionCell${row?.id}`}
						style={{
						overflow: "hidden",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
						width: "200px",
						cursor: "pointer"
						}}
                    >
                        {row?.question}
                    </div>
                    {row?.question && (
				        <UncontrolledTooltip
					        placement='top'
					        target={`questionCell${row?.id}`}
					        style={{ maxWidth: '250px' }}
				        >
					        {row?.question}
				        </UncontrolledTooltip>
			        )}
                </>
            ),
            maxWidth: '200px',
            left: true,
            wrap: false,
        },
        {
            name: (
                <span title='Онлайн асуулт сан' style={{}}>
                    Онлайн асуулт сан
                </span>
            ),
            cell: (row) => (
                <>
                    <div
                        id={`descCell${row?.id}`}
						style={{
						overflow: "hidden",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
						width: "200px",
						cursor: "pointer"
						}}
                    >
                        {row?.title}
                    </div>
                    {row?.title && (
				        <UncontrolledTooltip
					        placement='top'
					        target={`descCell${row?.id}`}
					        style={{ maxWidth: '250px' }}
				        >
					        {row?.title}
				        </UncontrolledTooltip>
			        )}
                </>
            ),
            minWidth: '200px',
            maxWidth: '200px',
            center: true
        },
        {
            name: (
                <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>
                    Асуултын түвшин
                </span>
            ),
            selector: (row) => <div>{row?.level === 1 ? <span>Хөнгөн</span> : row?.level === 2 ? <span>Дунд</span> : <span>Хүнд</span>}</div>,
            maxWidth: '50px',
            center: true,
            wrap: true
        },
        {
            name: (
                <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>
                    Асуултын оноо
                </span>
            ),
            selector: (row) => row?.score,
            maxWidth: '50px',
            center: true,
            wrap: true
        },
    ]
    return columns
}
