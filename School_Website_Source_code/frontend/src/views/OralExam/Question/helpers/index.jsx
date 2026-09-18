import { t } from 'i18next'
import { Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap'

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count, handleNext) {
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
            name: `${t('Нэр')}`,
            selector: (row) => (
                <span title={row?.last_name}>
                    {row?.last_name + ' ' + row?.first_name} <span>{row?.code ? '/' + row?.code + '/' : ''}</span>
                </span>
            ),
            maxWidth: '300px',
            center: true,
            wrap: true
        },
        {
            name: `${t('И-мэйл')}`,
            selector: (row) => row?.email,
            maxWidth: '300px',
            center: true,
            wrap: true
        },
        {
            header: 'org_position',
            name: `${t('Албан тушаал')}`,
            selector: (row) => (
                <div style={{ overflow: 'auto', height: '50px', display: 'flex' }}>
                    <div style={{ margin: 'auto 0' }}>
                        <span title={row?.org_position_name}>
                            {row?.org_position_name}
                            {row?.rank_name ? ' ' + row?.rank_name : ''}
                        </span>
                    </div>
                </div>
            ),
            minWidth: '30px',
            center: true,
            wrap: true
        },
        {
            name: `${t('Тэнхим')}`,
            selector: (row) =>
                <div style={{ overflow: 'auto', height: '50px', display: 'flex' }}>
                    <div style={{ margin: 'auto 0' }}>
                        {row?.salbar?.name}
                    </div>,
                </div>,
            minWidth: '30px',
            center: true,
            wrap: true
        },
        {
            name: `${t('Асуулт үүсгэсэн хичээлүүд')}`,
            selector: (row) => (
                <div style={{ overflow: 'auto', height: '50px', display: 'flex' }}>
                    <div style={{ margin: 'auto 0' }}>
                        <span title={row?.lesson_names}>{row?.lesson_names}</span>
                    </div>
                </div>
            ),
            minWidth: '250px',
            left: true,
            wrap: true
        },
        {
            name: `${t('Хичээлүүд')}`,
            selector: (row) => (
                <div className='text-center' style={{ width: 'auto' }}>
                    {
                        <>
                            <a role='button' onClick={() => handleNext(row)} id={`updateSchool${row?.id}`}>
                                <Badge color='light-primary' pill>
                                    <Edit width={'100px'} />
                                </Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`}>
                                {t('Хичээлүүд харах')}
                            </UncontrolledTooltip>
                        </>
                    }
                </div>
            ),
            minWidth: '200px',
            maxWidth: '200px',
            center: true
        }
    ]
    return columns
}
