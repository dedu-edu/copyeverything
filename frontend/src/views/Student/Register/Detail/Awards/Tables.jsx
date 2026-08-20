
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
                    <th>{t('Он')}</th>
                    <th>{t('Шагнал, урамшууллын нэр')}</th>
                    <th>{t('Олгосон байгууллага')}</th>
                    <th>{t('Үндэслэл, тайлбар')}</th>
                    {!is_role && <th>{t('Устгах')}</th>}
                </tr>
            </thead>
            <tbody>
                {datas && datas.map((data, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className={`${css.hrefHover}`}>
                            <a role='button' onClick={() => handleEdit(data)}>{data.year}</a>
                        </td>
                        <td>{data.name}</td>
                        <td>{data.organizer}</td>
                        <td>{data.description}</td>
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