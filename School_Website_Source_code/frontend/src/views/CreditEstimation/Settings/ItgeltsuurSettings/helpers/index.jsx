import { Edit } from "react-feather";

import { t } from "i18next";


import { Badge, UncontrolledTooltip } from "reactstrap";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, school_id) {

    const page_count = Math.ceil(datas.length / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

	const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${t('Нэр')}`,
            cell: (row) => row?.name,
			center: true,
			maxWidth: "360px"
		},
		{
			name: `${t('Хичээлийн төрөл')}`,
            cell: (row) => row?.lesson_type,
			center: true,
			maxWidth: "360px"
		},
		{
			name: `${t('Зэрэг')}`,
            cell: (row) => row?.degree_type,
			center: true,
			maxWidth: "360px"
		},
		{
			name: `${t('багц цагийг суралцагчийн тоо')}`,
			selector: (row) => row?.student_type,
			center: true,
			maxWidth: "750px"
		},
		{
			name: `${t('итгэлцүүр')}`,
			selector: (row) => row?.itgeltsuur,
			center: true,
			maxWidth: "750px"
		},
		{
			name: `${t('Суралтын хөтөлбөрийн дагуу')}`,
			selector: (row) => row?.hutul_student_type,
			center: true,
			maxWidth: "750px"
		},
		{
			name: `${t('Суралцах хэлбэр')}`,
			selector: (row) => row?.day_type,
			center: true,
			maxWidth: "750px"
		},
	]

	var UpdateColumn =  {
		name: `${t('Үйлдэл')}`,
		minWidth: "160px",
		maxWidth: "150px",
		center: true,
		selector: (row) => {

			return (

				<div className="text-center" style={{ width: "auto" }}>
					{
					<a  role="button"
						className="me-1"
						id = {`LearningUpdate${row?.id}`}
						disabled={school_id}
						onClick={() => handleUpdateModal(row?.id)}
						style={{
							cursor: school_id ? 'pointer' : 'not-allowed',
							opacity: school_id ? 1 : 0.5
						}}
						>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					}
					<UncontrolledTooltip placement='top' target={`LearningUpdate${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			)
		},
	}

	columns.push(UpdateColumn)
    return columns

}
