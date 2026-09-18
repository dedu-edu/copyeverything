import { t } from 'i18next'

import useModal from "@hooks/useModal"
import AuthContext from "@context/AuthContext"
import { useContext } from 'react'

import { X, Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap'
import { formatDate } from '@src/utility/Utils'

export function getColumns (currentPage, rowsPerPage, total_count, handleDelete, handleUpdateModal) {
    const page_count = Math.ceil(total_count / rowsPerPage)
    const { showWarning } = useModal()
    const { user } = useContext(AuthContext)

    if (currentPage > page_count) {
        currentPage =1
    }

    const columns = [
            {
                name: "№",
                selector: (row, index) => (currentPage-1) * rowsPerPage + 1 + index,
                maxWidth: "30px",
                center: "true"
            },
            {
                sortField: "limit",
                name: `${t('Хүсэлт илгээж болох клубийн лимит')}`,
                selector: (row) => row?.limit,
                minWidth: "110px",
                center: true,
            },
            {
                sortField: "start_date",
                name: `${t('Бүртгэл эхлэх өдөр')}`,
                selector: (row) => formatDate(row?.start_date, 'YYYY-MM-DD HH:mm'),
                minWidth: "220px",
                maxWidth: "220px",
                center: true,
            },
            {
                sortField: "finish_date",
                name: `${t('Бүртгэл дуусах өдөр')}`,
                selector: (row) => formatDate(row?.finish_date, 'YYYY-MM-DD HH:mm'),
                minWidth: "220px",
                maxWidth: "220px",
                center: true,
            },
            {
                sortField: "lesson_year",
                name: `${t('Хичээлийн жил')}`,
                selector: (row) => row?.lesson_year,
                minWidth: "220px",
                center: true,
            },
            {
                sortField: "lesson_season",
                name: `${t('Улирал')}`,
                selector: (row) => row?.season_name,
                minWidth: "220px",
                center: true,
            },
            {
                sortField: "is_active",
                name: `${t('Идэвхтэй эсэх')}`,
                selector: (row) => (
                    <Badge
                        color={`${row?.is_active ? 'success' : 'primary'}`}
                        pill
                    >
                        {row?.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </Badge>
                ),
                minWidth: "220px",
                center: true,
            },
        ]
        if(Object.keys(user).length > 0) {
            var delete_column = {
                name: t("Үйлдэл"),
                maxWidth: "150px",
                minWidth: "100px",
                center: true,
                selector: (row) => (
                    <div className="text-center" style={{ width: "auto" }}>
                        {
                            user.permissions.includes('lms-dormitory-paymentconfig-delete') &&
                            <>
                                <a
                                    id={`roleUpdate${row?.id}`}
                                    className='me-50'
                                    role="button"
                                    onClick={() => handleUpdateModal(row?.id)}
                                >
                                    <Badge color="light-secondary" pill><Edit width={"100px"} /></Badge>
                                </a>
                                <UncontrolledTooltip placement='top' target={`roleUpdate${row?.id}`}>Засах</UncontrolledTooltip>
                                <a role="button"
                                    onClick={() => showWarning({
                                        header: {
                                            title: `${t('Устгах')}`,
                                        },
                                        question: `${t(`Та устгахдаа итгэлтэй байна уу?`)}`,
                                        onClick: () => handleDelete(row.id),
                                        btnText: 'Устгах',
                                    })}
                                    id={`complaintListDatatableCancel${row?.id}`}
                                >
                                    <Badge color="light-danger" className='p-50' pill><X width={"100px"} /></Badge>
                                </a>
                                <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
                            </>
                        }
                    </div>
                ),
            }
            columns.push(delete_column)
        }
    return columns
}
