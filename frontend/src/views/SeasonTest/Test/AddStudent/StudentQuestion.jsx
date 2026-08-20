import { useEffect, useState } from 'react';
import { Download } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardBody, CardHeader, Form, Input, Label, Modal, ModalBody } from 'reactstrap';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { getFileName } from '@src/utility/Utils';

const KIND_ONE_CHOICE = 1; // 'Нэг сонголт'
const KIND_MULTI_CHOICE = 2; // 'Олон сонголт'
const KIND_BOOLEAN = 3; // 'Тийм // Үгүй сонголт'
const KIND_RATING = 4; // 'Үнэлгээ'
const KIND_TEXT = 5; // 'Бичвэр'

// Helper function to render the question text
function makeQuestionText(question, image, kind) {
    return (
        <div className='qtext'>
            <p>
                <span className='fw-bolder fs-4'>{question}</span>
                <small className='ms-1 fs-5'>{kind === KIND_MULTI_CHOICE ? '(Олон сонголттой)' : '(Нэг сонголттой)'}</small>
            </p>
            {image && (
                <div className='showImgDiv m-1'>
                    <img src={image} alt='question-related'
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            maxHeight: '300px',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            )}
        </div>
    );
}

// Helper function to render the rating answers
function makeRatingAns(textLow, textHigh, numStars, qIndx) {
    const radios = [];
    for (let index = 1; index <= numStars; index++) {
        radios.push(
            <div className="m-1" key={index}>
                <Input
                    type="radio"
                    id={`radio-${qIndx}-${index}-in`}
                    value={index}
                    className="form-check-input"
                    disabled
                    readOnly
                />
                <Label for={`radio-${qIndx}-${index}-in`} className="form-label d-flex justify-content-center">
                    {index}
                </Label>
            </div>
        );
    }
    return (
        <div className="d-flex align-items-center ms-2">
            <div>{textLow}</div>
            {radios}
            <div>{textHigh}</div>
        </div>
    );
}

const StudentQuestion = ({ open, challengeId, handleModal }) => {
    const studentId = open
    const { fetchData } = useLoader({ isFullScreen: true })
    const { t } = useTranslation()

    //state
    const [datas, setDatas] = useState([])

    //api
    const semesterChallengeApi = useApi().challenge.semester

    const getDatas = async () => {
        const { success, data } = await fetchData(semesterChallengeApi.getStudentQuestion(challengeId, studentId))
        if (success) setDatas(data)
    }

    useEffect(() => {
        getDatas()
    }, [])

    let globalIndex = 0

    return (
        <Modal isOpen={open} toggle={handleModal} className='modal-dialog-centered modal-lg' contentClassName='pt-0'>
            <ModalBody>
                <Card>
                    <CardHeader className='bg-primary justify-content-center'>
                        <h4 className='text-white'>Бататгах тест</h4>
                    </CardHeader>
                    <CardBody>
                        <Form className='mt-1'>
                            {datas?.map((challengeQuestionGroup, challengeQuestionGroupI) => {
                                return (
                                    <Card key={challengeQuestionGroupI} className='p-1 border-1 bg-white'>
                                        {typeof challengeQuestionGroup.id === "number" &&
                                            <div className='mb-1'>
                                                <div>
                                                    <h4 className='d-inline'>{t('Бүлэг')}:</h4> {challengeQuestionGroup.name}
                                                </div>
                                                <div dangerouslySetInnerHTML={{ __html: challengeQuestionGroup.description }}></div>
                                                {!!challengeQuestionGroup.file && <Label className="form-label">
                                                    <a href={challengeQuestionGroup.file} className='me-1' target='_blank' rel="noreferrer">
                                                        <Download type="button" color='#1a75ff' width={'15px'} />
                                                    </a>
                                                    {getFileName(challengeQuestionGroup.file)}
                                                </Label>}
                                            </div>
                                        }
                                        {challengeQuestionGroup.questions.map((question, qIdx) => {
                                            const {
                                                kind,
                                                question: questionText,
                                                image,
                                                rating_max_count,
                                                low_rating_word,
                                                high_rating_word,
                                                choices,
                                                id
                                            } = question

                                            globalIndex++

                                            return (
                                                <Card className='p-1 border-1 ms-1' key={id}>
                                                    <div>
                                                        <div className='d-flex gap-1 font-weight-bold'>
                                                            {globalIndex}.<p>{makeQuestionText(questionText, image, kind)} </p>{' '}
                                                            {question.score && <small>{question.score} оноо</small>}
                                                        </div>
                                                        <div className='d-flex ms-1'>
                                                            {kind === KIND_TEXT && (
                                                                <Input type='textarea' className='form-control mt-1' placeholder='Хариултыг бичнэ' />
                                                            )}

                                                            {kind === KIND_RATING && makeRatingAns(low_rating_word, high_rating_word, rating_max_count, qIdx, id)}

                                                            {(kind === KIND_ONE_CHOICE || kind === KIND_MULTI_CHOICE) && (
                                                                <div className='d-flex flex-row flex-wrap justify-content-center w-100'>
                                                                    {choices.map((choice, idx) => (
                                                                        <div className='form-check my-1 me-3 ' key={idx}>
                                                                            <Input
                                                                                type={kind === KIND_MULTI_CHOICE ? 'checkbox' : 'radio'}
                                                                                className='form-check-input mb-1'
                                                                                checked={choice.score > 0}
                                                                                readOnly
                                                                                disabled
                                                                            />
                                                                            {choice.image ? (
                                                                                <div className='m-1 ms-0 showChoiceDiv'>
                                                                                    <img src={choice.image} alt='choice'
                                                                                        style={{
                                                                                            width: '100%',
                                                                                            maxWidth: '200px',
                                                                                            maxHeight: '100px',
                                                                                            objectFit: 'contain'
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <Label className='form-check-label' for={`choice${qIdx}`}>
                                                                                    {choice.choices}
                                                                                </Label>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {kind === KIND_BOOLEAN &&
                                                                ['Тийм', 'Үгүй'].map((text, yIdx) => (
                                                                    <div className='form-check my-1 me-3' key={yIdx}>
                                                                        <Input
                                                                            type='radio'
                                                                            id={`yes${id}`}
                                                                            name={`yes${qIdx}`}
                                                                            className='form-check-input mb-1'
                                                                            disabled
                                                                            readOnly
                                                                        />
                                                                        <Label className='form-check-label'>{text}</Label>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </Card>
                                            )
                                        })}
                                    </Card>
                                )
                            })}
                            <div className='d-flex gap-2 mt-3'>
                                <Button onClick={handleModal}>{t('Буцах')}</Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </ModalBody>
        </Modal>
    )
}

export default StudentQuestion;
