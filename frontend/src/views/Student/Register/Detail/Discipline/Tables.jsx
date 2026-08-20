
import React from 'react'
import { Table } from 'reactstrap'
import { Trash2 } from 'react-feather'
import useModal from '@hooks/useModal'
import css from '@mstyle/style.module.css'
import { t } from 'i18next'

const Tables = ({ datas, handleDelete, handleEdit, is_role }) => {
    const { showWarning } = useModal()

    return (
        <Table size='sm' responsive>
            <thead>
                <tr>
                    <th>#</th>
                    <th>{t('Он, сар, өдөр')}</th>
                    <th>{t('Сахилгын арга хэмжээ, шийтгэлийн төрөл')}</th>
                    <th>{t('Шалтгаан')}</th>
                    <th>{t('Шийдвэрийн дугаар')}</th>
                    <th>{t('Тайлбар')}</th>
                    {!is_role && <th>{t('Устгах')}</th>}
                </tr>
            </thead>
            <tbody>
                {datas && datas.map((data, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className={`${css.hrefHover}`}>
                            <a role='button' onClick={() => handleEdit(data)}>{data.date}</a>
                        </td>
                        <td>{data.type}</td>
                        <td>{data.reason}</td>
                        <td>{data.decision_no}</td>
                        <td>{data.note}</td>
                        {!is_role && (
                            <td>
                                <Trash2 type='button' color='red' width='15px'
                                    onClick={() => showWarning({
                                        question: t('Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?'),
                                        onClick: () => handleDelete(data.id),
                                        btnText: t('Устгах'),
                                    })}
                                />
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

export default Tables