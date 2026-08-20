import React, { Fragment, useState, useEffect } from 'react';

import { Row, Col, Modal, ModalBody, ModalHeader, Button, Spinner, Table, ModalFooter, Input, Form, Label, FormFeedback } from "reactstrap";

import useApi from "@hooks/useApi";
import useToast from '@hooks/useToast';
import useLoader from "@hooks/useLoader";

import { t } from 'i18next';

import { level_option, ReactSelectStyles } from '@utils';

import classnames from "classnames";

import Select from 'react-select'

const Passmodal = ({ open, handleModal, level, profession, refreshDatas }) => {

    const addToast = useToast()

    const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const groupApi = useApi().student.group.pass;

    const [datas, setDatas] = useState([]);
    const [upLevel, setUpLevel] = useState('')
    const [description, setDescription] = useState('')
    const [checkedGroups, setChecked] = useState(datas.map(li => li.id))
    const [is_checked, setIsChecked] = useState(true)

    async function getDatas() {
        const { success, data } = await fetchData(groupApi.get(profession, level));
        if (success) {
            setDatas(data);
            setChecked(data.map(li => li.id))
        }
    }

    useEffect(() => {
        getDatas();
    }, [profession, level]);

    async function handleSave() {
        if(!upLevel) {
            addToast({ text: "Дэвшүүлэх курс сонгоно уу", type: "error"});
        } else if(!description) {
            addToast({ text: "Дэвшүүлэх курс сонгоно уу", type: "Тайлбар оруулна уу"});
        } else {
            const submitDatas = {
                'group': datas?.filter((val) => checkedGroups?.includes(val?.id)),
                'level': upLevel,
                'description': description,
            }
            const { success } = await fetchData(groupApi.post(submitDatas));
            if (success) {
                setDatas(prev =>
                    {
                        const all_datas = [...prev]
                        for(let idx in all_datas) {
                            all_datas[idx]['level'] = upLevel
                        }
                        return all_datas
                    }
                )
                handleModal()
                refreshDatas()
            }
        }
    }

    const handleChangeValue = (editRow, event, key) => {
        const value = event.target.value

        setTimeout(() => {
            setDatas(prev =>
                {
                    const all_datas = [...prev]
                    var cdatas = all_datas.find((val) => val.id === editRow?.id)

                    if(cdatas) cdatas[key] = value
                    return all_datas
                }
            )
        }, 500)
	};

    const handleCheckedSelectAll = e => {
        setIsChecked(!is_checked);
        setChecked(datas.map(li => li.id));
        if (is_checked) {
            setChecked([]);
        }
    };

    function handleChecked(e) {
        const { value, checked } = e.target;
        const id = parseInt(value)

        setChecked([...checkedGroups, id]);
        if (!checked) {
            setIsChecked(false)
            setChecked(checkedGroups.filter(item => item !== id));
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                backdrop={false}
                className="modal-dialog-centered modal-lg"
            >
                <ModalHeader className='bg-transparent' toggle={handleModal}>
                    <h3 className="modal-title">{t('Анги дэвшүүлэх (Зөвхөн сонгогдсон анги дэвшихийг анхаарна уу)')}</h3>
                </ModalHeader>
                <ModalBody>
                    <div className='fw-bolder'>
                        {`Одоогийн курс: ${level}`}
                    </div>
                    {
                        datas && datas?.length > 0
                        ?
                            <Row className="gy-1" tag={Form} onSubmit={handleSave}>
                                <Col md={6}>
                                    <Label className='form-label pt-50 me-1'>
                                        {t("Дэвшүүлэх курс")}
                                    </Label>
                                    <Select
                                        name="level"
                                        id="level"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': !upLevel })}
                                        isLoading={isLoading}
                                        placeholder={`-- Дэвшүүлэх курс сонгоно уу --`}
                                        options={level_option() || []}
                                        value={level_option().find((c) => c.id === upLevel)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            setUpLevel(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                    {!upLevel && <FormFeedback className='d-flex justify-content-end'>{t('Дэвшүүлэх курс сонгоно уу')}</FormFeedback>}
                                </Col>
                                <Col md={6}>
                                    <Label className='form-label pt-50 me-1'>
                                        {t("Тайлбар")}
                                    </Label>
                                    <Input
                                        id='description'
                                        placeholder='Тайлбар /Тушаалын дугаар/'
                                        invalid={!description && true}
                                        bsSize="sm"
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    {!description && <FormFeedback className='d-flex justify-content-end'>{t('Тайлбар оруулна уу')}</FormFeedback>}
                                </Col>
                                <Col md={12} className="mt-2" style={{ height: '60vh', overflowY: 'auto' }}>
                                    {
                                        isLoading
                                        ?
                                            <Spinner size='sm' />
                                        :
                                            <Table striped size='sm'>
                                                <thead>
                                                    <tr className='pt-5'>
                                                        <th>
                                                            <div className='form-check'>
                                                                <Input
                                                                    id='view-all'
                                                                    type='checkbox'
                                                                    label='View All'
                                                                    className='select-all'
                                                                    checked={is_checked}
                                                                    onChange={(e) => handleCheckedSelectAll(e)}
                                                                />
                                                            </div>
                                                        </th>
                                                        <th>№</th>
                                                        <th>Анги *</th>
                                                        <th className='text-center'>Курс</th>
                                                        <th className='text-center'>Идэвхтэй оюутны тоо</th>
                                                        <th>Суралцах хэлбэр</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        datas.map((item, index) => {
                                                            return (
                                                                <tr
                                                                    key={index}
                                                                >
                                                                    <th>
                                                                        <div
                                                                            key={item?.name}
                                                                            className='form-check'
                                                                        >
                                                                            <Input
                                                                                type='checkbox'
                                                                                value={item?.id}
                                                                                name={item?.name}
                                                                                id={item?.name}
                                                                                checked={checkedGroups.includes(item?.id)}
                                                                                onChange={(e) => handleChecked(e)}
                                                                            />
                                                                        </div>
                                                                    </th>
                                                                    <td>{index+1}</td>
                                                                    <td>
                                                                        <Input
                                                                            type='text'
                                                                            bsSize='sm'
                                                                            id={`name-${index}-input`}
                                                                            placeholder="Ангийн нэр"
                                                                            defaultValue={item?.name}
                                                                            onChange={(e) => handleChangeValue(item, e, 'name')}
                                                                        />
                                                                    </td>
                                                                    <td align='center'>{item.level}</td>
                                                                    <td align='center'>{item.student_count}</td>
                                                                    <td>{item.learn_status}</td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </tbody>
                                            </Table>
                                    }
                                </Col>
                            </Row>
                        :
                            !isLoading
                            ?
                                <p className='text-center'>Дэвших боломжтой анги олдсонгүй</p>
                            :
                                <div className='my-2 d-flex align-items-center justify-content-center'>
                                    <Spinner className='me-1' size='md'/><h5>Түр хүлээнэ үү...</h5>
                                </div>

                    }
                </ModalBody>
                <ModalFooter>
                    {
                        datas && datas?.filter((val) => checkedGroups?.includes(val?.id))?.length > 0 &&
                        <Button className="me-2" color="primary" type="submit" disabled={postLoading || !description || !upLevel} onClick={handleSave}>
                            {postLoading && <Spinner size='sm' className='me-1'/>}
                            {t('Хадгалах')}
                        </Button>
                    }
                    <Button color="secondary" type="reset" outline  onClick={handleModal}>
                        {t('Хаах')}
                    </Button>
                </ModalFooter>
            </Modal>
        </Fragment>
    );
};

export default Passmodal;
