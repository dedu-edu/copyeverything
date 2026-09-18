import { useContext } from 'react'
import { useTranslation } from "react-i18next"
import { Badge, Button, Col, Row, Table } from "reactstrap"
import { useNavigate } from 'react-router-dom';
import AuthContext from '@src/utility/context/AuthContext'

export default function CustomTable({
	rows,
	currentPage = 1,
	totalCount = 1,
	rowsPerPage = 1,
	extraData,
	closeCancelPermission,
	is_approve
}) {
	if (!rows) return <></>
	const { name: schoolName, id: schoolId, is_any_approve_type: isAnyApproveType } = extraData ?? {}
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { user } = useContext(AuthContext)

	// #region styles
	const allCenterStyle = {
		textAlign: 'center',
		verticalAlign: 'middle',
	}

	const allCenterHeaderBody = {
		header: { style: allCenterStyle },
		body: { style: allCenterStyle },
	}

	const allStyles = {
		...allCenterHeaderBody,
		header: {
			style: {
				...allCenterHeaderBody.header.style,
				minWidth: '130px',
				padding: '4px 8px',
			}
		}
	}
	// #endregion

	// pagination
	const pageCount = Math.ceil(totalCount / rowsPerPage)
	if (currentPage > pageCount) currentPage = 1

	// 2 floor of columns
	const columnFloor2 = {
		...allCenterHeaderBody,
		selector: () =>
			<Row>
				<Col className="text-start">
					{schoolName}
				</Col>
				<Col className="text-end">
					<Button
						size="sm"
						color={extraData?.is_open ? 'primary' : 'warning'}
						onClick={() => showWarning({
							header: {
								title: `${t('Хүсэлт буцаах эрх')}`,
							},
							question: `Та  итгэлтэй байна уу?`,
							onClick: () => closeCancelPermission(schoolId, extraData?.is_open),
							btnText: extraData?.is_open ? "Хаах" : 'Нээх',
						})}
						disabled={is_approve}
					>
						{extraData?.is_open ? t('ТЭ-ийн Хүсэлт буцаах эрхийг хаах') : t('ТЭ-ийн Хүсэлт буцаах эрхийг нээх') }
					</Button>
				</Col>
			</Row>,
	}

	// 1 floor of columns
	const columns1 = [
		{
			...allStyles,
			body: { style: {} },
			name: t('Тэнхим'),
			selector: (row, index) => <div className='d-flex justify-content-between'>
				{(currentPage - 1) * rowsPerPage + index + 1}. {' '}
				{(user?.permissions?.includes('lms-science-control-read'))
				?
					<Button
						size="sm"
						color='primary'
						type='submit'
  						style={{ width: '180px'}}
						onClick={() => navigate(`/research/b-estimate/`, { state: {'depId': row?.department?.id, 'schoolId': row?.school_id}})}
						outline
						>
						{row?.department?.name}
					</Button>
				:
					row?.department?.name
			}</div>,
		},
		{
			...allStyles,
			name: t('Тэнхимийн багшийн тоо'),
			selector: (row, index) => row.teacher_count,
		},
		{
			...allStyles,
			name: t('Файл оруулаагүй багшийн тоо'),
			selector: (row, index) => (
				<>
				{
					row.no_file_teacher_count == 0
					?
					<div className="bg-success py-50"></div>
					:
					<div>{row.no_file_teacher_count}</div>
				}
				</>
			),
		},
		{
			...allStyles,
			name: t('Хүсэлт илгээгээгүй багшийн тоо'),
			selector: (row, index) => (
				<>
				{
					row.no_score_sent_count == 0
					?
					<div className="bg-success py-50"></div>
					:
					<div>{row.no_score_sent_count}</div>
				}
				</>
			)
		},
		{
			...allStyles,
			name: t('Тэнхимийн эрхлэгч хүсэлтээ илгээсэн эсэх'),
			selector: (row, index) =>
				row.no_score_department_sent_count
					?
					<Badge color="light-danger" pill>
						{t('Үгүй')}
					</Badge>
					:
					<Badge color="light-success" pill>
						{t('Тийм')}
					</Badge>,
		},
		{
			...allStyles,
			name: t('ШУТГ шалгасан эсэх'),
			selector: (row, index) =>
				row.is_checked == 1
					?
					<Badge color="light-danger" pill>
						{t('Үгүй')}
					</Badge>
					:
					row.is_checked == 2
					?
					<Badge color="light-success" pill>
						{t('Тийм')}
					</Badge>
					:
					<Badge color="light-warning" pill>
						{t('Дутуу')}
					</Badge>
		},
		{
			...allStyles,
			name: t('ТЭ-ийн хүсэлт буцаах'),
			selector: (row, index) => (
				!row?.no_score_department_sent_count
				&&
				<Button
					size="sm"
					color='primary'
					onClick={() =>
						showWarning({
							header: {
								title: `${t('Тэнхимийн ирүүлсэн хүсэлтийг буцаах эрх')}`,
							},
							question: `Та ${row?.department?.name} тэнхимийн ирүүлсэн хүсэлтийг буцаахдаа итгэлтэй байна уу?`,
							onClick: () => closeCancelPermission(row?.department?.id, extraData?.is_open, 'department')
							,
							btnText: 'Хүсэлт буцаах',
						})
					}
					disabled={is_approve}
				>Хүсэлт буцаах</Button>
			)
		},
	]

	return (
		<Table size="sm" bordered responsive striped>
			<thead>
				<tr>
					<th style={columnFloor2?.header?.style} colSpan={columns1.length}>
						{columnFloor2.selector()}
					</th>
				</tr>
				<tr>
					{columns1.map((col, colIndex) =>
						<th key={colIndex} style={col?.header?.style}>
							{col.name}
						</th>
					)}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, rowIndex) =>
					<tr key={rowIndex}>
						{columns1.map((col, colIndex) =>
							<td key={colIndex} style={col?.body?.style}>
								{col.selector(row, rowIndex)}
							</td>
						)}
					</tr>
				)}
			</tbody>
		</Table>
	)
}
