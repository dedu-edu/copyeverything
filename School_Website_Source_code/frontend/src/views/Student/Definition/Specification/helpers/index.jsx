
import { t } from 'i18next';
import React, { useState } from 'react';
import ReactCountryFlag from 'react-country-flag'
import {
    Button,
    Card,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    UncontrolledDropdown
} from 'reactstrap'
import localforage from 'localforage';

import Avatar from "@components/avatar"
import useApi from '@src/utility/hooks/useApi';
import useLoader from '@src/utility/hooks/useLoader';

import ScoreModal from './ScoreModal';
import SignatureModal from './SignatureModal';
import SumModal from './SumModal';

export function getColumns(currentPage, rowsPerPage, total_count) {
    const page_count = Math.ceil(total_count / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: "30px",
            center: true
        },
        {
            header: 'code',
            name: t("Оюутны код"),
            selector: (row) => (row?.code),
            sortable: true,
            minWidth: "80px",
            center: true
        },
        {
            header: 'full_name',
            name: t("Овог Нэр"),
            selector: (row) => `${row?.last_name} ${row?.first_name}`,
            sortable: true,
            center: true
        },
        {
            header: 'register_num',
            name: t("Регистрийн дугаар"),
            selector: (row) => row?.register_num,
            sortable: true,
            center: true
        },
        {
            header: 'group',
            name: t("Анги"),
            selector: (row) => row?.group_name,
            sortable: true,
            center: true
        },
    ]
    return columns
}

