import { MinusCircle, X, } from 'react-feather'
import { Controller, useFormContext } from 'react-hook-form'
import {
    Row,
    Col,
    Input,
} from 'reactstrap'

import { useTranslation } from 'react-i18next';
import { buildFilePath, formFieldNames, KIND_BOOLEAN, KIND_MULTI_CHOICE, KIND_ONE_CHOICE } from '@src/views/RemoteLesson/utils';
import empty from "@src/assets/images/empty-image.jpg";
import { useVisibleFields } from '@src/views/RemoteLesson/hooks/useVisibleFields';

export default function Answers(props) {
    const { fieldIndex, fieldName, fieldAppend, fieldRemove, fieldsAnswer, fieldItem, questionKindState, visibleFieldsRef } = props
    const { t } = useTranslation()
    const { control, formState: { errors } } = useFormContext()

    return (
        <>
            <Row className={'g-0 gx-50'}>
                <Col md={12} className={'d-flex justify-content-between'}>
                    <h6>
                        {t('Хариулт')}: {String.fromCharCode(64 + parseInt(fieldIndex + 1, 10))}
                    </h6>
                    {

                        questionKindState == KIND_BOOLEAN ?
                            null
                            :
                            <MinusCircle className='text-danger cursor-pointer' size={18} onClick={() => { fieldRemove(fieldIndex) }} />
                    }

                </Col>
                <Col md={questionKindState == KIND_BOOLEAN ? 12 : 6} className=''>
                    <Controller
                        defaultValue=''
                        control={control}
                        id={`${fieldName}.value`}
                        name={`${fieldName}.value`}
                        render={({ field }) => {
                            useVisibleFields(field.name, visibleFieldsRef)

                            return (
                                <Input
                                    {...field}
                                    id={`${fieldName}.value`}
                                    name={`${fieldName}.value`}
                                    bsSize="sm"
                                    placeholder={t("Хариултаа бичнэ үү")}
                                    type="textarea"
                                    disabled={questionKindState == KIND_BOOLEAN}
                                />
                            )
                        }}
                    />
                    {[KIND_ONE_CHOICE, KIND_MULTI_CHOICE].includes(questionKindState) &&
                        <div className='mt-50'>
                            <Controller
                                defaultValue=''
                                control={control}
                                name={`${fieldName}.${formFieldNames.quezChoices.score}`}
                                render={({ field }) => {
                                    useVisibleFields(field.name, visibleFieldsRef)

                                    return (
                                        <Input
                                            {...field}
                                            id={field.name}
                                            bsSize="sm"
                                            placeholder={t("Зөв хариултын оноо")}
                                            type="number"
                                        />
                                    )
                                }}
                            />
                        </div>
                    }
                </Col>
                {[KIND_ONE_CHOICE, KIND_MULTI_CHOICE].includes(questionKindState) &&
                    <Col md={6}>
                        <Controller
                            defaultValue=''
                            control={control}
                            id={`${fieldName}.image`}
                            name={`${fieldName}.image`}
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
                                                    <img className='' id={`logoImg${fieldName}${fieldIndex}`} src={value?.preview ? buildFilePath(value?.preview) : value ? value : empty} style={{ pointerEvents: "none", width: "100%", maxHeight: "240px", objectFit: "contain" }} />
                                                    :
                                                    <div className='text-center py-25' style={{ pointerEvents: "none" }}>
                                                        {t('Зураг нэмэх')}
                                                    </div>
                                            }

                                            <input
                                                accept="image/*"
                                                type="file"
                                                id={`${fieldName}.image`}
                                                name={`${fieldName}.image`}
                                                className="form-control d-none"
                                                style={{ pointerEvents: "none" }}
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
                }
            </Row>
        </>
    )
}
