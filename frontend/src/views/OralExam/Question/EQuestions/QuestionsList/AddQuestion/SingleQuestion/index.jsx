import classnames from 'classnames'
import { useEffect, useState } from 'react'
import { FilePlus, MinusCircle } from 'react-feather'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { Col, Input, Label, Row, UncontrolledTooltip } from 'reactstrap'

import { get_levelseasons, ReactSelectStyles } from '@utils'

import { questionType } from '../../../../../constants'

export default function SingleQuestion(props) {
    const { fieldIndex, fieldName, fieldAppend, fieldRemove } = props

    const [difficultyLevelsOption] = useState(get_levelseasons())

    const {
        control,
        formState: { errors },
        getValues,
        setValue
    } = useFormContext()
    const { t } = useTranslation()

    function removeItem(index) {
        fieldRemove(index)
    }

    function duplicateQuestion(index) {
        const que = getValues(`${fieldName}[${index}]`)
        fieldAppend(que)
    }

    useEffect(() => {
        setValue(`${fieldName}[${fieldIndex}].kind`, questionType.find(item => item.name === 'Бичвэр')?.id || '')
    })

    return (
        <>
            <Row className='g-0 gx-1 border border-primary border-2  rounded py-1 px-50'>
                <Col md={12} className='d-flex justify-content-between'>
                    <div className='d-flex'>
                        <h4 className='mb-0'>
                            {t('Асуулт')}-{fieldIndex + 1}
                        </h4>
                    </div>
                    <div>
                        <span
                            className='cursor-pointer'
                            onClick={() => {
                                duplicateQuestion(fieldIndex)
                            }}
                        >
                            <FilePlus id={'duplicateIcon' + fieldIndex} />
                            <UncontrolledTooltip placement='top' target={'duplicateIcon' + fieldIndex}>
                                Хуулах
                            </UncontrolledTooltip>
                        </span>
                        <span
                            className='ms-50 text-danger cursor-pointer'
                            onClick={() => {
                                removeItem(fieldIndex)
                            }}
                        >
                            <MinusCircle id={'removeIcon' + fieldIndex} />
                            <UncontrolledTooltip placement='top' target={'removeIcon' + fieldIndex}>
                                Устгах
                            </UncontrolledTooltip>
                        </span>
                    </div>
                </Col>
                <Col md={12} className={'mb-1'}>
                    <Row className={'g-0 gx-1'}>
                        <Col md={6} className=''>
                            <Label className='form-label' for='question'>
                                {'Асуулт'}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id={`${fieldName}[${fieldIndex}].question`}
                                name={`${fieldName}[${fieldIndex}].question`}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id={`${fieldName}[${fieldIndex}].question`}
                                        name={`${fieldName}[${fieldIndex}].question`}
                                        bsSize='sm'
                                        placeholder='Асуултаа бичнэ үү'
                                        type='textarea'
                                        invalid={errors?.[fieldName]?.[fieldIndex]?.['question'] && true}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={3} className=''>
                            <Label className='form-label' for='level'>
                                {'Асуултын түвшин'}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id={`${fieldName}[${fieldIndex}].level`}
                                name={`${fieldName}[${fieldIndex}].level`}
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        id={`${fieldName}[${fieldIndex}].level`}
                                        name={`${fieldName}[${fieldIndex}].level`}
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors?.[fieldName]?.[fieldIndex]?.['level'] })}
                                        options={difficultyLevelsOption}
                                        value={difficultyLevelsOption.find((c) => c.id === value) || ''}
                                        placeholder={'-- Сонгоно уу --'}
                                        noOptionsMessage={() => 'Хоосон байна.'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={3} className=''>
                            <Label className='form-label' for='score'>
                                {'Асуултын оноо'}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id={`${fieldName}[${fieldIndex}].score`}
                                name={`${fieldName}[${fieldIndex}].score`}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id={`${fieldName}[${fieldIndex}].score`}
                                        name={`${fieldName}[${fieldIndex}].score`}
                                        bsSize='sm'
                                        placeholder='Асуултын оноо'
                                        type='number'
                                        invalid={errors?.[fieldName]?.[fieldIndex]?.['score'] && true}
                                    />
                                )}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}
