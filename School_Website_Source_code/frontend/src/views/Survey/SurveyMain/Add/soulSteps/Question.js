import classnames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { Button, Col, Input, Label, Row } from 'reactstrap'

import { ReactSelectStyles } from '@utils'

import '../style.css'

const KIND_RATING = 4 // 'Үнэлгээ'

function Question({ question, changeQuestion, titleIndex, copyQuestion, removeQuestion, qtypeOption, idx, isFirstRatingQuestion, onHandleRatingWordChange }) {
    const { t } = useTranslation()
    const { kind, question: questionText, rating_max_count, rating_words } = question

    return (
        <div className='added-cards mt-1' key={idx}>
            <div className={classnames('cardMaster rounded border p-1')}>
                <Row className='mt-1'>
                    <Row>
                        <div className='d-flex justify-content-between'>
                            <h5>{`${t('Асуулт')}(${idx + 1})`}</h5>
                            <Row>
                                <Col className=''>
                                    <Button color='primary' size='sm' outline onClick={() => copyQuestion(titleIndex, idx)}>
                                        {t('Хуулах')}
                                    </Button>
                                </Col>
                                <Col className=''>
                                    <Button color='danger' size='sm' outline onClick={() => removeQuestion(titleIndex, idx)}>
                                        {t('Устгах')}
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                        <Col md={6} className=''>
                            <Label className='form-label' htmlFor='kind'>
                                {t('Асуултын төрөл')}
                            </Label>
                            <Select
                                name='kind'
                                id='kind'
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                options={qtypeOption}
                                value={kind ? qtypeOption.find((c) => c.id === kind) : ''}
                                placeholder={`-- ${t('Сонгоно уу')} --`}
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
                            <Label className='form-label' htmlFor='question'>
                                {'Асуулт'}
                            </Label>
                            <Input
                                id='question'
                                name='question'
                                bsSize='sm'
                                placeholder={t('Асуултаа бичнэ үү')}
                                type='text'
                                value={questionText || ''}
                                onChange={(e) => changeQuestion(titleIndex, idx, e.target.value, e.target.name)}
                            />
                        </Col>
                    </Row>

                    {kind == KIND_RATING ? (
                        <>
                            <Row>
                                <Col md={6} sm={12} className='mt-1'>
                                    <Label htmlFor='rating_max_count'>{t('Үнэлгээний дээд тоо')}</Label>
                                    <Input
                                        type='number'
                                        bsSize='sm'
                                        disabled={!isFirstRatingQuestion}
                                        name='rating_max_count'
                                        id='rating_max_count'
                                        placeholder='Үнэлгээний дээд тоо'
                                        value={rating_max_count}
                                        onChange={(e) => changeQuestion(titleIndex, idx, e.target.value, e.target.name)}
                                    />
                                </Col>
                            </Row>
                            {rating_words?.map((rating_word, i) => (
                                <Row key={i}>
                                    <Col md={6} sm={12} className='mt-1'>
                                        <Label htmlFor={`rating_words_${i}`}>
                                            {i + 1} {t('үнэлгээг илэрхийлэх үг')}
                                        </Label>
                                        <Input
                                            type='text'
                                            name={`rating_words_${i}`}
                                            bsSize='sm'
                                            disabled={!isFirstRatingQuestion}
                                            placeholder={`${i + 1} ${t('үнэлгээг илэрхийлэх үг')}`}
                                            value={rating_word}
                                            onChange={(e) => onHandleRatingWordChange(titleIndex, idx, i, e.target.value, rating_words)}
                                        />
                                    </Col>
                                </Row>
                            ))}
                        </>
                    ) : (
                        <></>
                    )}
                </Row>
            </div>
        </div>
    )
}

export default Question
