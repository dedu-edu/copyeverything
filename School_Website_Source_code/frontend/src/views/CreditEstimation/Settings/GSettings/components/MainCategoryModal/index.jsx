// ** React imports
import React, { Fragment, useEffect } from 'react';
import { X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { Button, Col, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from "reactstrap";
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import '@styles/react/libs/flatpickr/flatpickr.scss';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validate } from "@utils";


export default function MainCategoryModal({ open, handleModal, refreshDatas, editData }) {
    const { t } = useTranslation()

    const validateSchema = Yup.object().shape({
        name: Yup.string()
            .trim()
            .required('Хоосон байна'),
    });

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm(validate(validateSchema));

    // Loader
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const professionCategoryApi = useApi().g_time.category

    // Хадгалах
    async function onSubmit(cdata) {
        let apiCall = null

        if (editData) apiCall = professionCategoryApi.put(cdata, cdata['id'])
        else apiCall = professionCategoryApi.post(cdata)

        const { success, error } = await postFetch(apiCall)

        if (success) {
            reset()
            refreshDatas()
            handleModal()

        } else if (error) {
            /** Алдааны мессэжийг input дээр харуулна */
            error.forEach(error_item => {
                const key = error_item?.field
                setError(key, { type: 'custom', message: error_item?.msg });
            })
        }
    }

    useEffect(() => {
        for (const key in editData) setValue(key, editData[key] === null ? '' : editData[key]);
    }, [])

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-sm"
                contentClassName="pt-0"
                backdrop='static'
            >
                <ModalHeader
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                    className='justify-content-between'
                >
                    <h5 className="modal-title">{editData ? t('Үндсэн категорын засах') : t('Үндсэн категорын бүртгэл')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col xs={12} sm={12}>
                            <Label className="form-label" for="name">
                                {t('Үндсэн төрөл нэр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        id={field.name}
                                        placeholder='Үндсэн төрөл нэр'
                                        type='textarea'
                                        invalid={errors[field.name] && true}
                                        {...field}
                                        bsSize="sm"
                                    />
                                )}
                            ></Controller>
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col xs={12} sm={12}>
                            <Label className="form-label">
                                {t('Дараалал')}
                            </Label>
                            <Controller
                                defaultValue=""
                                control={control}
                                name="order_no"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id={field.name}
                                        type="number"
                                        placeholder={t("Дараалал")}
                                        invalid={errors[field.name] && true}
                                    />
                                )}
                            />
                            {errors.order_no && <FormFeedback className='d-block'>{errors.order_no.message}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2 d-flex justify-content-center">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading && <Spinner size='sm' className='me-1' />}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" onClick={() => handleModal()}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};