export function ExpandedComponent({ data }) {
    /** State */
    const [sumModalOpen, setSumModalOpen] = useState(false)
    const [sumModalData, setSumModalData] = useState({})

    const [scoreModal, setScoreModal] = useState(false)
    const [scoreModalData, setScoreModalData] = useState({})

    const [signatureModal, setSignaturModal] = useState(false)
    const [ismon, setIsMon] = useState()

    const { fetchData } = useLoader({})
    const graduateApi = useApi().student.graduate
    const definitionApi = useApi().student.definition

    async function handleSignatureModal(c) {
        setSignaturModal(!signatureModal)
        setIsMon(c)
    }

    async function handleRequestSum(studentId) {
        setSumModalOpen(!sumModalOpen)
        setSumModalData(studentId)
    }

    async function handleScoreModal(studentId) {
        setScoreModal(!scoreModal)
        setScoreModalData(studentId)
    }

    async function graduationCertificate(studentId) {
        const response = await fetchData(graduateApi.get(1, 1, '-lesson_year,-lesson_season__season_code,-id', '', '', '', '', studentId, true))

        if (response.success && response.data?.results?.[0]) {
            /**
             * Moved from frontend/src/views/Student/Attachment/index.jsx
             */
            async function printDefinition(row) {
                const newWindow = window.open(`/student/attachment/student-definition/`, '_blank', 'noopener,noreferrer')
                const response = await fetchData(definitionApi.get(row?.student?.id))

                if (response) {
                    // Зургийг base64 болгон хөрвүүлнэ
                    let photoBase64 = null
                    if (response.profile?.photo) {
                        try {
                            const imgRes = await fetch(response.profile.photo)
                            const blob = await imgRes.blob()
                            photoBase64 = await new Promise((resolve) => {
                                const reader = new FileReader()
                                reader.onloadend = () => resolve(reader.result)
                                reader.readAsDataURL(blob)
                            })
                        } catch (e) {
                            console.warn('Зураг татахад алдаа:', e)
                        }
                    }
                    const getDatas = {
                        profile: {
                            ...response.profile,
                            photo: photoBase64 || response.profile?.photo,
                        },
                        profession: response.profession,
                        family_members: response.family_members,
                        trainings: response.trainings,
                        researches: response.researches,
                        sports: response.sports,
                        awards: response.awards,
                        social_activities: response.social_activities,
                        skills: response.skills,
                        disciplines: response.disciplines,
                        definition_texts: response.definition_texts,
                        gpa_by_year: response.gpa_by_year,
                        student: row?.student,
                    }
                    console.log('getDatas 2', getDatas)
                    localforage.setItem('studentDefData', getDatas)
                        .then(() => {
                            console.log('Student data saved successfully to IndexedDB');
                        })
                        .catch((err) => {
                            console.error('Error saving data:', err);
                        });
                    if (newWindow) {
                        newWindow.location.reload()
                    }
                } else {
                    if (newWindow) newWindow.close()
                }
            }

            printDefinition(response.data?.results?.[0])
        }
	}

    return (
        <Card className='mb-0 rounded-0 border-bottom'>
            <Row className='w-100' >
                <Col md={6} className='' >
                    <div className='d-flex'>
                        <div className='p-1'>
                            {
                                data.image
                                    ?
                                    <Avatar
                                        img={data.image}
                                        size='xl'
                                        className='pe-none'
                                    />
                                    :
                                    <Avatar
                                        initials
                                        color={'light-success'}
                                        content={data?.first_name || ''}
                                        contentStyles={{
                                            borderRadius: 0,
                                        }}
                                        size='xl'
                                        className='pe-none'
                                    />
                            }
                        </div>
                        <div className='p-1'>
                            <h6>Нэр: {data?.first_name}</h6>
                            <h6>Код: {data?.code}</h6>
                            <h6>Регистрийн дугаар: {data?.register_num}</h6>
                            <h6>Анги: {data?.group_name}</h6>
                        </div>
                    </div>
                </Col>
                <Col md={6} className='p-0 mt-2 ps-1' >
                    <UncontrolledDropdown className='dropdown-language nav-item d-inline-block' >
                        <DropdownToggle
                            caret
                            size='sm'
                            className='ms-50 mb-50'
                            color='primary'
                        >
                            Тодорхойлолт
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem style={{ width: '100%' }} onClick={() => {
                                handleSignatureModal(true)
                                // sessionStorage.setItem("student_data", JSON.stringify(data)), window.open('/student/learning-true')
                            }}>
                                Монгол
                                <ReactCountryFlag
                                    svg
                                    className='country-flag flag-icon mx-50'
                                    countryCode='mn'
                                />
                            </DropdownItem>
                            <DropdownItem style={{ width: '100%' }} onClick={() => {
                                handleSignatureModal(false)
                                // sessionStorage.setItem("student_data", JSON.stringify(data)), window.open('/student/learning-true/en')
                            }}>
                                English
                                <ReactCountryFlag
                                    svg
                                    className='country-flag flag-icon mx-50'
                                    countryCode='us'
                                />
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                    <Button
                        size='sm'
                        className='ms-50 mb-50'
                        color='primary'
                        onClick={() => handleRequestSum(data.id)}
                    >Голч дүн</Button>
                    <Button
                        size='sm'
                        className='ms-50 mb-50'
                        color='primary'
                        onClick={() => handleScoreModal(data.id)}
                    >Дүнгийн дэлгэрэнгүй</Button>
                    {/* <Button
                        size='sm'
                        className='ms-50 mb-50'
                        color='primary'
                        onClick={() => window.open('/student/credit-calculation', { state: data.id })}
                    >Судлах кредитийн тооцоо дэд цэс үүсгэх</Button> */}
                    <Button
                        size='sm'
                        className='ms-50 mb-50'
                        color='primary'
                        onClick={() => graduationCertificate(data.id)}
                    >
                        {t('Төгсөлтийн тодорхойлолт')}
                    </Button>
                </Col>
            </Row>
            {sumModalOpen && <SumModal isOpen={sumModalOpen} handleModal={handleRequestSum} datas={sumModalData} />}
            {scoreModal && <ScoreModal isOpen={scoreModal} handleModal={handleScoreModal} studentId={scoreModalData} />}
            {
                signatureModal && <SignatureModal isOpen={signatureModal} handleModal={handleSignatureModal} data={data} isMon={ismon} isTrue={true}/>
            }
        </Card>
    )
}
