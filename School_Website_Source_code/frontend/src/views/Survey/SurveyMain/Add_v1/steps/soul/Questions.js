import React, { useState, memo, useEffect } from 'react'
import { Plus, X } from 'react-feather'
import { Label, Input, Row, Col, Button, FormFeedback, Badge } from 'reactstrap'
import Select from 'react-select'
import classnames from "classnames";
import { useTranslation } from 'react-i18next';

import { ReactSelectStyles, get_questionype } from "@utils"
import empty from "@src/assets/images/empty-image.jpg"

import '../style.css'

import { KIND_RATING } from "@utils";

function Question({
    questions,
    errors,
    changeQuestion,
    titleIndex,
    copyQuestion,
    questionTitles,
    isEdit,
    removeQuestion
}) {
    const { t } = useTranslation()

    const [qtypeOption, setQtypeOption] = useState(get_questionype().filter((c) => ['Үнэлгээ', 'Бичвэр'].includes(c.name)))
    const [questionsMarkup, setQuestionsMarkup] = useState(<></>)

    // Rating word onChange
    const onHandleRatingWordChange =
        (index, rating_word_idx, value, rating_words) => {
            const newRatingWords = [...rating_words]
            newRatingWords[rating_word_idx] = value
            changeQuestion(titleIndex, index, newRatingWords, 'rating_words')
        }

    function displayQuestions() {
        setQuestionsMarkup(questions?.map((rowsData, idx) => {
            const { kind, question } = rowsData;
            let { rating_max_count, rating_words } = rowsData;
            const isNotFirstGlobalQuestion = titleIndex !== 0 || (titleIndex === 0 && idx !== 0)

            // to reflect rating max count
            if (isNotFirstGlobalQuestion) {
                rating_max_count = questionTitles[0].questions?.[0]?.rating_max_count
                if (rowsData.rating_max_count !== rating_max_count) changeQuestion(titleIndex, idx, rating_max_count, 'rating_max_count')
            }

            // to reflect rating words
            if (isNotFirstGlobalQuestion) {
                rating_words = questionTitles[0].questions?.[0]?.rating_words

                // to avoid state recursive infinite loops, change only if not equal
                for (let i = 0; i < rating_words?.length; i++) {
                    const firstGlobalQuestionRatingWord = rating_words[i]
                    const currentRatingWord = rowsData.rating_words[i]
                    if (currentRatingWord !== firstGlobalQuestionRatingWord) onHandleRatingWordChange(idx, i, firstGlobalQuestionRatingWord, rating_words)
                }
            }

            return (
                <div className='added-cards mt-1' key={idx} >
                    <div className={classnames('cardMaster rounded border p-1')}>
                        <Row className='mt-1' >
                            <Row>
                                <div className='d-flex justify-content-between'>
                                    <h5>{`Асуулт(${idx + 1})`}</h5>
                                    {
                                        !isEdit &&
                                        <Row>
                                            <Col className=''>
                                                <Button color="primary" size='sm' outline onClick={() => copyQuestion(titleIndex, idx)}>
                                                    Хуулах
                                                </Button>
                                            </Col>
                                            <Col className=''>
                                                <Button color="danger" size='sm' outline onClick={() => removeQuestion(titleIndex, idx)}>
                                                    Устгах
                                                </Button>
                                            </Col>
                                        </Row>
                                    }
                                </div>
                                <Col md={6} className=''>
                                    <Label className="form-label" htmlFor="kind">
                                        {'Асуултын төрөл'}
                                    </Label>
                                    <Select
                                        name="kind"
                                        id="kind"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        options={qtypeOption}
                                        value={kind ? qtypeOption.find((c) => c.id === kind) : ''}
                                        placeholder={'-- Сонгоно уу --'}
                                        noOptionsMessage={() => 'Хоосон байна.'}
                                        onChange={(val) => {
                                            changeQuestion(titleIndex, idx, val?.id, 'kind')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className='mt-1'>
                                    <Label className="form-label" htmlFor="question">
                                        {'Асуулт'}
                                    </Label>
                                    <Input
                                        id="question"
                                        name="question"
                                        bsSize="sm"
                                        placeholder="Асуултаа бичнэ үү"
                                        type="text"
                                        value={question || ''}
                                        onChange={(e) => changeQuestion(titleIndex, idx, e.target.value, e.target.name)}
                                    />
                                </Col>
                            </Row>

                            {
                                kind == KIND_RATING
                                    ?
                                    <>
                                        <Row>
                                            <Col md={6} sm={12} className='mt-1'>
                                                <Label htmlFor="rating_max_count">Үнэлгээний дээд тоо</Label>
                                                <Input
                                                    type='number'
                                                    bsSize='sm'
                                                    disabled={isNotFirstGlobalQuestion ? true : false}
                                                    name="rating_max_count"
                                                    id='rating_max_count'
                                                    placeholder='Үнэлгээний дээд тоо'
                                                    defaultValue={rating_max_count}
                                                    onChange={(e) => changeQuestion(titleIndex, idx, e.target.value, e.target.name)}
                                                />
                                            </Col>
                                        </Row>
                                        {
                                            Array.from({ length: rating_max_count }, (_, i) =>
                                                <Row key={i}>
                                                    <Col md={6} sm={12} className='mt-1'>
                                                        <Label htmlFor={`rating_words_${i}`}>{i + 1} {t('үнэлгээг илэрхийлэх үг')}</Label>
                                                        <Input
                                                            type='text'
                                                            name={`rating_words_${i}`}
                                                            bsSize='sm'
                                                            disabled={isNotFirstGlobalQuestion ? true : false}
                                                            placeholder={`${i + 1} ${t('үнэлгээг илэрхийлэх үг')}`}
                                                            defaultValue={rating_words?.[i]}
                                                            onChange={(e) => onHandleRatingWordChange(idx, i, e.target.value, rating_words)}
                                                        />
                                                    </Col>
                                                </Row>
                                            )
                                        }
                                    </>
                                    :
                                    <></>
                            }
                        </Row>
                    </div>
                </div>
            )
        }))
    }

    useEffect(() => {
        displayQuestions()
    }, [questions, questionTitles?.[0].questions?.[0]])

    return questionsMarkup
}

export default memo(Question)
