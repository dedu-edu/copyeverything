import React, { useState, useEffect } from 'react';

// ** Reactstrap Imports
import {
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    ListGroup,
    ListGroupItem,
    Alert,
} from 'reactstrap'

import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

import useLoader from "@src/utility/hooks/useLoader";
import useApi from "@src/utility/hooks/useApi";
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Circle } from 'react-feather';

// Register necessary elements
Chart.register(ArcElement, Tooltip, Legend);

// Custom plugin to draw text in the center of the Doughnut chart
export const centerTextPlugin = {
    id: "centerText",
    afterDraw: (chart, args, options) => {
        const { ctx, chartArea: { width, height } } = chart;
        const total = options.total; // массив: [homework, challenge, views]

        if (!total || !Array.isArray(total)) return;

        ctx.save();
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#333";

        // Chart-ийн төвийг тооцоолох
        const centerX = chart.getDatasetMeta(0).data[0].x;
        const centerY = chart.getDatasetMeta(0).data[0].y;

        // Текстийг мөрөөр бичих
        ctx.fillText(`Даалгавар: ${total[0]}/${total[1]}`, centerX, centerY - 20);
        ctx.fillText(`Шалгалт: ${total[2]}/${total[3]}`, centerX, centerY);
        ctx.fillText(`Үзсэн м.: ${total[4]}/${total[5]}`, centerX, centerY + 20);

        ctx.restore();
    }
};


const DetailModal = ({ rowData, open, handleModal, lesson }) => {

    // Translation hook
    const { t } = useTranslation();
    const [datas, setDatas] = useState([]);
    const [cardData, setCardData] = useState({})
    const { fetchData } = useLoader({});

	const studentLessonDetailApi = useApi().getStudentLesson;

    // Variables
    const testColor = '#007bff';
    const homeworkColor = '#cc66ff';
    const viewColor = '#66ffcc';

    // Prepare data for Doughnut chart
    const options = {
        maintainAspectRatio: false,
        cutout: 54,
        animation: {
            resize: {
                duration: 500
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label(context) {
                        const label = context.label || '';
                        const value = context.raw;
                        const total = context.dataset.data.reduce((acc, v) => acc + v, 0);
                        const percentage = ((value / total) * 100).toFixed(2) + '%';
                        return `${label}: ${value} (${percentage})`;
                    }
                },
                shadowOffsetX: 1,
                shadowOffsetY: 1,
                shadowBlur: 8,
                shadowColor: 'rgba(0, 0, 0, 0.25)',
                backgroundColor: '#333',
                titleFontColor: '#fff',
                bodyFontColor: '#fff'
            },
            centerText: {
                total: 0
            }
        }
    };

    async function getDatas() {
        const { success, data } = await fetchData(studentLessonDetailApi.get(rowData?.id, lesson?.id));
		if (success) {
            setDatas(data?.online_week_datas || [])

            let reviewData = data?.online_lesson_review

            const viewData = data?.online_week_datas?.reduce((acc, item) => {
                acc.view_count += item.viewed.view_count
                acc.total_count += item.viewed.total_count
                return acc
            }, { view_count: 0, total_count: 0 })

            const cardData = {
                labels: ["Даалгавар", "Шалгалт", "Үзсэн материалууд"],
                data: [reviewData.study_homework_count, reviewData.study_challenge_count, viewData?.view_count],

                total: [
                    reviewData.count_homework, reviewData.study_homework_count,
                    reviewData.count_challenge, reviewData.study_challenge_count,
                    viewData?.total_count, viewData?.view_count,
                ],

                totalDetail: [
                    `${reviewData.count_homework} / ${reviewData.study_homework_count}`,
                    `${reviewData.count_challenge} / ${reviewData.study_challenge_count}`,
                    `${viewData?.total_count} / ${viewData?.view_count}`,
                ]
            };

            setCardData(cardData)
		}
    }

    useEffect(() => {
        getDatas();
    }, [rowData]);

    return (
        <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-lg" onClosed={handleModal}>
            <ModalHeader className='bg-transparent pb-0' toggle={handleModal} tag={'div'}><h5>{t('Сурагчийн онлайн хичээлийн явц')}</h5></ModalHeader>
            <ModalBody className="">
                {
                    datas?.length
                    ?
                        <Row className="mb-1">
                            <Col md={12}>
                                <div className='bg-light-warning p-50 rounded-3 d-flex align-items-center'>
                                    <AlertTriangle className='m-25 me-1' style={{ width: 36 }}/>
                                    <div>
                                        Даалгавар болон шалгалтын үр дүнгээр хичээлийг судалсан хэмээн үзсэн болно
                                    </div>
                                </div>
                            </Col>
                            <Col md={6} className="d-flex align-items-center justify-content-center">
                                <div style={{ maxWidth: '200px', width: '100%' }} className="mt-1">
                                    <Doughnut
                                        data={{
                                            labels: cardData.labels,
                                                datasets: [{
                                                data: cardData.data,
                                                backgroundColor: [homeworkColor, testColor, viewColor],
                                                borderWidth: 1,
                                            }]
                                        }}
                                        options={{
                                            ...options,
                                            plugins: {
                                                ...options.plugins,
                                                centerText: { total: cardData.total } // [count_homework, count_challenge, count_view]
                                            }
                                        }}
                                        plugins={[centerTextPlugin]}
                                    />
                                </div>
                            </Col>
                            <Col md={6} className="d-flex flex-column">
                                {
                                    cardData?.labels?.map((label, i) => {
                                        return(
                                            <div key={i} className='d-flex justify-content-between mt-2'>
                                                <div className='d-flex align-items-center'>
                                                    <Circle fill={[homeworkColor, testColor, viewColor][i]} color={[homeworkColor, testColor, viewColor][i]} size={24} />
                                                    <span className='fw-bold ms-75 me-25'>{label}</span>
                                                </div>
                                                <div className="d-flex flex-column justify-content-center">
                                                    <span>{cardData.totalDetail[i]}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </Col>
                        </Row>
                    :
                        <div className='text-center'>Онлайн хичээл олдсонгүй</div>
                }
                <ListGroup>
                    <div className="p-50">
                        <ul>
                            <li><span className="text-success">Ногоон</span> өнгөөр хичээл үзсэн</li>
                            <li><span className="text-danger">Улаан</span> өнгөөр хичээл үзээгүй</li>
                        </ul>
                    </div>
                    {datas?.map((item, idx) => {
                        const total = item.viewed?.total_count
                        let viewed = item.viewed?.view_count
                        if (total === 0) viewed = 0
                        else viewed = viewed * 100 / total

                        return(
                            <ListGroupItem key={idx} color={viewed === 100 ? "success" : "danger"} className='d-flex justify-content-between'>
                                <div>
                                    {`${item.week_number}-р долоо хоног`}
                                </div>
                                <div>
                                    {viewed ? viewed.toFixed(0) + '%' : <></>}
                                </div>
                            </ListGroupItem>
                        )
                    })}
                </ListGroup>
            </ModalBody>
        </Modal>
    );
};

export default DetailModal;
