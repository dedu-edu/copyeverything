import React, { useEffect, useState } from "react";
import {
    Button, Label, Modal, ModalBody, ModalHeader,
} from "reactstrap";
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Controller, useForm } from 'react-hook-form';
import { ReactSelectStyles } from "@utils";
import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import classnames from "classnames";
import { useNavigate } from "react-router-dom";

function SignatureModal({ isOpen, handleModal, data, isMon, isTrue=false, isGpa=false, isScore=false, onSaved }) {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const { control, formState: { errors } } = useForm();
    const [signatureOption, setSignatureOption] = useState([]);
    const [selectedSignatures, setSelectedSignatures] = useState([]);
    const { isLoading, fetchData } = useLoader({ isSmall: true });

    const signatureApi = useApi().signature

    useEffect(() => {
        getSignatureOptions()
    }, [])

    async function getSignatureOptions() {
        const { success, data } = await fetchData(signatureApi.get(1))
        if (success) {
            setSignatureOption(data)
        }
    }

    const handleSave = () => {
        if (onSaved) {
            onSaved(selectedSignatures)
            return
        }

        const studentId =
            data?.student?.id ||
            data?.student?.code ||
            data?.student?.student_code ||
            Date.now()

        const key = `student_data_${studentId}`

        sessionStorage.setItem(key, JSON.stringify(data))
        sessionStorage.setItem(`${key}_signature`, JSON.stringify(selectedSignatures))

        if (isTrue) {
            const url = isMon
                ? `/student/learning-true/?key=${key}`
                : `/student/learning-true/en/?key=${key}`

            window.open(url, '_blank')
            return
        }

        if (isGpa) {
            isMon
                ? navigate('/student/sum/', { state: { data, signatureData: selectedSignatures } })
                : navigate('/student/sum/en/', { state: { data, signatureData: selectedSignatures } })
            return
        }

        if (isScore) {
            isMon
                ? navigate('/student/amount-details', { state: { data, signatureData: selectedSignatures } })
                : navigate('/student/amount-details/en', { state: { data, signatureData: selectedSignatures } })
            return
        }
    }
    // const handleSave = () => {

    //     sessionStorage.setItem('signature_data', JSON.stringify(selectedSignatures));


    //     if (onSaved) {
    //         onSaved(selectedSignatures)
    //         return
    //     }

    //     sessionStorage.clear()
    //     sessionStorage.setItem('student_data', JSON.stringify(data));
    //     sessionStorage.setItem('signature_data', JSON.stringify(selectedSignatures));

    //     if (isTrue) {
    //         isMon ? window.open('/student/learning-true/') : window.open('/student/learning-true/en/')
    //     }
    //     if (isGpa) {
    //         isMon ? navigate('/student/sum/', { state: { data, signatureData: selectedSignatures } })
    //               : navigate('/student/sum/en/', { state: { data, signatureData: selectedSignatures } })
    //     }
    //     if (isScore) {
    //         isMon ? navigate('/student/amount-details', { state: { data, signatureData: selectedSignatures } })
    //               : navigate('/student/amount-details/en', { state: { data, signatureData: selectedSignatures } })
    //     }
    // };

    return (
        <Modal size='sm' isOpen={isOpen} toggle={handleModal} className="modal-dialog-centered" onClosed={handleModal}>
            <ModalHeader toggle={handleModal}>
                {t("Гарын үсэг сонгох")}
            </ModalHeader>
            <ModalBody>
                <Label className="form-label" for="signature">
                    {t("Гарын үсэг")}
                </Label>
                <Controller
                    control={control}
                    defaultValue=''
                    name="signature"
                    render={({ field: { value, onChange } }) => (
                        <Select
                            name="signature"
                            id="signature"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select', { 'is-invalid': errors.signature })}
                            isLoading={isLoading}
                            isMulti
                            placeholder={t("-- Сонгоно уу --")}
                            options={signatureOption || []}
                            value={selectedSignatures}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(selectedOptions) => {
                                const selected = selectedOptions || [];
                                setSelectedSignatures(selected);
                                onChange(selected.map(option => option.id));
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => `${option.position_name} - ${option.last_name}, ${option.first_name}`}
                        />
                    )}
                />
                <div className="d-flex gap-1 justify-content-end">
                    <Button color="primary" size="sm" className="mt-1" onClick={handleSave}>
                        {t("Сонгох")}
                    </Button>
                    <Button onClick={handleModal} size="sm" className="mt-1">
                        {t("Буцах")}
                    </Button>
                </div>
            </ModalBody>
        </Modal>
    );
}

export default SignatureModal;