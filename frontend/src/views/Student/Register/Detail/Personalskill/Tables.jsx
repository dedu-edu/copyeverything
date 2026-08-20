
import React from 'react'
import { Table } from 'reactstrap'
import { Trash2 } from 'react-feather'
import useModal from '@hooks/useModal'
import css from '@mstyle/style.module.css'
import { t } from 'i18next'

const Tables = ({ datas, handleDelete, handleEdit, is_role, levelOptions }) => {
    const { showWarning } = useModal()

    const getLevelLabel = (level) => levelOptions.find(o => o.value === level)?.label || level

    return (
        <Table size='sm' responsive>
            <thead>
                <tr>
                    <th>#</th>
                    <th>{t('Ур чадвар, зан байдал')}</th>
                    <th>{t('Үнэлгээ')}</th>
                    <th>{t('Тайлбар')}</th>
                    {!is_role && <th>{t('Устгах')}</th>}
                </tr>
            </thead>
            <tbody>
                {datas && datas.map((data, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className={`${css.hrefHover}`}>
                            <a role='button' onClick={() => handleEdit(data)}>{data.skill_name}</a>
                        </td>
                        <td>{getLevelLabel(data.level)}</td>
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