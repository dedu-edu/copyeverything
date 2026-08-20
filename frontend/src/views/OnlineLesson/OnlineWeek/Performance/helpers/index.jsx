import { t } from 'i18next';
import { Badge, Button, UncontrolledTooltip } from 'reactstrap';
import { Eye, X } from 'react-feather';
import useModal from "@hooks/useModal";
export function getColumns(currentPage, rowsPerPage, total_count, handleDelete, handleDetail) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

	const { showWarning } = useModal();

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
		},
		{
			header: 'Оюутны код',
			name: t("Оюутны код"),
			selector: (row) => row?.code,
			left: true,
			width: '120px'
		},
		{
			name: `${t("Овог")}`,
			selector: (row) => (row?.last_name),
			left: true,
			width: '200px'
		},
		{
			header: 'Нэр',
			name: t("Нэр"),
			selector: (row) => row?.first_name,
			left: true,
			width: '200px'
		},
		{
			name: t("Регистр"),
			selector: (row) => row?.register_num,
			left: true,
			width: '150px'
		},
		{
			header: 'Анги',
			name: t("Анги"),
			selector: (row) => row?.group_name,
			left: true,
			width: '150px'
		},
		{
			name: t("Даалгавар (Нийт / Гүйцэтгэсэн)"),
			selector: (row) => {
				return(
					<div>{row?.online_lesson_review?.count_homework} / {row?.online_lesson_review?.study_homework_count}</div>
				)
			},
			center: true,
			width: '150px'
		},
		{
			name: t("Шалгалт (Нийт / Өгсөн)"),
			selector: (row) => {
				return(
					<div>{row?.online_lesson_review?.count_challenge} / {row?.online_lesson_review?.study_challenge_count}</div>
				)
			},
			center: true,
			width: '150px'
		},
		{
			name: t("Материалууд (Нийт / Үзсэн)"),
			selector: (row) => {
				return(
					<div>{row?.online_week_datas?.total_count} / {row?.online_week_datas?.view_count}</div>
				)
			},
			center: true,
			width: '150px'
		},
		{
			name: t("Хувь"),
			selector: (row) => {
				return(
					<div>{row?.online_week_datas?.percent}%</div>
				)
			},
			center: true,
			width: '150px'
		},
		{
			name: t("Үйлдэл"),
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<Button
						onClick={() => handleDetail(row)}
						id={`complaintListDatatableEye${row?.id}`}
						className='me-50'
						style={{
							background: 'transparent',
							border: 'none',
							padding: 0,
							margin: 0,
						}}
  						color="link"
					>
						<Badge color="light-primary" pill><Eye width={"100px"} /></Badge>
					</Button>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEye${row.id}`} >Явц</UncontrolledTooltip>
					<a role="button"
						onClick={() => showWarning({
							header: {
								title: t(`Мэдээлэл устгах`),
							},
							question: t(`Та ${row?.code} ${row?.first_name} оюутныг цахим хичээлээс устгахдаа итгэлтэй байна уу?`),
							onClick: () => handleDelete(row?.id),
							btnText: t('Устгах'),
						})}
						id={`complaintListDatatableCancel${row?.id}`}
					>
						<Badge color="light-danger" pill><X width={"100px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
				</div>
			),
			center: true,
		}
	]

    return columns
}
