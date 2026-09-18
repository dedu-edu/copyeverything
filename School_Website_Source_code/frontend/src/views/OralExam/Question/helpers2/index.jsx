import { t } from 'i18next'
import { FileText } from 'react-feather'
import { UncontrolledTooltip } from 'reactstrap'

// Хүснэгтийн баганууд
export function getColumnsLesson(currentPage, rowsPerPage, total_count, handleDetail, teacherId) {
    const page_count = Math.ceil(total_count / rowsPerPage)
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: '№',
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: '30px',
            center: true
        },
        {
            name: `${t('Хичээлийн нэр')}`,
            selector: (row) =>
                <div style={{ overflow: 'auto', height: '50px', display: 'flex' }}>
                    <div style={{ margin: 'auto 0' }}>
                        <span title={row?.lesson_name}>{row?.lesson_code} {row?.lesson_name}</span>
                    </div>,
                </div>,
            maxWidth: '300px',
            center: true,
            wrap: true
        },
        {
            name: `${t('Багц асуултын сэдэв')}`,
            selector: (row) => {
                return teacherId === row.created_by ? (
                    <span title={row?.name}>{row?.name}</span>
                ) : (
                    <span title={row?.name}>{`${row?.name} (${row.created_by_last_name.charAt(0).toUpperCase()}. ${row.created_by_first_name})`}</span>
                )
            },
            maxWidth: '300px',
            center: true
        },
        {
            name: `${t('Нийт асуултын тоо')}`,
            selector: (row) => row?.question_count || 0,
            maxWidth: '300px',
            center: true
        },
        {
            name: `${t('Асуултууд')}`,

            selector: (row) => (
                <div className='text-center' style={{ width: 'auto' }}>
                    {
                        <>
                            <FileText
                                id={`questionDetail${row.id}`}
                                className='text-primary me-50 cursor-pointer'
                                onClick={() => {
                                    handleDetail(row.id, row.lesson_code + ' ' + row.lesson_name, row.lesson_id)
                                }}
                                size={14}
                            />
                            <UncontrolledTooltip placement='top' target={`questionDetail${row.id}`}>
                                Асуултууд{' '}
                            </UncontrolledTooltip>
                        </>
                    }
                </div>
            ),
            center: true
        }
    ]
    return columns
}
