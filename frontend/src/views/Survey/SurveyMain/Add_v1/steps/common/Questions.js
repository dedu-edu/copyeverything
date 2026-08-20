import React, { useState, memo, useEffect } from 'react'
import { Plus, X } from 'react-feather'
import { Label, Input, Row, Col, Button, FormFeedback, Badge } from 'reactstrap'
import Select from 'react-select'
import classnames from "classnames";
import { useTranslation } from 'react-i18next';

import { ReactSelectStyles, get_questionype } from "@utils"
import empty from "@src/assets/images/empty-image.jpg"

import ChoiceInput from './ChoiceInput';
import '../style.css'

import { KIND_ONE_CHOICE, KIND_MULTI_CHOICE, KIND_BOOLEAN, KIND_RATING, KIND_TEXT } from "@utils";

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
    const cvalues = {
        choices: '',
        image: '',
    }

    const { t } = useTranslation()

    const [qtypeOption, setQtypeOption] = useState(get_questionype())
    const [questionsMarkup, setQuestionsMarkup] = useState(<></>)

    // Rating word onChange
    const onHandleRatingWordChange =
        (index, rating_word_idx, value, rating_words) => {
            const newRatingWords = [...rating_words]
            newRatingWords[rating_word_idx] = value
            changeQuestion(titleIndex, index, newRatingWords, 'rating_words')
        }

    // Зураг дээр дарахад
    const clickLogoImage =
        (idx) => {
            var logoInput = document.getElementById(`logoInput${idx}`)

            logoInput.click()
        }

    function displayQuestions() {
        setQuestionsMarkup(questions?.map((rowsData, idx) => {

            const { kind: rowsDataKind, question, image, imagePreview, rating_max_count: rowsDataRatingMaxCount, rating_words: rowsDataRatingWords, max_choice_count, choices: rowDataChoices } = rowsData;
            let rating_max_count = rowsDataRatingMaxCount
            let kind = rowsDataKind
            let rating_words = rowsDataRatingWords
            let choices = rowDataChoices ?? []

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

                            <Row>
                                <Col md={6} className='mt-1'>
                                    <div className="d-flex custom-flex">
                                        <div className="me-2">
                                            <div className='d-flex justify-content-end' onClick={() => { changeQuestion(titleIndex, idx, '', 'image') }}>
                                                <X size={15} color='red' className=''></X>
                                            </div>
                                            <div className="orgLogoDiv image-responsive">
                                                <img id={`logoImg${idx}`} className="image-responsive" src={imagePreview ? imagePreview : image ? image : empty} onClick={() => { clickLogoImage(`${titleIndex}-${idx}`) }}
                                                    onError={({ currentTarget }) => {
                                                        currentTarget.onerror = null; // prevents looping
                                                        currentTarget.src = empty;
                                                    }}
                                                />
                                                <input
                                                    accept="image/*"
                                                    type="file"
                                                    id={`logoInput${titleIndex}-${idx}`}
                                                    name="image"
                                                    className="form-control d-none image-responsive"
                                                    onChange={(e) => changeQuestion(titleIndex, idx, e.target.files, e.target.name)}
                                                />
                                            </div>
                                        </div>
                                    </div>
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
                                    kind == KIND_TEXT
                                        ?
                                        null
                                        :
                                        kind == KIND_BOOLEAN
                                            ?
                                            <Col md={6} sm={12} className='mt-1'>
                                                {
                                                    ['Тийм', 'Үгүй'].map((text, tidx) =>
                                                        <div className="form-check mt-1" key={tidx}>
                                                            <Input
                                                                className="form-check-input mb-1"
                                                                type="radio"
                                                                name='yes_or_no'
                                                                defaultChecked={false}
                                                                disabled
                                                            />
                                                            <Label className="form-check-label">{text}</Label>
                                                        </div>
                                                    )
                                                }
                                            </Col>
                                            :

                                            <Col md={6} sm={12} className='mt-1'>
                                                {(kind == KIND_MULTI_CHOICE && kind != KIND_BOOLEAN) &&
                                                    <Col className='my-1' md={6} sm={12}>
                                                        <Label htmlFor="max_choice_count">Сонголтын хязгаар</Label>
                                                        <Input
                                                            type='number'
                                                            bsSize='sm'
                                                            invalid={errors && errors.max_choice_count ? true : false}
                                                            name='max_choice_count'
                                                            defaultValue={max_choice_count}
                                                            onChange={(e) => changeQuestion(titleIndex, idx, e.target.value, e.target.name)}
                                                            placeholder='Сонголтын хязгаар'
                                                        />
                                                        {errors && errors.max_choice_count && <FormFeedback className='d-block'>{errors.max_choice_count.message}</FormFeedback>}
                                                    </Col>
                                                }
                                                {
                                                    (kind == KIND_ONE_CHOICE || kind == KIND_MULTI_CHOICE) && kind != KIND_BOOLEAN ?
                                                        <>
                                                            <div className='d-flex justify-content-start'>
                                                                <Label>Хариултын утгууд</Label>
                                                                {
                                                                    !isEdit &&
                                                                        <Badge color='light-primary' pill className='ms-1' onClick={() => { changeQuestion(titleIndex, idx, [...choices, cvalues], 'choices') }} >
                                                                            <Plus size={15} />
                                                                        </Badge>
                                                                }
                                                            </div>
                                                            <ChoiceInput
                                                                questionIndex={idx}
                                                                choices={choices}
                                                                errors={errors?.choices}
                                                                changeQuestion={changeQuestion}
                                                                titleIndex={titleIndex}
                                                                isEdit={isEdit}
                                                            />
                                                        </>
                                                        : <></>
                                                }
                                            </Col>
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
