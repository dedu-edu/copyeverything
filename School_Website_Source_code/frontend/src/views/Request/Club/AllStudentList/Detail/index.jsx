import React, { Fragment } from 'react'

import {
    Row,
    Col,
	Modal,
	ModalBody,
	ModalHeader,
} from "reactstrap";

import { t } from 'i18next';

import { request_flag_color} from "@utils"
import { Typography } from "@mui/material"

const DetailModal = ({ open, handleModal, detail_data }) => {
	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-lg" onClosed={handleModal} backdrop='static'>
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal} ></ModalHeader>
                <ModalBody className="px-sm-5 pt-30 pb-10">
                    <div className='text-center'>
                        <h4>{t('Дэлгэрэнгүй мэдээлэл')}</h4>
                    </div>
                    <Row style={{
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                        }}>
                        <Col xs={6}>
                            <Typography >
                                Клубийг нэр:
                            </Typography>
                        </Col>
                        <Col xs={6}>
                            <Typography >
                                {detail_data?.club?.name}
                            </Typography>
                        </Col>
                        <Col xs={6}>
                            <Typography>
                                Клубийг сонгосон шалтгаан:
                            </Typography>
                        </Col>
                        <Col xs={6}>
                            <Typography>
                                {detail_data?.description}
                            </Typography>
                        </Col>
                        {
                            detail_data?.anket
                            ?
                                <>
                                    <Col xs={6}>
                                        <Typography>
                                            Нас:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.age}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Хүйс:
                                        </Typography>
                                    </Col>
                                        <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.gender}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Суралцаж буй мэргэжил:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.profession}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Суралцаж буй сургууль:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.school}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Анги, хэсэг:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.group}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Сургуулийн мейл:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.email}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Холбоо барих утасны дугаар:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.phone_number}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Яаралтай үед холбогдох утасны дугаар:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.emergency}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Давуу тал:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.advantages}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Сул тал:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.weakness}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Сонирхол болон хобби:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.interesting}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Хэлний мэдлэг, оноотой эсэх:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.language}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Компютерийн хэрэглээний программын мэдлэгээ тодорхойлно уу:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.com_ability}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Ямар нэг урлаг, спортын авьяас байгаа эсэх:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.art_sport}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Facebook хаягийн холбоос:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            <a className='text-decoration-underline' target="_blank" href={detail_data?.anket?.link}>{detail_data?.anket?.link}</a>
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Өмнө нь ямар нэг олон нийтийн болон сайн дурын идэвхитэй үйл ажиллагаа хийж байсан туршлага:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.volentuur_activate}
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            Эрдэм шинжилгээний ажилд оролцож байсан эсэх:
                                        </Typography>
                                    </Col>
                                    <Col xs={6}>
                                        <Typography>
                                            {detail_data?.anket?.work}
                                        </Typography>
                                    </Col>
                                </>
                            :
                                <Col>Анкетын мэдээлэл байхгүй</Col>
                        }
                    </Row>
                    <Row className='mt-1' style={{
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                        }}>
                        <Col xs={6}>
                            <Typography>
                                Хүсэлтийн төлөв:
                            </Typography>
                            </Col>
                        <Col xs={6}>
                            <Typography>
                                {request_flag_color(detail_data?.request_flag)}
                            </Typography>
                        </Col>
                        <Col xs={6}>
                            <Typography>
                                Хариулт:
                            </Typography>
                        </Col>
                        <Col xs={6}>
                            <Typography>
                                {detail_data?.answer}
                            </Typography>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default DetailModal;
