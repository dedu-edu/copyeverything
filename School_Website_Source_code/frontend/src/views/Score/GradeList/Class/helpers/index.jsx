import CTruncateText from '@src/components/atoms/CTruncateText';
import { t } from 'i18next';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count) {

	const page_count = Math.ceil(total_count / rowsPerPage)


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
			header: 'student__first_name',
			name: `${t('Оюутны код')}`,
			selector: (row)=> {
				const student_name = `${row?.student?.code} ${row?.student?.last_name} ${row?.student?.first_name}`
				return <span title={student_name}>{student_name}</span>
			},
			left: true,
            sortable: true,
			minWidth: "250px",
			wrap: true
		},
		{
			header: 'student__group__name',
			name: `${t('Анги')}`,
			selector: (row) => <CTruncateText text={row?.student?.group?.name || ''} />,
			sortable: true,
			minWidth: "150px",
			maxidth: "200px",
			center: true,
			wrap: true
		},
		{
			header: 'lesson__name',
			name: t('Хичээлийн нэр'),
			selector: (row) =>  {
				const lesson_name = `${row?.lesson?.code} ${row?.lesson?.name}`
				return <CTruncateText text={lesson_name} />
			},
			minWidth: "250px",
			sortable: true,
			left: true,
			wrap: true
		},
		{
			header: 'teacher__first_name',
			name: `${t('Багшийн нэр')}`,
			selector: (row) => row?.teacher?.full_name,
            sortable: true,
			minWidth: "150px",
			left: true,
			wrap: true

        },
		{
			header: 'teach_score',
			name: `${t('Багшийн оноо')}`,
			selector: (row) => row?.teach_score,
            sortable: true,
			minWidth: "150px",
			center: true
        },
		{
			header: 'exam_score',
			name: `${t('Шалгалтын оноо')}`,
			selector: (row) => row?.exam_score,
            sortable: true,
			minWidth: "150px",
			center: true
        },
		{
			header: 'add_score',
			name: `${t('Нэмэлт оноо')}`,
			selector: (row) => row?.add_score,
            sortable: true,
			minWidth: "100px",
			center: true
        },
		{
			header: 'lesson_year',
			name: `${t('Хичээлийн жил')}`,
			selector: (row) => row?.lesson_year,
            sortable: true,
			minWidth: "180px",
			center: true
        },
		{
			header: 'lesson_season',
			name: `${t('Улирал')}`,
			selector: (row) => row?.lesson_season?.season_name,
            sortable: true,
			minWidth: "50px",
			center: true
        },
		{
			header: 'total',
			name: 'Нийт оноо үнэлгээ',
			selector: (row) => {
				const unelgee = row?.grade_letter_desc ? row?.grade_letter_desc : (row?.score_total + ' ' + row?.assessment)
				return(
					<CTruncateText text={unelgee} />
				)
			},
			center: true,
			maxWidth: '150px'
		},
	]

    return columns

}
