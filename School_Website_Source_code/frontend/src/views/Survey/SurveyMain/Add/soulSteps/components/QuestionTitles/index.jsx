import classnames from 'classnames'
import { useCallback, useState } from 'react'
import { Col, Input, Label, Row } from 'reactstrap'
import { Button } from 'reactstrap'

import { get_questionype, KIND_RATING } from '@src/utility/Utils'

import { deepCopyTitles } from '../../Asuult'
import Question from '../../Question'

const default_page = [0, 5, 10, 15, 20]

export default function QuestionTitles({ isEdit, questionTitles, setQuestionTitles }) {
    const cvalues = {
        kind: '',
        rating_max_count: '',
        rating_words: []
    }

    const firstRatingQuestionCoordinates = { tidx: null, qidx: null }
    const [qtypeOption] = useState(get_questionype().filter((c) => ['Үнэлгээ', 'Бичвэр'].includes(c.name)))

    // Асуултын сэдэв onChange
    const onHandleChangeTitle = useCallback(
        (index, value, name) => {
            const newTitles = deepCopyTitles(questionTitles)

            if (newTitles && newTitles.length > 0) {
                newTitles[index][name] = value
            }

            setQuestionTitles(newTitles)
        },

        [questionTitles]
    )

    function addQuestions(titleIndex, question, count) {
        const newTitles = deepCopyTitles(questionTitles)

        if (count === 0) {
            newTitles[titleIndex].questions = []
            setQuestionTitles(newTitles)
            return
        }

        for (let i = 0; i < count; i++) newTitles[titleIndex].questions.push(JSON.parse(JSON.stringify(question)))
        setQuestionTitles(newTitles)
    }

    function copyQuestion(titleIndex, index) {
        const newTitles = deepCopyTitles(questionTitles)
        const newQuestions = newTitles[titleIndex].questions
        newQuestions.push(JSON.parse(JSON.stringify(newQuestions[index])))
        setQuestionTitles(newTitles)
    }

    function reflectRatingQuestions(newTitles) {
        let firstRatingQuestion = null

        newTitles.forEach(newTitle => {
            newTitle.questions.forEach(newQuestion => {
                if (newQuestion.kind === KIND_RATING) {
                    if (firstRatingQuestion === null) {
                        firstRatingQuestion = newQuestion
                    } else {
                        newQuestion.rating_words = firstRatingQuestion.rating_words
                        newQuestion.rating_max_count = firstRatingQuestion.rating_max_count
                    }
                }
            })
        })
    }

    // Асуулт onChange
    function changeQuestion(titleIndex, index, value, name) {
        const newTitles = deepCopyTitles(questionTitles)
        const newQuestion = newTitles[titleIndex].questions[index]

        if (name === 'rating_max_count') {
            if (Array.isArray(newQuestion.rating_words)) {
                if (newQuestion.rating_words.length > value) newQuestion.rating_words.splice(value)
                else if (newQuestion.rating_words.length < value) newQuestion.rating_words.push(...Array.from({ length: value - newQuestion.rating_words.length }, (_, i) => ''))
            } else newQuestion.rating_words = Array.from({ length: value }, (_, i) => '')
        }

        newQuestion[name] = value
        if (newTitles[titleIndex].questions[index].kind === KIND_RATING) reflectRatingQuestions(newTitles)

            setQuestionTitles(newTitles)
    }

    function removeQuestion(titleIndex, index) {
        const newTitles = deepCopyTitles(questionTitles)
        newTitles[titleIndex].questions.splice(index, 1)
        setQuestionTitles(newTitles)
    }

    const removeTitle = (index) => {
        const newTitles = deepCopyTitles(questionTitles)
        newTitles.splice(index, 1)
        setQuestionTitles(newTitles)
    }

    // Rating word onChange
    const onHandleRatingWordChange = (titleIndex, index, rating_word_idx, value, rating_words) => {
        const newRatingWords = [...rating_words]
        newRatingWords[rating_word_idx] = value
        changeQuestion(titleIndex, index, newRatingWords, 'rating_words')
    }

    return questionTitles.map((questionTitlesItem, idx) => {
        const { name, questions } = questionTitlesItem

        return (
            <div className='added-cards mt-1' key={idx}>
                <div className={classnames('cardMaster rounded border p-1')}>
                    <Row className='mt-1'>
                        <Row>
                            <div className='d-flex justify-content-between'>
                                <h5>{`Асуултын сэдэв(${idx + 1})`}</h5>
                                <div className=''>
                                    <Button color='danger' size='sm' outline onClick={() => removeTitle(idx)}>
                                        Устгах
                                    </Button>
                                </div>
                            </div>
                        </Row>
                        <Row>
                            <Col md={6} className='mt-1'>
                                <Label className='form-label' htmlFor='name'>
                                    {'Асуултын сэдэв'}
                                </Label>
                                <Input
                                    id='name'
                                    name='name'
                                    bsSize='sm'
                                    placeholder='Асуултын сэдвээ бичнэ үү'
                                    type='text'
                                    value={name || ''}
                                    onChange={(e) => onHandleChangeTitle(idx, e.target.value, e.target.name)}
                                />
                            </Col>
                        </Row>
                        <div className='mt-1'>
                            <h3>
                                {'Судалгааны асуулт'} {isEdit ? 'засах' : 'нэмэх'}
                            </h3>
                            {!isEdit && (
                                <Col md={4} sm={12}>
                                    <hr></hr>
                                    <Label className='form-label'>{'Хуудсанд харуулах асуултын тоо'}</Label>
                                    <Input
                                        type='select'
                                        bsSize='sm'
                                        style={{ height: '30px', width: '100%' }}
                                        onChange={(e) => {
                                            const count = parseInt(e.target.value)
                                            if (count) addQuestions(idx, cvalues, count)
                                        }}
                                    >
                                        {default_page.map((page, idx) => (
                                            <option key={idx} value={page}>
                                                {page}
                                            </option>
                                        ))}
                                    </Input>
                                </Col>
                            )}
                            {questions?.map((question, qidx) => {
                                if (firstRatingQuestionCoordinates.qidx === null && question.kind === KIND_RATING) {
                                    firstRatingQuestionCoordinates.tidx = idx
                                    firstRatingQuestionCoordinates.qidx = qidx
                                }

                                const isFirstRatingQuestion = firstRatingQuestionCoordinates.tidx === idx && firstRatingQuestionCoordinates.qidx === qidx

                                return (
                                    <Question
                                        key={qidx}
                                        question={question}
                                        changeQuestion={changeQuestion}
                                        titleIndex={idx}
                                        copyQuestion={copyQuestion}
                                        removeQuestion={removeQuestion}
                                        qtypeOption={qtypeOption}
                                        idx={qidx}
                                        isFirstRatingQuestion={isFirstRatingQuestion}
                                        onHandleRatingWordChange={onHandleRatingWordChange}
                                    />
                                )
                            })}
                            <div className=''>
                                <Button color='primary' size='sm' className='mt-2' onClick={() => addQuestions(idx, cvalues, 1)}>
                                    Асуулт нэмэх
                                </Button>
                            </div>
                        </div>
                    </Row>
                </div>
            </div>
        )
    })
}
