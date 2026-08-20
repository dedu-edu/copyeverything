import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, Modal, ModalBody, ModalHeader, Table } from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { get_day, get_time } from '@src/utility/Utils'

import { irtsStates } from '..'
import styles from './styles.module.css'

export default function ParModal({ open, handleModal, cellData = {} }) {
    // Simple variables
    const days = get_day()
    const pars = get_time()

    // other hooks
    const { t } = useTranslation()
    const [datas, setDatas] = useState([])
    const { isLoading, Loader, fetchData } = useLoader({})
    const digitalJournalApi = useApi().digitalJournal

    // API calls
    async function getDatas() {
        if (!cellData.studentId || !cellData.lessonId || !cellData.week) return
        const { success, data } = await fetchData(digitalJournalApi.getPar(cellData.studentId, cellData.lessonId, cellData.week))
        if (success) setDatas(data)
    }

    // useEffects
    useEffect(() => {
        getDatas()
    }, [cellData])

    return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className='modal-dialog-centered modal-lg' contentClassName='pt-0'>
                <ModalHeader tag='h4' className='bg-transparent pb-0' toggle={handleModal}>
                    {t('Долоо хоног')}
                </ModalHeader>
                <hr />
                <ModalBody className='px-sm-3 pt-30 pb-3'>
                    {isLoading && Loader}
                    <Table bordered responsive className={`mt-1 ${styles.digitalJournalTable}`}>
                        <thead>
                            <tr>
                                <th rowSpan={2}>{t('Пар')}</th>
                                <th colSpan={days.length}>{t('Өдөр')}</th>
                            </tr>
                            <tr>
                                {days.map((daysV, daysI) => {
                                    return <th key={daysI}>{daysV.name}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {pars.map((parsV, parsI) => {
                                return (
                                    <tr key={parsI}>
                                        <td>
                                            <div style={{ fontWeight: 900 }}>{t(parsV.name)}</div>
                                        </td>
                                        {days.map((daysV, daysI) => {
                                            const irts = datas[parsV.id]?.[daysV.id]
                                            let irtsStatesV = null
                                            if (irts) irtsStatesV = irtsStates.find((item) => item.id === irts)

                                            return (
                                                <td key={daysI}>
                                                    {irtsStatesV ? (
                                                        <Badge color={irtsStatesV.color} className='m-25'>
                                                            {irtsStatesV.name}
                                                        </Badge>
                                                    ) : null}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
