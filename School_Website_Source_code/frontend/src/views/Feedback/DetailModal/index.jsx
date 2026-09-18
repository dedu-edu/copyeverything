import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Col, Label, Modal, ModalBody, ModalHeader, Row, Table } from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { Download } from 'react-feather'
import moment from 'moment'


export default function DetailModal({ isOpen, handleModal, modalData }) {
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true, bg: 3 });
    const feedbackApi = useApi().feedback
    const { t } = useTranslation()

    const [data, setData] = useState([])

    async function getData() {
        if (!modalData?.id) return
        const { success, data } = await fetchData(feedbackApi.getOne(modalData?.id))
        if (success) setData(data)
    }

    useEffect(() => {
        if (modalData?.id) getData()
    }, [modalData?.id])

    return (
        <Modal
            isOpen={isOpen}
            toggle={handleModal}
            centered
            backdrop='static'
            size='lg'
            scrollable={true}
        >
            <ModalHeader toggle={handleModal} tag={'div'} className='border-bottom'>
                <h5 className="modal-title">{t('Дэлгэрэнгүй')}</h5>
            </ModalHeader>
            <ModalBody>
                {isLoading && Loader}
                <Row className='border-bottom pb-1'>
                    <Col>
                        <div><span className='fw-bolder'>{t('Овог')}:</span> {modalData?.teacher?.last_name}</div>
                        <div><span className='fw-bolder'>{t('Нэр')}:</span> {modalData?.teacher?.first_name}</div>
                    </Col>
                    <Col>
                        <div><span className='fw-bolder'>{t('Багшийн код')}:</span> {modalData?.teacher_register_code}</div>
                        <div><span className='fw-bolder'>{t('Сургууль')}:</span> {modalData?.teacher?.sub_org?.name}</div>
                    </Col>
                </Row>
                <Row className='border-bottom py-1'>
                    <Col>
                        <div><span className='fw-bolder'>{t('Төлөв')}:</span> {modalData?.type?.name}</div>
                    </Col>
                    <Col>
                        <div><span className='fw-bolder'>{t('Санал илгээсэн огноо')}:</span> {moment(modalData?.created_at).format("YYYY-MM-DD HH:mm:ss")}</div>
                    </Col>
                </Row>
                <div className='border-bottom'>
                    <div className='pt-1'><span className='fw-bolder'>{t('Гарчиг')}:</span> {modalData?.title}</div>
                    {
                        modalData?.file &&
                        <>
                            <span className='fw-bolder me-25'>{t('Хавсаргасан файл')}:</span>
                            <a href={modalData?.file} className='me-25' target='_blank'>
                                <Download type="button" color='#1a75ff' width={'15px'} />
                            </a>
                            {decodeURIComponent(modalData?.file.toString().split("/").pop())}
                        </>
                    }
                    <div className='fw-bolder'>
                        {t('Тайлбар')}:
                    </div>
                    { data?.description ? <div dangerouslySetInnerHTML={{ __html: data?.description }}></div> : <div className='pb-1'></div>}
                </div>
                <div className='pt-1 text-center'>
                    <Button color="secondary" type="reset" outline onClick={handleModal}>
                        {t('Хаах')}
                    </Button>
                </div>
            </ModalBody>
        </Modal>
    )
}
