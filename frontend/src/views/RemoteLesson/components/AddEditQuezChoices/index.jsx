import '@styles/react/libs/flatpickr/flatpickr.scss';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import { Controller, useForm } from "react-hook-form";

import {
    Button,
    Col,
    Form,
    FormFeedback,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from "reactstrap";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import empty from "@src/assets/images/empty-image.jpg";
import { onChangeFile } from '@src/views/RemoteLesson/utils';
import { convertDefaultValue } from "@utils";

const formFieldNames = {
    choices: 'choices',
    image: 'image',
    score: 'score',
}

export default function AddEditQuezChoices({
    open,
    handleModal: handleModalOriginal,
    refreshDatas,
    quezQuestionsId,
    editData,
}) {
    const { control, handleSubmit, setError, setValue, reset, formState: { errors }, watch } = useForm({
        defaultValues: {
            ...Object.keys(formFieldNames).reduce((acc, current) => {
                acc[current] = ''
                return acc
            }, [{}])
        }
    })

    const handleModal = () => {
        reset()
        handleModalOriginal()
    }

    const formValues = watch()
    const { fetchData, isLoading, Loader } = useLoader({ isFullScreen: true });
    const { Loader: LoaderNotFullScreen } = useLoader({});

    const LoaderNotFullScreenAdaptive =
        <>
            <style>
                {`
                    .overrided-loader-style .background-glassmd {
                        height: unset;
                    }
                `}
            </style>
            <div className='overrided-loader-style'>{LoaderNotFullScreen}</div>
        </>

    const remoteApi = useApi().remote

    useEffect(() => {
        Object.entries(editData ?? {}).forEach(([key, value]) => setValue(key, value))
    }, [editData])

    async function onSubmit(cdata) {
        cdata['quezQuestionsId'] = quezQuestionsId
        cdata = convertDefaultValue(cdata)
        const formData = new FormData()
        formData.append('json_data', JSON.stringify(cdata))
        formData.append('image', cdata['image']?.[0] ?? '')
        let apiFunc = null

        if (editData) apiFunc = () => remoteApi.quezChoices.put(formData, editData.id)
        else apiFunc = () => remoteApi.quezChoices.post(formData)

        const { success, errors } = await fetchData(apiFunc())

        if (success) {
            reset()
            refreshDatas()
            handleModal()

        } else {
            /** Алдааны мессеж */
            for (const key in errors) {
                setError(key, { type: 'custom', message: errors[key].join('. ') });
            }
        }
    }

    // #region to save file
    const [image_old, setImageOld] = useState(formValues?.image)
    const [isLoadingImage, setIsLoadingImage] = useState(false)

    useEffect(() => {
        if (formValues?.image && !image_old) {
            setImageOld(formValues?.image)
            setIsLoadingImage(true)
        }
    }, [formValues?.image])

    const handleDeleteImage = () => {
        setImageOld('')
        setValue(formFieldNames.image, '')
        setIsLoadingImage(false)
    }

    const clickLogoImage = () => {
        const logoInput = document.getElementById(formFieldNames.image)
        logoInput.click()
    }
    // #endregion

    return (
        <Modal
            isOpen={open}
            toggle={handleModal}
            className="modal-dialog-centered modal-lg"
            contentClassName="pt-0"
            fade={true}
            backdrop='static'
        >
            <ModalHeader className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }} tag={'div'} toggle={handleModal}>
                <h4 className='modal-title'>
                    {
                        editData !== undefined
                            ?
                            t('Хариулт засах')
                            :
                            t('Хариулт нэмэх')
                    }
                </h4>
            </ModalHeader>
            <ModalBody className="flex-grow-50 mb-3 t-0">
                {isLoading && Loader}
                <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                    <Col md={12}>
                        <Label className='form-label' for={formFieldNames.choices}>
                            {t('Сонголт')}
                        </Label>
                        <Controller
                            control={control}
                            name={formFieldNames.choices}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type='text'
                                    id={field.name}
                                    bsSize='sm'
                                    placeholder={t('Сонголт')}
                                    invalid={errors[field.name] && true}
                                />
                            )}
                        />
                        {errors[formFieldNames.choices] && <FormFeedback className='d-block'>{t(errors[formFieldNames.choices].message)}</FormFeedback>}
                    </Col>
                    <Col md={6} className="mt-50">
                        <Label className="form-label" for={formFieldNames.score}>
                            {t('Зөв хариултын оноо')}
                        </Label>
                        <Controller
                            control={control}
                            name={formFieldNames.score}
                            render={({ field }) => {
                                return (
                                    <Input
                                        {...field}
                                        type='number'
                                        id={field.name}
                                        bsSize='sm'
                                        placeholder={t('Зөв хариултын оноо')}
                                        invalid={errors[field.name] && true}
                                    />
                                )
                            }}
                        ></Controller>
                        {errors[formFieldNames.score] && <FormFeedback className='d-block'>{t(errors[formFieldNames.score].message)}</FormFeedback>}
                    </Col>
                    <Col md={12} className="mt-50">
                        <Label for={formFieldNames.image} className='d-block text-center'><span>{t('Зураг')}</span></Label>
                        <Row>
                            <Col className='d-flex justify-content-center'>
                                <div>
                                    <div className='d-flex justify-content-end'>
                                        <X size={15} color='red' onClick={() => { handleDeleteImage(image_old) }}></X>
                                    </div>
                                    <div className="orgLogoDiv image-responsive position-relative">
                                        {isLoadingImage && LoaderNotFullScreenAdaptive}
                                        <img className="image-responsive w-100" src={image_old} onClick={() => { clickLogoImage() }}
                                            onLoad={() => setIsLoadingImage(false)}
                                            onError={({ currentTarget }) => {
                                                currentTarget.onerror = null; // prevents looping
                                                currentTarget.src = empty;
                                                setIsLoadingImage(false)
                                            }}
                                        />
                                        <Controller
                                            control={control}
                                            name={formFieldNames.image}
                                            render={({ field }) => (
                                                <input
                                                    accept="image/*"
                                                    type="file"
                                                    id={field.name}
                                                    name={field.name}
                                                    className="form-control d-none image-responsive"
                                                    onChange={(e) => {
                                                        field.onChange(e.target.files)
                                                        onChangeFile(e, setImageOld)
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col md={12} className="text-center mt-2">
                        <Button className='me-2' color="primary" type="submit">
                            {t('Хадгалах')}
                        </Button>
                        <Button color="secondary" outline type="reset" onClick={() => handleModal()}>
                            {t('Буцах')}
                        </Button>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    )
}