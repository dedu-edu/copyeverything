import { useContext } from 'react';
import { UncontrolledTooltip, Badge } from 'reactstrap';
import { Eye } from 'react-feather';
import { t } from 'i18next';
import useModal from '@hooks/useModal';

import AuthContext from '@context/AuthContext';
import { FaUndo } from 'react-icons/fa';
import CTruncateText from '@src/components/atoms/CTruncateText';

// Хүснэгтийн баганууд
export function getColumns(
    currentPage,
    rowsPerPage,
    total_count,
    group,
    handleDetailModal,
    handleDeleteModal,
) {
    const { user } = useContext(AuthContext);
    const { showWarning } = useModal();

    const page_count = Math.ceil(total_count / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: '№',
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: '30px',
            center: true,
        },
        {
            header: 'lesson',
            name: `${t('Хичээл')}`,
            cell: (row) => {
                let lesson_name = `${row?.lesson?.full_name}`
                return <CTruncateText text={lesson_name} />
            },
            sortable: true,
            minWidth: '200px',
            left: true,
            wrap: true,
        },
        {
            header: 'group',
            name: `${t('Ангийн нэр')}`,
			cell: (row) => {
                let group_name = row?.group?.name
                return <CTruncateText text={group_name} />
            },
            sortable: true,
            wrap: true,
            left: true,
        },
        {
            header: 'student',
            name: `${t('Багшийн нэр')}`,
            cell: (row) => {
                return <CTruncateText text={row?.teacher_names} />
            },
            sortable: true,
            left: true,
            minWidth: '200px',
        },
        {
            header: 'is_confirm_teacher',
            name: `${t('Багш баталгаажуулсан эсэх')}`,
            selector: (row) =>
                row?.is_confirm_teacher ? (
                    <span style={{ color: 'green' }}>{t('Баталгаажсан')}</span>
                ) : (
                    <span style={{ color: 'red' }}>{t('Баталгаажаагүй')}</span>
                ),
            sortable: true,
            wrap: true,
            center: true,
        },
        {
            header: 'confirm_date_teacher',
            name: `${t('Багш баталгаажуулсан огноо')}`,
            selector: (row) => row?.confirm_date_teacher,
            sortable: true,
            wrap: true,
            center: true,
        },
        {
            header: 'date',
            name: `${t('Дүн баталгаажуулсан эсэх')}`,
            selector: (row) =>
                row?.is_approved ? (
                    <span style={{ color: 'green' }}>{t('Баталгаажсан')}</span>
                ) : (
                    <span style={{ color: 'red' }}>{t('Баталгаажаагүй')}</span>
                ),
            sortable: true,
            wrap: true,
            center: true,
        },
        {
            header: 'approved_date',
            name: `${t('Дүн баталгаажуулсан огноо')}`,
            selector: (row) => row?.approved_date,
            sortable: true,
            wrap: true,
            center: true,
        },
    ];
    if (Object.keys(user).length > 0) {
        var delete_column = {
            name: t('Үйлдэл'),
            width: '200px',
            center: true,
            selector: (row) => {
                const group_name = row?.group?.name || ""

                return(
                    <div className="text-center" style={{ width: 'auto' }}>
                        <a
                            role="button"
                            onClick={() => {
                                handleDetailModal(row);
                            }}
                            id={`complaintListDatatableEdit${row?.id}`}
                            className="me-1"
                        >
                            <Badge color="light-success" pill>
                                <Eye width={'15px'} />
                            </Badge>
                        </a>
                        <UncontrolledTooltip
                            placement="top"
                            target={`complaintListDatatableEdit${row?.id}`}
                        >
                            Дэлгэрэнгүй
                        </UncontrolledTooltip>
                        {row?.is_approved && (
                            <>
                                <a
                                    role="button"
                                    onClick={() =>
                                        showWarning({
                                            header: {
                                                title: `${t('Баталгаажуулсан дүн устгах')}`,
                                            },
                                            question: `Та "${group_name || ''}" ангийн "${row?.lesson?.full_name}" хичээлийн баталгаажуулсан дүнг буцаахдаа итгэлтэй байна уу?`,
                                            onClick: () => handleDeleteModal(row),
                                            btnText: 'Буцаах',
                                        })
                                    }
                                    id={`Undo${row?.id}`}
                                    className="me-1"
                                >
                                    <Badge color="light-danger" pill>
                                        <FaUndo width={'15px'} />
                                    </Badge>
                                </a>
                                <UncontrolledTooltip
                                    placement="auto"
                                    target={`Undo${row?.id}`}
                                >
                                    Баталгаажуулсан дүн устгах
                                </UncontrolledTooltip>
                            </>
                        )}
                    </div>
                )
            }
        };
        columns.push(delete_column);
    }

    return columns;
}
