import { Modal, Row, Col, ModalBody, ModalHeader} from 'reactstrap';


const DetailModal = ({ isOpen, handleModal, datas}) => {
    return (
        <Modal isOpen={isOpen} toggle={handleModal} className="modal-dialog-centered modal-sm">
            <ModalHeader toggle={handleModal}>{'Дэлгэрэнгүй'}</ModalHeader>
            <ModalBody>
                <Row tag='dl' className='mb-0'>
                    <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                        Хичээл:
                    </Col>
                    <Col tag='dd' xs='8' className='mb-1'>
                        {datas?.lesson_full_name + ' ' + `(${datas?.type_name})` || 'Хоосон байна'}
                    </Col>
                </Row>
                <Row tag='dl' className='mb-0'>
                    <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                       Хичээл заах багш:
                    </Col>
                    <Col tag='dd' xs='8' className='mb-1'>
                        {datas?.teacher_name || 'Хоосон байна'}
                    </Col>
                </Row>
                <Row tag='dl' className='mb-0'>
                    <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                       Дамжаа:
                    </Col>
                    <Col tag='dd' xs='8' className='mb-1'>
                        {datas?.groups?.length > 0 ? `${datas?.groups}` : 'Хоосон байна'}
                    </Col>
                </Row>
                <Row tag='dl' className='mb-0'>
                    <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                        Хичээлийн байр:
                    </Col>
                    <Col tag='dd' xs='8' className='mb-1'>
                        {datas?.building_name || ''}
                    </Col>
                </Row>
                <Row tag='dl' className='mb-0'>
                    <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                        Хичээл орох анги танхим:
                    </Col>
                    <Col tag='dd' xs='8' className='mb-1'>
                        {`${datas?.room_code || ''} ${datas?.room_name || ''}`}
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    )
}

export default DetailModal