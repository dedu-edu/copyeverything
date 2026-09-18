import { t } from 'i18next'
import { Edit, X } from 'react-feather'
import { Badge, Button, UncontrolledTooltip } from 'reactstrap'

import useLoader from '@hooks/useLoader'
import useModal from '@hooks/useModal'

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user, handleDetailModal) {
    const page_count = Math.ceil(total_count / rowsPerPage)

    const { showWarning } = useModal()

    const { Loader, isLoading } = useLoader({ isFullScreen: true })

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
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
            header: 'name',
            name: <div className='text-center w-100'>{t('Нэр')}</div>,
            selector: (row) => row?.name,
            sortable: true,
            minWidth: '80px',
            left: true
        },
        {
            header: 'students',
            name: t('Оюутан'),
            selector: (row) =>
                row?.student?.length > 0 ? (
                    <Button color='primary' size='sm' onClick={() => handleDetailModal(row, 'student')} disabled={row?.students?.length === 0}>
                        {t('Оюутан харах')}
                    </Button>
                ) : (
                    <Button color='secondary' size='sm' disabled>
                        {t('Оюутан байхгүй')}
                    </Button>
                ),
            minWidth: '80px',
            center: true
        },
        {
            header: 'created_user__username',
            name: t('Үүсгэсэн'),
            selector: (row) => row?.created_user_name,
            sortable: true,
            minWidth: '80px',
            center: true
        }
    ]

    if (Object.keys(user).length > 0) {
        var delete_column = {
            name: t('Үйлдэл'),
            width: '160px',
            center: true,
            selector: (row) => (
                <div className='text-center' style={{ width: 'auto' }}>
                    <a
                        role='button'
                        onClick={() => {
                            editModal(row?.id)
                        }}
                        id={`complaintListDatatableEdit${row?.id}`}
                        className='me-1'
                    >
                        <Badge color='light-secondary' pill>
                            <Edit width={'15px'} />
                        </Badge>
                    </a>
                    <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`}>
                        {t('Засах')}
                    </UncontrolledTooltip>
                    {isLoading && Loader}
                    {
                        <>
                            <a
                                role='button'
                                onClick={() =>
                                    showWarning({
                                        header: {
                                            title: t(`Түвшин бүлгийн мэдээлэл устгах`)
                                        },
                                        question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу? ${row?.name} түвшин бүлэг устахыг анхаарна уу!`),
                                        onClick: () => handleDelete(row?.id),
                                        btnText: t('Устгах')
                                    })
                                }
                                id={`complaintListDatatableCancel${row?.id}`}
                            >
                                <Badge color='light-danger' pill>
                                    <X width={'100px'} />
                                </Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`}>
                                {t('Устгах')}
                            </UncontrolledTooltip>
                        </>
                    }
                </div>
            )
        }
        columns.push(delete_column)
    }

    return columns
}
