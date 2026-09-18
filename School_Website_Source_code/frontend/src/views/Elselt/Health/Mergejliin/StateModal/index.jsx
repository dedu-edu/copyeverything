import React, { useEffect, Fragment, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Popover, PopoverBody, PopoverHeader, UncontrolledPopover, UncontrolledTooltip } from 'reactstrap';
import { ReactSelectStyles, validate } from '@utils';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import * as Yup from 'yup'
import Select from 'react-select'
import classnames from 'classnames'


function StateModal({ stateModalHandler, stateModal, selectedStudents, getDatas}) {
    const validateSchema = Yup.object().shape({
        state: Yup.string()
            .trim()
            .required('Хоосон байна'),
        description: Yup.string()
            .trim()
            .required('Хоосон байна'),
    });
    const { formState: { errors }, handleSubmit, control, reset } = useForm(validate(validateSchema));
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});

    const [displayPopover, setDisplayPopover] = useState(false)
    const [stateId, setStateId] = useState('')

    const STATE_LIST = [
        {
            name: 'Хүлээгдэж буй',
            id: 1
        },
        {
            name: 'Тэнцсэн',
            id: 2
            },
        {
            name: 'Тэнцээгүй',
            id: 3
        },
    ]
    const Ids = selectedStudents.map(val => val?.id)

    const admissionStateChangeApi = useApi().elselt.health.professional;

    async function onSubmit(cdata){
        cdata['state']=stateId
        cdata['user']=selectedStudents.map(val => val?.user?.id) || []

        const { success } = await fetchData(admissionStateChangeApi.all_put(cdata));
        if (success) {
            reset();
            getDatas();
            stateModalHandler();
        };

    };


    function popoverHandler() {
        setDisplayPopover(!displayPopover)
    }

    return (
        <Modal centered toggle={stateModalHandler} isOpen={stateModal} backdrop='static'>
            <ModalHeader toggle={stateModalHandler}>
                Төлөв солих
            </ModalHeader>
            <ModalBody>
                <Form className='' onSubmit={handleSubmit(onSubmit)}>
                    <div className='d-flex justify-content-between'>
                        <div className=' mx-50'>
                            <Label className='form-label' for='state'>
                                Төлөв
                            </Label>
                            <Controller
                                control={control}
                                id='state'
                                name='state'
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        name="state"
                                        id="state"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', {'is-invalid': errors.state})}
                                        placeholder='-- Сонгоно уу --'
                                        options={STATE_LIST || []}
                                        value={STATE_LIST.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            setStateId(val?.id || '')
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )}
                                />
                                {errors.state && <FormFeedback className='d-block'>{errors.state.message}</FormFeedback>}
                        </div>
                        {
                            selectedStudents.length > 0 &&
                            <>
                                <div
                                    className='bg-light-info p-1 rounded-3'
                                    id='students_tooltip'
                                    onMouseEnter={() => setDisplayPopover(true)}
                                    onMouseLeave={() => setDisplayPopover(false)}
                                    onClick={() => popoverHandler()}
                                    style={{ cursor:'help' }}
                                >
                                    Сонгогдсон элсэгчдийн тоо: <b>{selectedStudents.length}</b>
                                </div>
                            </>
                        }
                    </div>
                    <div className='shadow border rounded-3 m-1 mx-25 p-1'>
                        <Label className='p-50'>
                            Тайлбар
                        </Label>

                        <Controller
                            control={control}
                            defaultValue=''
                            name="description"
                            render={({ field: { value, onChange } }) => {
                                return(
                                    <Input
                                        type='textarea'
                                        name='description'
                                        invalid={errors?.description}
                                        value={value}
                                        onChange={(e) => {
                                            onChange(e.target.value || '')
                                        }}
                                        style={{ minHeight: 100 }}
                                    />
                                )
                            }}
                        />
                    {errors?.state_description && <FormFeedback className='d-block'>{errors?.state_description?.message}</FormFeedback>}
                    </div>
                    <div className='text-center my-50'>
                        <Button className='m-50' color='primary' type='submit'>Хадгалах</Button>
                        <Button className='m-50 ' onClick={() => stateModalHandler()}>Гарах</Button>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    )
}

export default StateModal
