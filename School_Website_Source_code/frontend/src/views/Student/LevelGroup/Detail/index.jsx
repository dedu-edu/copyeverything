import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

import useApi from '@src/utility/hooks/useApi'
import useLoader from '@src/utility/hooks/useLoader'

const DetailModal = ({ open, handleModal, data, scope = 'student' }) => {
    const { t } = useTranslation()
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })
    const levelGroupApi = useApi().student.levelGroup
    const [datas, setDatas] = useState({})

    const totalCount = datas[scope] ? datas[scope].length : 0

    async function getDatas() {
        if (!data?.id) return
        const response = await fetchData(levelGroupApi.getOne(data.id))
        if (response.success) setDatas(response.data)
    }

    useEffect(() => {
        getDatas()
    }, [data?.id])

    return (
        <Modal isOpen={open} toggle={handleModal} centered className='modal-dialog-centered'>
            <ModalHeader toggle={handleModal}>{t('Дэлгэрэнгүй')}</ModalHeader>
            <ModalBody style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {isLoading && Loader}
                {datas[scope] && totalCount > 0 ? (
                    <ListGroup>
                        {datas[scope].map((item, index) => {
                            return (
                                <ListGroupItem key={index} className='py-50'>
                                    {item?.first_name && item?.last_name ? (
                                        <div className='d-flex align-items-center'>
                                            <span className='me-2'>№{index + 1}</span>
                                            <div className='d-flex justify-content-between w-100'>
                                                <strong>
                                                    {item?.last_name} {item?.first_name}
                                                </strong>
                                                <div>{item?.code}</div>
                                            </div>
                                        </div>
                                    ) : item?.name ? (
                                        <div className='d-flex align-item-center'>
                                            <p className='me-2 '>№{index + 1}</p>
                                            <strong>{item?.name}</strong>
                                        </div>
                                    ) : (
                                        item
                                    )}
                                </ListGroupItem>
                            )
                        })}
                    </ListGroup>
                ) : (
                    <p>{t('Өгөгдөл байхгүй байна')}</p>
                )}
            </ModalBody>
            <ModalFooter>
                <div className='d-flex justify-content-between w-100'>
                    <div>
                        <strong>{t('Нийт')}: {totalCount}</strong> {/* Display total count */}
                    </div>
                    <Button variant='secondary' onClick={handleModal}>
                        {t('Хаах')}
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default DetailModal
