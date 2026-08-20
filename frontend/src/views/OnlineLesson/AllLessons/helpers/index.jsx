import { t } from "i18next";
import { Book } from "react-feather";
import { Link } from "react-router-dom";
import { Badge, UncontrolledTooltip } from "reactstrap";
// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count) {

	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
	if (currentPage > page_count) {
		currentPage = 1
	}

	const colStyles = {
		center: true,
		wrap: true,
		minWidth: '50px'
	}

	const headStyles = (label) => (
		<div style={{ overflow: 'auto', maxHeight: '30px' }}>
			{label}
		</div>
	)

	const columns = [
		{
			...colStyles,
			name: headStyles("№"),
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			maxWidth: '50px',
		},
		{
			...colStyles,
			name: headStyles(`${t('Хичээлийн нэр')}`),
			selector: (row) => row?.lesson_name + ' ' + row.lesson_code,
			sortable: true,
			minWidth: '300px'
		},
		{
			...colStyles,
			name: headStyles(`${t('Багш')}`),
			cell: (row) => row?.teacher?.full_name,
		},
		{
			...colStyles,
			name: headStyles(`${t('Оюутны тоо')}`),
			cell: (row) => row?.student_count,
		},
		{
			...colStyles,
			name: headStyles(`${t('Хичээл')}`),
			cell: (row) => row?.total_homeworks_and_exams.week_count,
		},
		{
			...colStyles,
			name: headStyles(`${t('Даалгавар')}`),
			cell: (row) => row?.total_homeworks_and_exams.homework_count,
		},
		{
			...colStyles,
			name: headStyles(`${t('Шалгалт')}`),
			cell: (row) => row?.total_homeworks_and_exams.challenge_count,
		},
		{
			...colStyles,
			name: headStyles(`${t('Үйлдэл')}`),
			selector: (row) => {
				return (
					<>
						<Link to={`/online_lesson/${row.id}`} id={`detail${row.id}`}>
							<Badge color="light-info" pill><Book width={"15px"} /></Badge>
						</Link>
						<UncontrolledTooltip placement="top" target={`detail${row.id}`} >
							Дэлгэрэнгүй
						</UncontrolledTooltip>
					</>
				)
			},
		},
	]

	return columns

}
