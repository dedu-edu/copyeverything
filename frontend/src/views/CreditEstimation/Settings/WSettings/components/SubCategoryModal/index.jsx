// ** React imports
import React, { Fragment, useEffect } from 'react';
import { X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { Button, Col, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from "reactstrap";
import { useTranslation } from 'react-i18next';

import '@styles/react/libs/flatpickr/flatpickr.scss';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import classNames from 'classnames';
import ScrollSelectFilter from '../ScrollSelectFilter';


export default function SubCategoryModal({ open, handleModal, refreshDatas, editData }) {
    const { t } = useTranslation()

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm();

    // Loader
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const professionalActivityApi = useApi().b_time

    // Хадгалах
    async function onSubmit(cdata) {
        cdata.category = cdata.category.id
        const { success, error } = await postFetch(professionalActivityApi.category.sub.put(cdata, cdata['id']))

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
        for (const key in editData) setValue(key, editData[key] === null ? '' : editData[key])
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
                    <h5 className="modal-title">{editData ? t('Sub категорын засах') : t('Sub категорын бүртгэл')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col>
                            <Row>
                                <Col>
                                    <Label className="form-label">
                                        {t('Үндсэн категор')}
                                    </Label>
                                    <Controller
                                        defaultValue=""
                                        control={control}
                                        name="category"

                                        // to exclude "ref" because message in browser's console: 'Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?"'
                                        render={({ field: { ref, ...rest } }) => (
                                            <ScrollSelectFilter
                                                {...rest}
                                                className={classNames('react-select', { 'is-invalid': errors[rest.name] })}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                                fieldName={rest.name}
                                                getApi={(pageLocal, searchTextLocal, recordsLimitPerPageLocal) => professionalActivityApi.category.get(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal)}
                                                optionValueFieldName={'id'}
                                                recordsLimitPerPage={50}
                                            />
                                        )}
                                    />
                                    {errors.category && <FormFeedback className='d-block'>{errors.category.message}</FormFeedback>}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Label className="form-label" for="name">
                                        {t('Шалгуурын нэршил')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        defaultValue=''
                                        name="name"
                                        render={({ field }) => (
                                            <Input
                                                id={field.name}
                                                type='textarea'
                                                placeholder='Шалгуурын нэршил'
                                                invalid={errors[field.name] && true}
                                                {...field}
                                                bsSize="sm"
                                            />
                                        )}
                                    ></Controller>
                                    {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Label className="form-label">
                                            {t('Хэмжих нэгж')}
                                        </Label>
                                        <Controller
                                            defaultValue=""
                                            control={control}
                                            name="value"
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id={field.value}
                                                    type="text"
                                                    invalid={errors[field.value] && true}
                                                />
                                            )}
                                        />
                                        {errors.value && <FormFeedback className='d-block'>{errors.value.message}</FormFeedback>}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Label className="form-label">
                                        {t('Оноо')}
                                    </Label>
                                    <Controller
                                        defaultValue=""
                                        control={control}
                                        name="score"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type="number"
                                                placeholder={t("Оноо")}
                                                invalid={errors[field.name] && true}
                                                bsSize="sm"
                                            />
                                        )}
                                    />
                                    {errors.score && <FormFeedback className='d-block'>{errors.score.message}</FormFeedback>}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
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
                            </Row>
                            <Row>
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
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};
