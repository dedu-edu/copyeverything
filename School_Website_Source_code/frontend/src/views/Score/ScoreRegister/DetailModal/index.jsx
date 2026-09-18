import React, { Fragment, useState, useEffect } from 'react';
import {
    Modal,
    Alert,
    ModalBody,
    ModalHeader,
    Table
} from 'reactstrap';

import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';

const DetailModal = ({ open, handleModal, datas }) => {
    const [studentData, setStudentData] = useState([]);
    const [scoreHeaders, setHeaderDatas] = useState([]);

    const { Loader, isLoading, fetchData } = useLoader({
        isFullScreen: true
    });

    const scoreApi = useApi().score.teacher;

    const getDatas = async () => {
        if (!datas) return;

        const lesson = datas?.lesson?.id;
        const group = datas?.group?.id || '';
        const teacher = datas?.teacher?.id || '';

        const groupData = {
            lesson,
            teacher,
            group,
            is_approved: datas?.is_approved
        };

        const {
            success,
            data
        } = await fetchData(
            scoreApi.studentTeacherScoreData(groupData)
        );

        if (success) {
            setStudentData(data?.student_datas || []);
            setHeaderDatas(data?.score_types || []);
        } else {
            setStudentData([]);
            setHeaderDatas([]);
        }
    };

    useEffect(() => {
        if (open) {
            getDatas();
        }
    }, [open, datas]);

    const progressGroup = scoreHeaders.find(
        (item) => item?.score_type === 'progress'
    );

    const examGroup = scoreHeaders.find(
        (item) => item?.score_type === 'exam'
    );

    const progressChildren = progressGroup?.children || [];

    const hasProgressBreakdown =
        progressGroup?.has_breakdown ?? (progressChildren.length > 1);

    const getStudentScore = (student, scoreTypeId) => {
        if (!student?.scores || !scoreTypeId) {
            return null;
        }

        const scoreObj = student.scores.find(
            (score) =>
                Number(score?.score_type_id) === Number(scoreTypeId)
        );

        return scoreObj?.score ?? null;
    };

    const columnCount =
        6 +
        (hasProgressBreakdown ? progressChildren.length : 1) +
        (examGroup ? 1 : 0);

    return (
        <Fragment>
            {isLoading && Loader}

            <Modal
                isOpen={open}
                toggle={handleModal}
                fullscreen="md"
                className="modal-dialog-centered modal-lg"
            >
                <ModalHeader toggle={handleModal}>
                    Дүнгийн дэлгэрэнгүй ({studentData.length})
                </ModalHeader>

                <ModalBody>
                    <Alert
                        color="primary"
                        className="p-50"
                    >
                        {datas?.teacher?.full_name} багшийн оруулсан{' '}
                        {datas?.lesson?.full_name} хичээлийн явцын дүн
                    </Alert>

                    <Alert
                        color="danger"
                        className="p-50"
                    >
                        Доорх дүнгийн жагсаалт нь хуваарьтай тохирч байгаа
                        сурагчдын дүнг харуулж байгаа
                    </Alert>

                    <div
                        className="overflow-auto"
                        style={{
                            maxHeight: '600px'
                        }}
                    >
                        <Table
                            responsive
                            bordered
                            className="text-center"
                            size="md"
                        >
                            <thead>
                                <tr>
                                    <th
                                        rowSpan={2}
                                        className="p-50"
                                        style={{
                                            width: '3%',
                                            minWidth: '45px',
                                            verticalAlign: 'middle'
                                        }}
                                    >
                                        №
                                    </th>

                                    <th
                                        rowSpan={2}
                                        className="p-50 text-start"
                                        style={{
                                            width: '13%',
                                            minWidth: '170px',
                                            verticalAlign: 'middle'
                                        }}
                                    >
                                        Сурагч
                                    </th>

                                    <th
                                        rowSpan={2}
                                        className="p-50 text-start"
                                        style={{
                                            width: '6%',
                                            minWidth: '100px',
                                            verticalAlign: 'middle'
                                        }}
                                    >
                                        Анги
                                    </th>

                                    <th
                                        rowSpan={2}
                                        className="p-50"
                                        style={{
                                            width: '5%',
                                            minWidth: '80px',
                                            verticalAlign: 'middle'
                                        }}
                                    >
                                        Нэмэлт
                                        <br />
                                        оноо
                                    </th>

                                    {progressGroup && (
                                        hasProgressBreakdown ? (
                                            <th
                                                colSpan={
                                                    progressChildren.length || 1
                                                }
                                                className="p-50"
                                                style={{
                                                    minWidth: '150px',
                                                    verticalAlign: 'middle'
                                                }}
                                            >
                                                {progressGroup.name || 'Явцын оноо'}
                                                {' '}
                                                (
                                                {progressGroup.score ?? 0}
                                                )
                                            </th>
                                        ) : (
                                            <th
                                                rowSpan={2}
                                                className="p-50"
                                                style={{
                                                    minWidth: '150px',
                                                    verticalAlign: 'middle'
                                                }}
                                            >
                                                {progressGroup.name || 'Явцын оноо'}
                                                {' '}
                                                (
                                                {progressGroup.score ?? 0}
                                                )
                                            </th>
                                        )
                                    )}

                                    {examGroup && (
                                        <th
                                            rowSpan={2}
                                            className="p-50"
                                            style={{
                                                minWidth: '150px',
                                                verticalAlign: 'middle'
                                            }}
                                        >
                                            {examGroup.name || 'Шалгалтын оноо'}
                                            {' '}
                                            (
                                            {examGroup.score ?? 0}
                                            )
                                        </th>
                                    )}

                                    <th
                                        rowSpan={2}
                                        className="p-50"
                                        style={{
                                            width: '7%',
                                            minWidth: '90px',
                                            verticalAlign: 'middle'
                                        }}
                                    >
                                        Үсгэн
                                        <br />
                                        үнэлгээ
                                    </th>

                                    <th
                                        rowSpan={2}
                                        className="p-50"
                                        style={{
                                            width: '7%',
                                            minWidth: '90px',
                                            verticalAlign: 'middle'
                                        }}
                                    >
                                        Нийт дүн
                                    </th>
                                </tr>

                                {hasProgressBreakdown && (
                                    <tr>
                                        {progressChildren.map((child) => (
                                            <th
                                                key={child?.id}
                                                className="p-50"
                                                style={{
                                                    minWidth: '130px',
                                                    verticalAlign: 'middle'
                                                }}
                                            >
                                                {child?.name || '-'}
                                                {' '}
                                                (
                                                {child?.score ?? 0}
                                                )
                                            </th>
                                        ))}
                                    </tr>
                                )}
                            </thead>

                            <tbody>
                                {studentData.length > 0 ? (
                                    studentData.map((student, index) => (
                                        <tr
                                            key={
                                                student?.student_id || index
                                            }
                                        >
                                            <td className="p-50">
                                                {index + 1}
                                            </td>

                                            <td className="text-start p-50">
                                                {student?.student_name || '-'}
                                            </td>

                                            <td className="text-start p-50">
                                                {student?.group_name || '-'}
                                            </td>

                                            <td className="p-50">
                                                {student?.add_score ?? 0}
                                            </td>

                                            {progressGroup && (
                                                hasProgressBreakdown ? (
                                                    progressChildren.map(
                                                        (child) => {
                                                            const score =
                                                                getStudentScore(
                                                                    student,
                                                                    child?.id
                                                                );

                                                            return (
                                                                <td
                                                                    key={`${student?.student_id}-${child?.id}`}
                                                                    className="p-50"
                                                                >
                                                                    {score ??
                                                                        '-'}
                                                                </td>
                                                            );
                                                        }
                                                    )
                                                ) : (
                                                    <td className="p-50">
                                                        {getStudentScore(
                                                            student,
                                                            progressGroup?.score_type_id
                                                        ) ?? '-'}
                                                    </td>
                                                )
                                            )}

                                            {examGroup && (
                                                <td className="p-50">
                                                    {getStudentScore(
                                                        student,
                                                        examGroup?.score_type_id
                                                    ) ?? '-'}
                                                </td>
                                            )}

                                            <td className="p-50">
                                                {student?.letter_grade || '-'}
                                            </td>

                                            <td className="p-50">
                                                {student?.total_score ?? 0}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columnCount}
                                            className="p-50"
                                        >
                                            Сурагч байхгүй
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};

export default DetailModal;