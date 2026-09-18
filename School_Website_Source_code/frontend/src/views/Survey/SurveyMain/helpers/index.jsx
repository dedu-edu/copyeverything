import { Edit, Eye, X } from "react-feather";

import { Badge, UncontrolledTooltip } from "reactstrap";

import useModal from '@hooks/useModal'

import { t } from 'i18next'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleEdit, handleDelete, handleSend,  user) {

	const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

	// Ерөнхий судалгаа/"Багш-хичээл" судалгаа
    const SOUL_TYPE_GENERAL = 1

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
		},
		{
			name: <div className="text-center" style={{width: '350px'}}>{t("Судалгааны нэр")}</div>,
			selector: (row) => (row?.title),
			left: true,
			width: '350px'
		},
		{
			name: <div className="text-center">{t("Судалгааны төрөл")}</div>,
			selector: (row) => <div className="text-center" style={{ overflow: 'auto', maxHeight: '53px' }}>{row?.is_soul ? (row?.soul_type === SOUL_TYPE_GENERAL ? t('Ерөнхий сэтгэл ханамжийн') : t('"Багш-хичээл" сэтгэл ханамжийн')) : t('Энгийн')}</div>,
			center: true,
			wrap: true,
		},
		{
			name: <div className="text-center">{t("Хамрах хүрээ")}</div>,
			selector: (row) => <div className="text-center">{row?.scope_kind?.name}</div>,
			center: true,
			wrap: true
		},
		{
			header: 'start_date',
			name: t("Эхлэх хугацаа"),
			selector: (row) => row?.start_date,
            center: true,
			width: '200px'
		},
		{
			header: 'finish_date',
			name: t("Дуусах хугацаа"),
			selector: (row) => row?.end_date,
			center: true,
			width: '200px'
		},
		{
			name: <div className="text-center">{t("Үүсгэсэн хэрэглэгч")}</div>,
			selector: (row) => row?.created_by,
			center: true,
		},
	]

	if(Object.keys(user).length > 0) {
		columns.push(
        	{
				name: t("Үйлдэл"),
				maxWidth: "180px",
				minWidth: "180px",
				center: true,
				selector: (row) => (
					<div className="text-center" style={{ width: "auto" }}>
						<a
							id={`complaintListDatatableDetail${row.id}`}
							onClick = {
								() => {handleSend(row)}}
							>
							<Badge color="light-info" className="p-50" pill><Eye width={"15px"} /></Badge>
						</a>
                    	<UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`}>Загвар харах</UncontrolledTooltip>
						{
							user?.permissions?.includes('lms-survey-question-update') &&
							<>
								<a
									id={`roleUpdate${row?.id}`}
									role="button"
									onClick={() => handleEdit(row)}
								>
									<Badge color="light-secondary" pill><Edit width={"100px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`roleUpdate${row?.id}`}>{t('Засах')}</UncontrolledTooltip>
							</>
						}
						{
							user?.permissions?.includes('lms-survey-question-delete') &&
							<>
								<a role="button"
									onClick={() => showWarning({
										header: {
											title: t(`Судалгаа устгах`),
										},
										question: t(`Та энэ судалгааг устгахдаа итгэлтэй байна уу?`),
										btnText: t('Устгах'),
										onClick: () => handleDelete(row.id),
									})}
									id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" className="ms-50 p-50" pill><X width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
							</>
						}
					</div>
				),
			}
		)
	}

    return columns

}

export async function getPaginatedDataById({
	fetchData,
	get,
	limit,
	page,
	id,
	setDatas,
	setTotalCount
}) {
	if (!get) return
	const { success, data } = await fetchData(get({ limit: limit, page: page }, id))

	if (success) {
		setDatas(data?.results ?? [])
		setTotalCount(data?.count ?? 0)
	}
}

export async function getDataById({
	fetchData,
	get,
	id,
	setDatas,
}) {
	if (!get) return
	const { success, data } = await fetchData(get(id))
	if (success) setDatas(data ?? {})
}
