import React, { useContext, useEffect, useState } from 'react';

import {
    Modal,
    ModalBody,
    ModalHeader,
    CardTitle,
    Col,
    Input,
    Label,
    Row,
    UncontrolledTooltip,
    Button,
    InputGroup,
    FormFeedback,
    Form
} from 'reactstrap';
import { useForm, Controller } from 'react-hook-form'

import { useTranslation } from 'react-i18next';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles, validate } from '@utils'
import AuthContext from '@context/AuthContext'
import Select from 'react-select'
import classnames from 'classnames'

import * as Yup from 'yup'

const Solved = ({is_open, solved_data, handleSolvedModal, getDatas}) => {
    const { t } = useTranslation()

    // states
    const [typeId, setType] = useState('')
    const { user } = useContext(AuthContext)

    const scienceApi = useApi().science.list
    const { isLoading, fetchData, Loader } = useLoader({})

    const validateSchema = Yup.object().shape({
        check_dep_state: Yup.string()
            .trim()
            .required('Хоосон байна'),
        check_dep_description: Yup.string()
            .trim()
            .required('Хоосон байна'),
    });

    const { control, handleSubmit, formState: { errors }, reset } = useForm(validate(validateSchema));
    const typeOption = [
        {
            'id': 1,
            'name': 'Баталгаажуулсан'
        },
        {
            'id': 2,
            'name': 'Буцаасан'
        },
    ]

    async function onSubmit (cdata) {
        if (cdata){
            const { success } = await fetchData(scienceApi.put(cdata))
            if (success) {
                getDatas()
                handleSolvedModal()
            }
        }
    }

    return (
            <Modal
                isOpen={is_open}
                toggle={handleSolvedModal}
                className="modal-dialog-centered modal-sm"
                keyboard={false}
                backdrop="static"
            >
            <ModalHeader>{'Эрдэм шинжилгээ'}</ModalHeader>
            <ModalBody>
                <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                <Col md={12}>
                    <Label>Шийдвэрийн төрөл</Label>
                    <Controller
                        control={control}
                        defaultValue=''
                        name="check_dep_state"
                        render={({ field: { value, onChange } }) => {
                            return (
                                <Select
                                    name="check_dep_state"
                                    id="check_dep_state"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select', {'is-invalid': errors.check_dep_state})}
                                    isLoading={isLoading}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={typeOption || []}
                                    value={typeOption.find((c) => c.id === value)}
                                    noOptionsMessage={() => t('Хоосон байна')}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                        setType(val?.id || '')
                                    }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                                />
                            )
                        }}
                    />
                    {errors.check_dep_state && <FormFeedback className='d-block'>{t(errors.check_dep_state.message)}</FormFeedback>}
                   </Col>
                   {
                    typeId == 2 &&
                    <Col md={12}>
                            <Label className="form-label" for="check_dep_description">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="check_dep_description"
                                name="check_dep_description"
                                render={({ field }) => (
                                    <Input
                                        id ="check_dep_description"
                                        bsSize="sm"
                                        placeholder={t('Тайлбар')}
                                        {...field}
                                        type="textarea"
                                        invalid={errors.check_dep_description && true}
                                    />
                                )}
                            />
                            {errors.check_dep_description && <FormFeedback className='d-block'>{errors.check_dep_description.message}</FormFeedback>}
                        </Col>
                   }
                    <Col md={12} className="mt-1 text-center">
                        <Button color="primary" type="submit">
                            {t('Хадгалах')}
                        </Button>
                        <Button className="ms-1"  type='reset' onClick={handleSolvedModal} outline>
                            {t('Буцах')}
                        </Button>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    )
}

export default Solved;
