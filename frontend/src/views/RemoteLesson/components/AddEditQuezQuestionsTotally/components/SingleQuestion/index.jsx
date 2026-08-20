import { FilePlus, MinusCircle, Plus, X } from 'react-feather'
import { Controller, useFormContext, useFieldArray, useWatch } from 'react-hook-form'
import { Fragment, useRef, useState } from 'react'
import Select from 'react-select'
import classnames from "classnames";
import {
    Button,
    Row,
    Col,
    Label,
    Input,
    UncontrolledTooltip,
    FormFeedback
} from 'reactstrap'

import { ReactSelectStyles } from "@utils"
import { useTranslation } from 'react-i18next';

import empty from "@src/assets/images/empty-image.jpg"
import Answers from './Answers';
import { buildFilePath, formFieldNames, KIND_BOOLEAN, KIND_MULTI_CHOICE, KIND_ONE_CHOICE, KIND_RATING, kindOptions } from '@src/views/RemoteLesson/utils';
import { useVisibleFields } from '@src/views/RemoteLesson/hooks/useVisibleFields';

export default function SingleQuestion(props) {
    const { fieldIndex, fieldName, fieldAppend, fieldRemove, visibleFieldsRef } = props

    const [qtypeOption, setTypeOption] = useState(kindOptions)

    const { control, formState: { errors }, getValues, setError, clearErrors, setValue } = useFormContext()
    const { t } = useTranslation()

    const { fields: fieldsAnswer, remove: removeAnswer, append: appendAnswer } = useFieldArray({
        control,
        name: `${fieldName}[${fieldIndex}].answers`
    });


    const questionKindState = useWatch({
        control,
        name: `${fieldName}[${fieldIndex}].kind`,
    })
    const questionAnswersState = useWatch({
        control,
        name: `${fieldName}[${fieldIndex}].answers`,
    })


    function removeItem(index) {
        fieldRemove(index)
    }

    function addAnswer() {
        const datas = getValues()
        if (datas[fieldName][fieldIndex]['kind'] === '') {
            setError(`${fieldName}[${fieldIndex}].kind`, { message: 'Хоосон байна' })
        } else {
            appendAnswer({ value: "", image: "", is_correct: false })
        }

    }

    function duplicateQuestion(index) {
        const que = getValues(`${fieldName}[${index}]`)
        fieldAppend(que)
    }

    return (
        <Row className='g-0 gx-1 border border-primary border-2  rounded py-1 px-50'>
            <Col md={12} className='d-flex justify-content-between'>
                <div className='d-flex'>
                    <h4 className='mb-0'>
                        {t('Асуулт')}-{fieldIndex + 1}
                    </h4>
                </div>
                <div>
                    <span className='cursor-pointer' onClick={() => { duplicateQuestion(fieldIndex) }}>
                        <FilePlus id={"duplicateIcon" + fieldIndex} />
                        <UncontrolledTooltip
                            placement="top"
                            target={"duplicateIcon" + fieldIndex}
                        >
                            {t('Хуулах')}
                        </UncontrolledTooltip>
                    </span>
                    <span className='ms-50 text-danger cursor-pointer' onClick={() => { removeItem(fieldIndex) }}>
                        <MinusCircle id={"removeIcon" + fieldIndex} />
                        <UncontrolledTooltip
                            placement="top"
                            target={"removeIcon" + fieldIndex}
                        >
                            {t('Устгах')}
                        </UncontrolledTooltip>
                    </span>
                </div>
            </Col>
            <Col md={12} className={'mb-1'}>
                <Row className={'g-0 gx-1'}>
                    <Col md={6} className=''>
                        <Label className="form-label">
                            {t('Асуулт')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            name={`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.question}`}
                            render={({ field }) => {
                                useVisibleFields(field.name, visibleFieldsRef)

                                return (
                                    <Input
                                        {...field}
                                        id={field.name}
                                        bsSize="sm"
                                        placeholder={t('Асуултаа бичнэ үү')}
                                        type="textarea"
                                        invalid={errors[field.name] && true}
                                    />
                                )
                            }}
                        />
                    </Col>
                    <Col md={6} className=''>
                        <Label className="form-label" for="kind">
                            {t('Асуултын төрөл')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            name={`${fieldName}[${fieldIndex}].kind`}
                            render={({ field: { value, onChange, name } }) => {
                                useVisibleFields(name, visibleFieldsRef)

                                return (
                                    <Select
                                        id={`${fieldName}[${fieldIndex}].kind`}
                                        name={`${fieldName}[${fieldIndex}].kind`}
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors?.[fieldName]?.[fieldIndex]?.['kind'] })}
                                        options={qtypeOption}
                                        value={qtypeOption.find((c) => c.id === value) || ''}
                                        placeholder={`-- ${t('Сонгоно уу')} --`}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')

                                            if (val) {
                                                clearErrors(`${fieldName}[${fieldIndex}].kind`)
                                            } else {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                            }

                                            if (val?.id == KIND_ONE_CHOICE || val?.id == KIND_MULTI_CHOICE) {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                                appendAnswer([
                                                    { value: '', image: '', is_correct: false },
                                                    { value: '', image: '', is_correct: false },
                                                    { value: '', image: '', is_correct: false },
                                                    { value: '', image: '', is_correct: false }
                                                ])
                                            } else if (val?.id == KIND_BOOLEAN) {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                                appendAnswer([{ value: t('Тийм'), image: '', is_correct: false }, { value: t('Үгүй'), image: '', is_correct: false }])
                                            } else if (val?.id == KIND_RATING) {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                                appendAnswer([
                                                    { value: t('Маш муу'), image: '', is_correct: false },
                                                    { value: t('Муу'), image: '', is_correct: false },
                                                    { value: t('Сайн'), image: '', is_correct: false },
                                                    { value: t('Маш Сайн'), image: '', is_correct: false }
                                                ])
                                            } else {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                    </Col>
                    <Col md={6} className='mt-50'>
                        <Controller
                            defaultValue=''
                            control={control}
                            id={`${fieldName}[${fieldIndex}].image`}
                            name={`${fieldName}[${fieldIndex}].image`}
                            render={({ field: { value, onChange, name } }) => {
                                useVisibleFields(name, visibleFieldsRef)

                                return (
                                    <div className="">
                                        <div className='d-flex justify-content-end' onClick={() => { onChange('') }}>
                                            <X size={15} color='red' className='cursor-pointer'></X>
                                        </div>
                                        <div className="rounded cursor-pointer" style={value ? { maxHeight: "250px", border: "dashed 1px gray" } : { border: "dashed 1px gray" }} onClick={(e) => { e.target?.lastChild?.click() }}>
                                            {
                                                value?.preview ?
                                                    <img className='' id={`logoImg${fieldName}${fieldIndex}`} src={value?.preview ? buildFilePath(value?.preview) : value ? value : empty} style={{ pointerEvents: "none", width: "100%", maxHeight: "240px", objectFit: "contain" }}
                                                        onError={({ currentTarget }) => {
                                                            currentTarget.onerror = null; // prevents looping
                                                            currentTarget.src = empty;
                                                        }}
                                                    />
                                                    :
                                                    <div className='text-center py-25' style={{ pointerEvents: "none" }}>
                                                        {t('Зураг нэмэх')}
                                                    </div>
                                            }

                                            <input
                                                accept="image/*"
                                                type="file"
                                                id={`${fieldName}[${fieldIndex}].image`}
                                                name={`${fieldName}[${fieldIndex}].image`}
                                                className="form-control d-none"
                                                style={{}}
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        let file = e.target.files[0]
                                                        Object.assign(file, {
                                                            preview: URL.createObjectURL(file)
                                                        })
                                                        onChange(file)
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            }}
                        />
                    </Col>
                    <Col md={6} className=''>
                        <Label className="form-label" for="score">
                            {t('Асуултын оноо')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            id={`${fieldName}[${fieldIndex}].score`}
                            name={`${fieldName}[${fieldIndex}].score`}
                            render={({ field }) => {
                                useVisibleFields(field.name, visibleFieldsRef)

                                return (
                                <Input
                                    {...field}
                                    id={`${fieldName}[${fieldIndex}].score`}
                                    name={`${fieldName}[${fieldIndex}].score`}
                                    bsSize="sm"
                                    placeholder={t("Асуултын оноо")}
                                    type="number"
                                    invalid={errors?.[fieldName]?.[fieldIndex]?.['score'] && true}
                                />
                            )
                            }}
                        />
                    </Col>
                    {[KIND_MULTI_CHOICE].includes(questionKindState) &&
                        <Col md={6} className=''>
                            <Label className="form-label">
                                {t('Сонголтын хязгаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name={`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.max_choice_count}`}
                                render={({ field }) => {
                                    useVisibleFields(field.name, visibleFieldsRef)

                                    return (
                                    <Input
                                        {...field}
                                        id={field.name}
                                        bsSize="sm"
                                        placeholder={t("Сонголтын хязгаар")}
                                        type="number"
                                        invalid={errors?.[fieldName]?.[fieldIndex]?.[formFieldNames.quezQuestions.max_choice_count] && true}
                                    />
                                )
                                }}
                            />
                        </Col>
                    }
                </Row>
            </Col>
            {
                [KIND_ONE_CHOICE, KIND_MULTI_CHOICE, KIND_RATING, KIND_BOOLEAN].includes(questionKindState) &&
                <Col md={12} className={' '}>
                    {[KIND_BOOLEAN].includes(questionKindState) &&
                        <div className='d-flex justify-content-between'>
                            <h5 className=''>{t('Хариултын утгууд')}</h5>
                            <div className='d-flex'>
                                <span style={{ fontSize: "12px" }}>{t('Зөв хариулт сонгоно уу')}: </span>
                                <div>
                                    {
                                        fieldsAnswer.length > 0 && Array(fieldsAnswer.length).fill('').map((v, idx) => {
                                            return (
                                                <Fragment key={idx}>
                                                    <span
                                                        className={`ms-50 cursor-pointer p-25 py-0 ${questionAnswersState[idx]?.is_correct == true ? 'border-success bg-light-success' : 'border-secondary'}`}
                                                        style={{ borderRadius: "50%", fontSize: "12px", fontWeight: "bold" }}
                                                        onClick={() => {
                                                            if (questionAnswersState[idx]?.is_correct == true) {
                                                                setValue(`${fieldName}[${fieldIndex}].answers[${idx}].is_correct`, false)
                                                            } else {
                                                                setValue(`${fieldName}[${fieldIndex}].answers[${idx}].is_correct`, true)
                                                                if (questionKindState != 2) {
                                                                    questionAnswersState.forEach((v, vIdx) => {
                                                                        if (idx != vIdx) {
                                                                            setValue(`${fieldName}[${fieldIndex}].answers[${vIdx}].is_correct`, false)
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {String.fromCharCode(64 + parseInt(idx + 1, 10))}
                                                    </span>
                                                </Fragment>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    }
                    {[KIND_ONE_CHOICE, KIND_MULTI_CHOICE, KIND_BOOLEAN].includes(questionKindState) &&
                        <Row className={'g-0 '}>
                            <Col md={12}>
                                {
                                    fieldsAnswer.map((item, index) => {
                                        return (
                                            <Col className={`mb-1 p-50 border ${questionAnswersState[index]?.is_correct == true ? 'border-success border-2 bg-light-success' : 'border-2'} rounded`} md={12} key={item.id}>
                                                <Answers
                                                    fieldItem={item}
                                                    fieldsAnswer={fieldsAnswer}
                                                    fieldIndex={index}
                                                    fieldName={`${fieldName}[${fieldIndex}].answers[${index}]`}
                                                    fieldAppend={appendAnswer}
                                                    fieldRemove={removeAnswer}
                                                    questionKindState={questionKindState}
                                                    visibleFieldsRef={visibleFieldsRef}
                                                />
                                            </Col>
                                        )
                                    })
                                }

                            </Col>
                            {[KIND_ONE_CHOICE, KIND_MULTI_CHOICE].includes(questionKindState) &&
                                <Col md={12}>
                                    <Button className='w-100 align-items-center py-25' color='secondary' outline size='sm' onClick={() => { addAnswer() }}>
                                        <Plus className='' size={12} /> {t('Хариулт нэмэх')}
                                    </Button>
                                </Col>
                            }
                        </Row>
                    }
                    {
                        [KIND_RATING].includes(questionKindState) &&
                        <Row>
                            <Col md={6} className="mt-50 d-flex flex-column justify-content-between">
                                <Label className='form-label'>
                                    {t('Дээд үнэлгээг илэрхийлэх үг')}
                                </Label>
                                <Controller
                                    defaultValue={''}
                                    control={control}
                                    name={`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.high_rating_word}`}
                                    render={({ field }) => {
                                        useVisibleFields(field.name, visibleFieldsRef)

                                        return (
                                            <Input
                                                {...field}
                                                type='text'
                                                id={field.name}
                                                bsSize='sm'
                                                placeholder={t('Дээд үнэлгээг илэрхийлэх үг')}
                                                invalid={errors[field.name] && true}
                                            />
                                        )
                                    }}
                                />
                                {errors[`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.high_rating_word}`] && <FormFeedback className='d-block'>{t(errors[`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.high_rating_word}`].message)}</FormFeedback>}
                            </Col>
                            <Col md={6} className="mt-50 d-flex flex-column justify-content-between">
                                <Label className='form-label'>
                                    {t('Доод үнэлгээг илэрхийлэх үг')}
                                </Label>
                                <Controller
                                    defaultValue={''}
                                    control={control}
                                    name={`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.low_rating_word}`}
                                    render={({ field }) => {
                                        useVisibleFields(field.name, visibleFieldsRef)

                                        return (
                                            <Input
                                                {...field}
                                                type='text'
                                                id={field.name}
                                                bsSize='sm'
                                                placeholder={t('Доод үнэлгээг илэрхийлэх үг')}
                                                invalid={errors[field.name] && true}
                                            />
                                        )
                                    }}
                                />
                                {errors[`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.low_rating_word}`] && <FormFeedback className='d-block'>{t(errors[`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.low_rating_word}`].message)}</FormFeedback>}
                            </Col>
                            <Col md={6} className="mt-50 d-flex flex-column justify-content-between">
                                <Label className='form-label'>
                                    {t('Үнэлгээний дээд тоо')}
                                </Label>
                                <Controller
                                    defaultValue={''}
                                    control={control}
                                    name={`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.rating_max_count}`}
                                    render={({ field }) => {
                                        useVisibleFields(field.name, visibleFieldsRef)

                                        return (
                                            <Input
                                                {...field}
                                                type='number'
                                                id={field.name}
                                                bsSize='sm'
                                                placeholder={t('Үнэлгээний дээд тоо')}
                                                invalid={errors[field.name] && true}
                                            />
                                        )
                                    }}
                                />
                                {errors[`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.rating_max_count}`] && <FormFeedback className='d-block'>{t(errors[`${fieldName}[${fieldIndex}].${formFieldNames.quezQuestions.rating_max_count}`].message)}</FormFeedback>}
                            </Col>
                        </Row>
                    }
                </Col>
            }
        </Row>
    )
}
