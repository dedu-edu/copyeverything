import { Badge, UncontrolledTooltip } from 'reactstrap';
import { Edit, User } from 'react-feather';
import { useTranslation } from "react-i18next";

export function getColumns(currentPage, rowsPerPage, total_count, editModal) {
	const { t } = useTranslation()
  	const page_count = Math.ceil(total_count / rowsPerPage);
  	if (currentPage > page_count) currentPage = 1;

	const columns = [
		{
		name: "№",
		selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
		maxWidth: "60px",
		center: true
		},
		{
		name: `${t('Овог нэр')}`,
		selector: (row) => (
			<a
				role="button"
				onClick={() => editModal(row.id)}
				id={`editUser${row?.id}`}
				className="me-2"
			>
				<Badge color="light-secondary" pill>
					{row?.full_name || `${row?.last_name?.[0]}.${row?.first_name}`}
				</Badge>
			</a>
			),
		sortable: true,
		minWidth: "180px",
		center: true
		},
		{
		name: `${t('Албан тушаал')}`,
		selector: (row) => row?.org_position,
		sortable: true,
		minWidth: "220px",
		wrap: true,
		center: true
		},
		{
		name: `${t('Тэнхим / Салбар')}`,
		selector: (row) => row?.salbar_name,
		sortable: true,
		minWidth: "250px",
		wrap: true,
		center: true
		},
		{
		name: `${t('Сургууль')}`,
		selector: (row) => row?.school_name,
		sortable: true,
		minWidth: "250px",
		wrap: true,
		center: true
		},
		{
		name: `${t('Баталгаажсан эсэх')}`,
		selector: (row) => (
			<Badge color={row?.is_approve ? 'success' : 'warning'}>
			{row?.is_approve ? 'Батлагдсан' : 'Хүлээгдэж байна'}
			</Badge>
		),
		center: true,
		minWidth: "170px"
		},
	];

  return columns;
}
