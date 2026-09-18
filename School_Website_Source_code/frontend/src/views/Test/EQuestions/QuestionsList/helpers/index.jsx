import { FileText, Trash } from 'react-feather'
import {  UncontrolledTooltip } from 'reactstrap';
import useModal from '@hooks/useModal';
import { get_questionype, get_leveltype, get_levelseasons } from "@utils"
import PopoverCell from '@src/components/CPopoverCell';

export function getColumns(currentPage, rowsPerPage, total_count, handleDelete, handleQuestionEdit, season) {

	const questionLevel= season == true ? get_leveltype() : get_levelseasons()
	const questionType= get_questionype()

	const page_count = Math.ceil(total_count / rowsPerPage)
	const { showWarning } = useModal()
	if (currentPage > page_count) {
		currentPage = 1
	}

	const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			center: true,
			width: "5%",
		},
		{
			name: "Асуулт",
			selector: (row) => {
				return <PopoverCell value={row?.question} />
			},
			wrap: true,
			left: true,
			width: '55%'
		},
		{
			name: "Оноо",
			selector: (row) => row?.score,
			wrap: true,
			center: true,
			// width: "50px",

		},
		{
			name: `${'Түвшин'}`,
			selector: (row) =><>
				{questionLevel.find(v=>v.id == row.level)?.name}
				</>,
			wrap: true,
			center: true,
		},
		{
			name: `${'Төрөл'}`,
			selector: (row) => <div>
				{questionType?.find(v=> v.id == row.kind)?.name}
			</div>,
			wrap: true,
			left: true,
		},
		{
			name: `${'Үйлдэл'}`,
			selector: (row) => <div className='d-flex'>
				<FileText id={`questionDetail${row.id}`} className='text-primary me-50 cursor-pointer' onClick={() => {
					handleQuestionEdit(row)
				}} size={14} />
				<UncontrolledTooltip placement='top' target={`questionDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>

				<Trash id={`questionDelete${row.id}`} className='text-danger cursor-pointer' onClick={() => {
					showWarning({
						header: {
							title: `Та энэ асуултыг устгахдаа итгэлтэй байна уу ?`,
						},
						question: row.question,
						onClick: () => handleDelete(row?.id),
						btnText: 'Устгах',
					})
				}} size={14} />
				<UncontrolledTooltip placement='top' target={`questionDelete${row.id}`} >Устгах</UncontrolledTooltip>
			</div>,
			wrap: true,
			center: true,
		},
	]
	return columns
}


export const customStyles = {
	header: {
		style: {
		},
	},
	headRow: {
		style: {
			color: "#6e6b7b",
			fontWeight: "500",
			backgroundColor: "#f3f2f7"
		},
	},
	headCells: {
		style: {
			paddingLeft: '8px',
			paddingRight: '8px',
			whiteSpace: "none",
		},
	},
	rows: {
		style: {
			color: "#6e6b7b"
		},
	},
	cells: {
		style: {
			paddingLeft: '0px',
			paddingRight: '0px',
		},
	},
};