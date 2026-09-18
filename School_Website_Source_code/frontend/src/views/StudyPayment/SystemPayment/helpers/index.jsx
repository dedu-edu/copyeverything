
import { t } from 'i18next'
import moment from 'moment'
import { moneyFormat } from '@src/utility/Utils'

import { Col, Row, Badge } from 'reactstrap'
import PopoverCell from '@src/components/CPopoverCell';

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, page_count) {

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
	if (currentPage > page_count) {
		currentPage = 1
	}
	const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			center: true,
			maxWidth: "80px",
			minWidth: "80px",
		},
		{
			minWidth: "150px",
			header: 'last_name',
			name: t("Овог, Нэр"),
			cell: (row) => <PopoverCell value={row?.full_name} />,
			sortable: true,
			reorder: true,
			center: true,
			wrap: true,
		},
		{
			minWidth: "150px",
			header: 'student__status',
			name: t("Суралцагчийн төлөв"),
			cell: (row) => (row?.status_name),
			sortable: true,
			left: true,
		},
		{
			maxWidth: "200px",
			minWidth: "200px",
			header: 'group_name',
			name: 'Анги',
			wrap: true,
			selector: (row) => <PopoverCell value={row?.group_name} />,
			sortable: true,
			left: true,
		},
		{
			minWidth: "150px",
			header: 'total_qpay_transaction_amount',
			name: t("Төлсөн дүн"),
			cell: (row) => (row?.total_qpay_transaction_amount),
			sortable: true,
			right: true,
			wrap: true,
		},
		{
			sortField: 'lesson_year',
			header: 'lesson_year',
			maxWidth: "200px",
			minWidth: "200px",
			reorder: true,
			sortable: true,
			name: t("Хичээлийн жил"),
			selector: (row) => row?.lesson_year,
			center: true,
		},
		{
			header: 'admission',
			name: 'Элсэгчээр төлсөн эсэх',
			selector: (row) => {
				return(
					row?.admission_id
					?
						<Badge color="light-success" pill>
							Тийм
						</Badge>
					:
						<Badge color="light-info" pill>
							Үгүй
						</Badge>
				)
			},
			sortable: true,
			center: true,
		},
		{
			header: 'kind',
			name: 'Төлбөрийн төрөл',
			selector: (row) => {
				return(
					row?.kind == 2
					?
						<Badge color="light-success" pill>
							Qpay
						</Badge>
					:
						<Badge color="light-info" pill>
							Банк
						</Badge>
				)
			},
			sortable: true,
			center: true,
		},
		{
			sortField: 'payed_date',
			header: 'payed_date',
			maxWidth: "200px",
			minWidth: "200px",
			reorder: true,
			sortable: true,
			name: t("Төлсөн огноо"),
			selector: (row) => row?.payed_date ? moment(row?.payed_date).format("YYYY-MM-DD HH:mm:ss") : '',
			center: true,
		},
	]
    return columns
}


export function getFooter(data) {
	return (
		<div className='react-dataTable'>
			<div className='rdt_TableBody'>
				<Row className='m-0 p-1 s-ps-cborder s-ps-clight rdt_TableRow' align="center" style={{ fontSize: '13px' }}>
					<Col className='p-0 fw-bolder text-center'>Нийт дүн</Col>
					<Col className='p-0 fw-bolder' align="right">{moneyFormat(data?.tulsun_dun)}</Col>
					<Col></Col>
					<Col></Col>
				</Row>
			</div>
		</div>
	)
}