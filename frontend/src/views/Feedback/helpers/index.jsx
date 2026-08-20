import moment from 'moment'
import { Book, Download } from "react-feather"
import { Badge, UncontrolledTooltip } from "reactstrap"

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count, t, handleDetailModal) {
	const page_count = Math.ceil(total_count / rowsPerPage)

	// /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
	if (currentPage > page_count) {
		currentPage = 1
	}

	const defaultFields = {
		sortable: true,
		reorder: true,
		center: true,
		wrap: true,
	}

	const defaultWidths = {
		minWidth: '140px',
		maxWidth: '140px',
	}

	const columns = [
		{
			name: <div className="text-center">№</div>,
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			minWidth: '70px',
			maxWidth: '70px',
			center: true,
		},
		{
			...defaultFields,
			header: 'title',
			name: <div className="text-center">{t('Гарчиг')}</div>,
			selector: (row) => row?.title,
		},
		{
			...defaultFields,
			...defaultWidths,
			header: 'teacher_register_code',
			name: <div className="text-center">{t('Багшийн код')}</div>,
			selector: (row) => row?.teacher_register_code,
		},
		{
			...defaultFields,
			header: 'teacher__last_name',
			name: <div className="text-center">{t("Овог")}</div>,
			cell: (row) => (row?.teacher?.last_name),
		},
		{
			...defaultFields,
			header: 'teacher__first_name',
			name: <div className="text-center">{t("Нэр")}</div>,
			cell: (row) => (row?.teacher?.first_name),
		},
		{
			...defaultFields,
			header: 'teacher__sub_org__id',
			name: <div className="text-center">{t('Сургууль')}</div>,
			selector: (row) => row?.teacher?.sub_org?.name,
		},
		{
			...defaultFields,
			...defaultWidths,
			header: 'type',
			name: <div className="text-center">{t("Төлөв")}</div>,
			selector: (row) => (
				<Badge
					color={`${row?.type?.id == 3 ? 'primary' : row?.type?.id == 2 ? 'success' : row?.type?.id == 1 ? 'danger' : 'primary'}`}
					pill
				>
					{row?.type?.name}
				</Badge>
			),
		},
		{
			...defaultFields,
			...defaultWidths,
			header: 'created_at',
			name: <div className="text-center">{t('Санал илгээсэн огноо')}</div>,
			selector: (row) => moment(row?.created_at).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			...defaultFields,
			header: 'file',
			name: <div className="text-center">{t('Хавсаргасан файл')}</div>,
			selector: (row) =>
				row?.file &&
					<>
						<a href={row?.file} className='me-1' target='_blank'>
							<Download type="button" color='#1a75ff' width={'15px'} />
						</a>
						{row?.file ? decodeURIComponent(row?.file.toString().split("/").pop()) : ''}
					</>,
			minWidth: '200px',
			maxWidth: '200px',
		},
		{
			name: <div className="text-center">{t("Үйлдэл")}</div>,
			center: true,
			selector: (row) =>
				<div className='text-center' style={{ width: 'auto' }} >
					<a
						id={`detail${row.id}`}
						onClick={
							() => handleDetailModal(row)}
					>
						<Badge color="light-info" pill><Book width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`detail${row.id}`}>{t('Дэлгэрэнгүй')}</UncontrolledTooltip>
				</div>,
			minWidth: '90px',
			maxWidth: '90px',
		},
	]

	return columns
}
