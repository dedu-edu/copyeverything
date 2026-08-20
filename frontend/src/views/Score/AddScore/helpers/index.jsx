import { useContext } from 'react'
import { UncontrolledTooltip, Badge } from 'reactstrap'
import { Edit} from 'react-feather'
import { t } from 'i18next'

import AuthContext from "@context/AuthContext"
import { fixDatetimeFormat } from '@src/utility/Utils'
import { Grow } from '@mui/material'

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, handleEditModal) {

	const { user } = useContext(AuthContext)

	const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'student',
			name: `${t('Оюутан')}`,
			selector: (row) => {
				return <span title={`${row?.student_code} ${row?.student_name}`}>{`${row?.student_code} ${row?.student_name}`}</span>
			},
			sortable: true,
			minWidth: "150px",
			left: true,
			wrap: true
		},
		{
			header: 'lesson',
			name: `${t('Хичээл')}`,
			selector: (row) => (<span title={row?.lesson?.name + '  ' + row?.lesson?.code}>{row?.lesson?.name + '  ' + row?.lesson?.code}</span>),
			sortable: true,
			minWidth: "200px",
			left: true,
			wrap: true
		},
		{
			header: 'add_score',
			name: `${t('Оноо')}`,
			selector: (row) => (row?.add_score),
			wrap: true,
			center: true
		},
		{
			header: 'lesson_year',
			name: `${t('Хичээлийн жил')}`,
			selector: (row) => row?.lesson_year,
		},
		{
			header: 'lesson_season',
			name: `${t('Улирал')}`,
			selector: (row) => (row?.season_name),
		},
		{
			header: 'description',
			name: `${t('Тайлбар')}`,
			cell: (row) => (
				<>
					<div
						id={`descCell${row?.id}`}
						style={{
						overflow: "hidden",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
						width: "500px",
						cursor: "pointer"
						}}
					>
						{row?.description}
					</div>
					{row?.description && (
						<UncontrolledTooltip
							placement='top'
							target={`descCell${row?.id}`}
							style={{ maxWidth: '400px' }}
						>
							{row?.description}
						</UncontrolledTooltip>
					)}
				</>
			),
			wrap: false,
			left: true,
			minWidth: '500px',
		},
		{
			header: 'created_at',
			name: `${t('Огноо')}`,
			selector: (row) => fixDatetimeFormat(row?.created_at, true),
			wrap: true,
			center: true
		},
		{
			header: 'createuser_name',
			name: `${t('Үүсгэсэн хэрэглэгч')}`,
			selector: (row) => (row?.createuser_name),
			left: true,
			minWidth:'150px'

		},
	]
	if (Object.keys(user).length > 0 && user.permissions.includes('lms-arga-zuich-score-update')) {
		var add_column = {
			name: t("Үйлдэл"),
			width: "100px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => handleEditModal(row?.id)}
						id={`complaintListDatatableEdit${row?.id}`}>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row?.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}
		columns.push(add_column)
	}

	return columns
}
