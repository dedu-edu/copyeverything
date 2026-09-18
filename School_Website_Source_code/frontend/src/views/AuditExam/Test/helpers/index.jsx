import { Eye, Edit, Book, Paperclip, Trash2 } from 'react-feather'

import useModal from "@hooks/useModal"
import { formatDate } from '@utils'
import { Badge, UncontrolledTooltip } from 'reactstrap';

export function getColumns(currentPage, rowsPerPage, total_count, handleEdit, handleDelete, handleShow, handleSend, handleEditModal, handleExamModal, permissions) {

    const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: "5%",
            center: true,
        },
        {
            name: `${'Шалгалт'}`,
            selector: (row) => row?.title,
            minWidth: "15%",
            wrap: true,
            left: true,
        },
        {
            name: `${'Багш'}`,
            selector: (row) => row?.teacher_name,
            minWidth: "15%",
            wrap: true,
            center: true,
        },
        {
            name: `${'Эхлэх хугацаа'}`,
            selector: (row) => formatDate(row?.start_date, 'YYYY-MM-DD HH:mm'),
            minWidth: "15%",
            center: true,
        },
        {
            name: `${'Дуусах хугацаа'}`,
            selector: (row) => formatDate(row?.end_date, 'YYYY-MM-DD HH:mm'),
            minWidth: "15%",
            center: true,
        },
        {
            name: <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>Шалгалт өгсөн оюутны тоо</span>,
            selector: (row) => row?.is_student,
            minWidth: "10%",
            center: true,
        },
    ]

    if(permissions?.includes("lms-audit-exam-update")) {
        columns.push(
            // Устгах үед шалгалтын эхлэх хугацаа эхлээд дуусах хугацаа болоогүй үед устгах боломжгүй
            {
                name: "Үйлдэл",
                center: true,
                width:"250px",
                minWidth:"250px",
                maxWidth:"250px",
                selector: (row) => {
                    return (
                        <div className="text-center " style={{ width: "auto" }}>
                            <>
                                <a
                                    role="button"
                                    onClick={() => { handleShow(row) }}
                                    id={`complaintListDatatableShow${row?.id}`}
                                    className='me-1'
                                    href={`/challenge/audit/addstudent/${row?.id}/`}
                                >
                                    <Badge color="light-info"><Book width={"10px"} /></Badge>
                                </a>
                                <UncontrolledTooltip placement='top' target={`complaintListDatatableShow${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
                            </>
                            <>
                                <a
                                    role="button"
                                    onClick={() => { handleEditModal(row) }}
                                    id={`complaintListDatatableEdit${row?.id}`}
                                    className='me-1'
                                >
                                    <Badge color="light-success"><Edit width={"10px"} /></Badge>
                                </a>
                                <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
                            </>
                            <>
                                <a
                                    role="button"
                                    onClick={() => showWarning({
                                        header: {
                                            title: `Шалгалт устгах`,
                                        },
                                        question: `Та энэ асуултыг шалгалтыг устгахдаа итгэлтэй байна уу? Шалгалтын өгсөн оюутнуудын хариулт хамт устахыг анхаарна уу`,
                                        onClick: () => handleDelete(row.id),
                                        btnText: 'Устгах',
                                    })}
                                    className='me-1'
                                    id={`complaintListDatatableCancel${row?.id}`}
                                >
                                    <Badge color="light-danger" ><Trash2 width={"10px"} /></Badge>
                                </a>
                                <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
                            </>
                            <>
                                <a
                                    role="button"
                                    onClick={() => { handleExamModal(row?.id) }}
                                    id={`complaintListDatatableExam${row?.id}`}
                                    className='me-1'
                                >
                                    <Badge color="light-primary" ><Eye width={"10px"} /></Badge>
                                </a>
                                <UncontrolledTooltip placement='top' target={`complaintListDatatableExam${row.id}`} >Шалгалтын асуултын загвар харах</UncontrolledTooltip>
                            </>
                            <>
                                <a
                                    role="button"
                                    onClick={() => { handleShow(row) }}
                                    id={`complaintResultDetail${row?.id}`}
                                    className='me-1'
                                    href={`/challenge/detail/${row?.id}/`}
                                    target={'_blank'}
                                >
                                    <Badge color="secondary"><Paperclip width={"10px"} /></Badge>
                                </a>
                                <UncontrolledTooltip placement='top' target={`complaintResultDetail${row.id}`}>Үр дүн харах</UncontrolledTooltip>
                            </>
                        </div>
                    )
                },
            },
        )
    }
    return columns
}
