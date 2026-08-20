import React, { Fragment } from 'react'

import { useForm, Controller } from "react-hook-form";

import { t } from 'i18next';
import { X } from "react-feather";
import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback } from "reactstrap";
import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validate } from "@utils"

import { validateSchema } from './validateSchema';

export default function SignatureModal({ open, handleModal, refreshDatas, defaultDatas })
{

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // Hook
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

    // Api
    const signatureApi = useApi().signature

    /** Хадгалах дарах */
    async function onSubmit(cdata)
    {
        cdata['dedication_type'] = 2

        const { success, errors } = await fetchData(Object.keys(defaultDatas).length != 0 ? signatureApi.put(cdata, defaultDatas?.id) : signatureApi.post(cdata))
        if (success) {
            reset()
            handleModal()
            refreshDatas()
        }
        else if (errors && Object.keys(errors)?.length > 0)
        {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
    }


    console.log(defaultDatas?.previous_year, "defaultDatas?.previous_year")
    console.log(defaultDatas)

    return (
        <Fragment>
            { isLoading && Loader }
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
                style={{ maxWidth: '420px', width: '100%' }}
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Гарын үсэг зурах хүмүүс бүртгэл')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)} >
                        <Col md={12}>
                            <Controller
                                defaultValue={defaultDatas?.economic_security || false}
                                control={control}
                                id='economic_security'
                                name='economic_security'
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            checked={field.value}
                                            className='me-50'
                                            type='checkbox'
                                            name='economic_security'
                                            id='economic_security'
                                        />
                                    )
                                }}
                            />
                            <Label className='form-label' for='economic_security'>
                                {t('Эдийн засгийн аюулгүй байдал')}
                            </Label>
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="last_name">
                                {t('Овог (монгол)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.last_name || ''}
                                control={control}
                                id="last_name"
                                name="last_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="last_name"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('овог оруулна уу')}
                                        invalid={errors.last_name && true}
                                    />
                                )}
                            />
                            {errors.last_name && <FormFeedback className='d-block'>{t(errors.last_name.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="first_name">
                                {t('Нэр (монгол)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.first_name || ''}
                                control={control}
                                id="first_name"
                                name="first_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="first_name"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('нэр оруулна уу')}
                                        invalid={errors.first_name && true}
                                    />
                                )}
                            />
                            {errors.first_name && <FormFeedback className='d-block'>{t(errors.first_name.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="position_name">
                                {t('Албан тушаалын нэр "эрдмийн зэрэг цол" (монгол)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.position_name || ''}
                                control={control}
                                id="position_name"
                                name="position_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="position_name"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('албан тушаал оруулна уу')}
                                        invalid={errors.position_name && true}
                                    />
                                )}
                            />
                            {errors.position_name && <FormFeedback className='d-block'>{t(errors.position_name.message)}</FormFeedback>}
                        </Col>

                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="last_name_eng">
                                {t('Овог (англи)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.last_name_eng || ''}
                                control={control}
                                id="last_name_eng"
                                name="last_name_eng"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="last_name_eng"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('овог оруулна уу')}
                                        invalid={errors.last_name_eng && true}
                                    />
                                )}
                            />
                            {errors.last_name_eng && <FormFeedback className='d-block'>{t(errors.last_name_eng.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="first_name_eng">
                                {t('Нэр (англи)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.first_name_eng || ''}
                                control={control}
                                id="first_name_eng"
                                name="first_name_eng"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="first_name_eng"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('нэр оруулна уу')}
                                        invalid={errors.first_name_eng && true}
                                    />
                                )}
                            />
                            {errors.first_name_eng && <FormFeedback className='d-block'>{t(errors.first_name_eng.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="position_name_eng">
                                {t('Албан тушаалын нэр "эрдмийн зэрэг цол" (англи)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.position_name_eng || ''}
                                control={control}
                                id="position_name_eng"
                                name="position_name_eng"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="position_name_eng"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('албан тушаал оруулна уу')}
                                        invalid={errors.position_name_eng && true}
                                    />
                                )}
                            />
                            {errors.position_name_eng && <FormFeedback className='d-block'>{t(errors.position_name_eng.message)}</FormFeedback>}
                        </Col>

                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="last_name_uig">
                                {t('Овог (уйгаржин)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.last_name_uig || ''}
                                control={control}
                                id="last_name_uig"
                                name="last_name_uig"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="last_name_uig"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('овог оруулна уу')}
                                        style={{ fontFamily: 'CMSHRDP' }}
                                        invalid={errors.last_name_uig && true}
                                    />
                                )}
                            />
                            {errors.last_name_uig && <FormFeedback className='d-block'>{t(errors.last_name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="first_name_uig">
                                {t('Нэр (уйгаржин)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.first_name_uig || ''}
                                control={control}
                                id="first_name_uig"
                                name="first_name_uig"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="first_name_uig"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('нэр оруулна уу')}
                                        style={{ fontFamily: 'CMSHRDP' }}
                                        invalid={errors.first_name_uig && true}
                                    />
                                )}
                            />
                            {errors.first_name_uig && <FormFeedback className='d-block'>{t(errors.first_name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="position_name_uig">
                                {t('Албан тушаалын нэр "эрдмийн зэрэг цол" (уйгаржин)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.position_name_uig || ''}
                                control={control}
                                id="position_name_uig"
                                name="position_name_uig"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="position_name_uig"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('албан тушаал оруулна уу')}
                                        style={{ fontFamily: 'CMSHRDP' }}
                                        invalid={errors.position_name_uig && true}
                                    />
                                )}
                            />
                            {errors.position_name_uig && <FormFeedback className='d-block'>{t(errors.position_name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className="mt-1">
                            <Label className="form-label" for="previous_year">
                                {t('Хэрэв он оруулвал зөвхөн сонгосон жилийн диплодуудад нэр орно)')}
                                <br/>
                                {t('Хоосон бол бусад гарын үсэг зурах хүний бүртгэлгүй жилүүдэд хэрэглэгдэнэ')}
                            </Label>
                            <Controller
                                name="previous_year"
                                control={control}
                                defaultValue={defaultDatas?.previous_year || ''}
                                rules={{
                                    validate: (value) => {
                                        if (!value) return true; // allow empty
                                        const trimmed = value.trim();

                                        // strict format check
                                        if (!/^\d{4}-\d{4}$/.test(trimmed)) {
                                            return t('Формат yyyy-yyyy байх ёстой');
                                        }

                                        const [start, end] = trimmed.split('-').map(Number);

                                        // second year must not be smaller than first year
                                        if (end < start) return t('Хоёр дахь он эхний оноос бага байж болохгүй');

                                        return true;
                                    },
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="previous_year"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('жишээ: 2023-2024')}
                                        invalid={!!errors.previous_year}
                                        onInput={(e) => {
                                            // allow only digits and dash
                                            e.target.value = e.target.value.replace(/[^\d-]/g, '');
                                            field.onChange(e);
                                        }}
                                        maxLength={9} // YYYY-YYYY = 9 chars
                                    />
                                )}
                            />
                            {errors.previous_year && (
                                <FormFeedback className="d-block">
                                    {t(errors.previous_year.message)}
                                </FormFeedback>
                            )}
                        </Col>


                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
