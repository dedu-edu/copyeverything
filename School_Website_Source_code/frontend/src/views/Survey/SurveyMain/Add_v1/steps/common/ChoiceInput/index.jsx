import React, { useCallback, useState } from 'react'
import { Minus, X } from 'react-feather'

import {
    InputGroup,
    Input,
    InputGroupText,
    Popover,
    PopoverBody,
    Badge,
    FormFeedback
} from 'reactstrap'

import empty from "@src/assets/images/empty-image.jpg"

import '../../style.css'

function ChoiceInput({
    questionIndex,
    choices,
    errors,
    changeQuestion,
    titleIndex,
    isEdit
}) {
    const [popoverIdx, setPopoverIdx] = useState('')
    const [index_name, setIdx] = useState('')

    // Сонголтын зурагны popover
    const handlePopOver = useCallback(
        (cidx = '', idx = "") => {
            if (popoverIdx === cidx) {
                setPopoverIdx('')
            } else {
                setPopoverIdx(cidx)
            }
            setIdx(idx)
        }, [popoverIdx]
    )

    // Асуултын сонголт onChange
    const onHandleChoiceChange =
        (choiceIndex, value, name, choice) => {
            const newChoices = [...choices]
            const newChoice = { ...choice }
            newChoices[choiceIndex] = newChoice

            if (name == 'image') {
                if (value?.length > 0) {
                    newChoice['choices'] = 'Зураг'
                    newChoice['image'] = value[0]
                    newChoice['imagePreview'] = window.URL.createObjectURL(value[0])

                } else {
                    newChoice['image'] = ''
                    newChoice['imagePreview'] = ''
                }

                setPopoverIdx('')

            } else {
                newChoice[name] = value
            }

            changeQuestion(titleIndex, questionIndex, newChoices, 'choices')
        }

    // Сонголтын мөр устгах
    const removeChoice =
        (choiceIndex) => {
            const newChoices = [...choices]
            newChoices.splice(choiceIndex, 1)
            changeQuestion(titleIndex, questionIndex, newChoices, 'choices')
        }

    // Хариултын зураг дээр дарахад
    const clickAnswerImg =
        (idx) => {
            var logoImgInput = document.getElementById(`imgInput${idx}`)

            logoImgInput.click()
        }

    return (
        choices.map((choice, cidx) =>
            <div key={cidx}>
                <div className='d-flex justify-content-start'>
                    <InputGroup className='mt-1'>
                        <Input
                            type='text'
                            bsSize='sm'
                            name='choices'
                            invalid={errors && (Object.keys(errors).length > 0 && errors.idx === cidx) ? true : false}

                            disabled={choice?.image}
                            value={choice.choices}
                            onChange={(e) => onHandleChoiceChange(cidx, e.target.value, e.target.name, choice)}
                            placeholder='Сонголтын утга'
                        />
                        <InputGroupText onClick={() => { handlePopOver(cidx, questionIndex) }} id={`popover${cidx}${questionIndex}`}>
                            <i className="far fa-ellipsis-h"></i>
                        </InputGroupText>
                        {errors && (Object.keys(errors).length > 0 && errors.idx === cidx) && <FormFeedback className='d-block'>{errors.message}</FormFeedback>}

                    </InputGroup>

                    <Popover
                        placement="top"
                        isOpen={(cidx === popoverIdx && questionIndex === index_name)}
                        target={`popover${cidx}${questionIndex}`}
                        toggle={() => handlePopOver(cidx, questionIndex)}
                    >
                        <PopoverBody tag={'div'} className='d-flex justify-content-start flex-wrap '>
                            <small id="answerImg" onClick={() => clickAnswerImg(cidx)} className='link-primary text-decoration'>Зураг</small>
                            <input accept="image/*" type="file" id={`imgInput${cidx}`} name="image" className="form-control d-none" onChange={(e) => onHandleChoiceChange(cidx, e.target.files, e.target.name, choice)} />
                        </PopoverBody>
                    </Popover>

                    {
                        !isEdit &&
                            <div className='ms-1 mt-1'>
                                <Badge color='light-danger' pill onClick={() => { removeChoice(questionIndex, cidx) }}>
                                    <Minus size={15} />
                                </Badge>
                            </div>
                    }
                </div>
                {
                    choice?.image &&
                    <div className="d-flex custom-flex mt-1 ms-3">
                        <div className="d-flex justify-content-between">
                            <div className="choiceImgDiv " >
                                <img src={choice?.imagePreview ? choice?.imagePreview : choice?.image ? choice?.image : empty}
                                    onError={({ currentTarget }) => {
                                        currentTarget.onerror = null; // prevents looping
                                        currentTarget.src = empty;
                                    }}
                                />
                            </div>
                            <X size={15} color='red' onClick={() => { onHandleChoiceChange(cidx, null, 'image', choice) }}></X>
                        </div>
                    </div>
                }
            </div>
        )
    )
}

export default ChoiceInput
