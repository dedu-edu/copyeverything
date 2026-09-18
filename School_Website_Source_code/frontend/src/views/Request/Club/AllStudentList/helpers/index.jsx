import { t } from 'i18next'

import { Badge, UncontrolledTooltip } from 'reactstrap'
import { Book } from 'react-feather'

export function getColumns (currentPage, rowsPerPage, total_count, handleAnketModal) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const solved_type_color = (solved_flag) => {
        let color = ''
        let solved_flag_name = ''
        if (solved_flag === 1) {
            color = 'light-info'
            solved_flag_name = 'Оюутан илгээсэн'
        }
        else if (solved_flag === 2) {
            color = 'light-warning'
            solved_flag_name = 'Оюутан цуцалсан'
        }
        else if (solved_flag === 3) {
            color = 'light-success'
            solved_flag_name = 'Зөвшөөрсөн'
        }
        else if (solved_flag === 4) {
            color = 'light-danger'
            solved_flag_name = 'Татгалзсан'
        } else if (solved_flag === 5) {
            color = 'light-primary'
            solved_flag_name = 'Хүлээгдэж буй'
        }
        return (
            <Badge color={color} pill>
                {solved_flag_name}
            </Badge>
        )
    }

    var columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
        {
			header: 'student',
			name: t("Оюутан"),
            selector: (row) => row?.student?.full_name + ' ' + row?.student?.code,
            left: true,
            minWidth: "150px",
            maxWidth: '250px',
        },
        {
            header: 'club',
            name: t("Клуб"),
            selector: (row) => <span title={row?.club?.name}>{row?.club?.name}</span>,
            left: true,
            maxWidth: '200px',
            minWidth: '250px',
            wrap: true,
        },
        {
            header: 'request_flag',
            name: t("Төлөв"),
            selector: (row) => (
                solved_type_color(row?.request_flag)
            ),
            center: true,
            minWidth: '230px'
        },
        {
            header: 'club__leader__first_name',
            name: t("Клубийн тэргүүн"),
            selector: (row) => <span title={row?.leader_name}>{row?.leader_name}</span>,
            left: true,
            maxWidth: '150px',
            minWidth: '200px',
        },
        {
            header: 'description',
            name: t("Хүсэлт"),
            selector: (row) => <span title={row?.description}>{row?.description}</span>,
            left: true,
            maxWidth: '450px',
            minWidth: '200px',
        },
        {
            header: 'answer',
            name: t("Хүсэлтийн хариу"),
            selector: (row) => <span title={row?.answer}>{row?.answer}</span>,
            left: true,
            maxWidth: '350px',
            minWidth: '200px',
        },
        {
            header: 'request',
            name: t("Анкет"),
            center: true,
            minWidth: '30px',
            maxWidth: '70px',
            selector: (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    <a role="button" onClick={() => { handleAnketModal(row)} }
                        id={`complaintListDatatableDetail${row?.id}`}
                    >
                        <Badge color="light-primary" pill><Book width={"15px"} /></Badge>
                    </a>
                    <UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip>
                </div>
            ),

        }
	]

    return columns;

}
