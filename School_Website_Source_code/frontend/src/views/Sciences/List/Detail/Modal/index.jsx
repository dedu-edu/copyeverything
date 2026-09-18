import { useEffect, useState } from 'react';
import { t } from 'i18next';
import Select from 'react-select'
import classnames from 'classnames'

import {
    Col,
    Modal as BootstrapModal,
    ModalBody,
    ModalHeader,
    Row,
    Label,
    Alert,
    Input,
    Button,
    FormFeedback,
    Badge
} from 'reactstrap';

import useModal from '@hooks/useModal';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'


const Modal = (props) => {

    const { isOpen, handleModal, files, user, rowData } = props;
    const [activeList, setActiveLIst] = useState(1)
    const [fileList, setFileList] = useState(files)
    const [fileUrl, setFile] = useState('')
    const [approveData, setApproveData] = useState({})
    const [description, setDescription] = useState('')
    const [error, setError] = useState('')
    const [count, setCount] = useState(1)
    const [fileData, setFileData] = useState({})

    const configApi = useApi().science.settings

    const { Loader, isLoading, fetchData } = useLoader({isSmall: true});

    const typeOption = [
        {
            'id': 1,
            'name': 'Баталгаажуулах'
        },
        {
            'id': 2,
            'name': 'Тооцохгүй'
        },
    ]

    const state_display = (id) => {
        switch(id) {
            case 1:
                return (
                    <Badge color={'success'}>Баталгаажуулсан</Badge>
                )

            case 2:
                return (
                    <Badge color={'danger'}>Тооцохгүй</Badge>
                )

            default:
                return (
                    <Badge color={'primary'}>Илгээсэн</Badge>
                )
        }
    }

    const dep_state_display = (id) => {
        switch(id) {
            case 3:
                return (
                    <Badge color={'success'}>Баталгаажуулсан</Badge>
                )

            case 2:
                return (
                    <Badge color={'danger'}>Тооцохгүй</Badge>
                )

            default:
                return (
                    <Badge color={'primary'}>Илгээсэн</Badge>
                )
        }
    }
    const toggleList = (file, idx) => {
        if (activeList !== idx) {
            setActiveLIst(idx)
            setFile(file?.file_url)
            setFileData(file)
        }
    }

    useEffect(
        () =>
        {
            if (files?.length > 0) {
                setFile(files[0]?.file_url)
                setFileData(files[0])
                setCount(files[0]?.count)
            }
        },
        []
    )

    const handleCheck = (type_id, file_id) => {
        setFileList(prevItems =>
            prevItems.map(item =>
                item.id === file_id ? { ...item, check_science: true, check_science_state: type_id} : item
            )
        )
    }

    async function onSubmit() {
        var one_data = fileList.find((c) => c.id === fileData?.id)
        if (one_data?.check_science_state == 2 && !description) {
            setError('Тооцохгүй тохиолдол заавал тайлбар бичнэ үү')
        } else {
            setError('')
            var capprove = {
                'check_science': true,
                'state': one_data?.check_science_state,
                'file': fileData?.id
            }
            var cdata = {
                ...capprove,
                'description': one_data?.check_science_state == 1 ? '' : description,
                'count': count
            }
            const { success, data } = await fetchData(configApi.post(cdata))
            if (success) {
                setFileList(prevItems =>
                    prevItems.map(item =>
                        item.id === capprove?.id ? { ...item, check_science: true, check_science_state: data?.check_science_state,  check_science_description : data?.check_science_description} : item
                    )
                )
                setApproveData({})
                setDescription('')
            }
        }
    }
    return (
        <BootstrapModal
            isOpen={isOpen}
            toggle={handleModal}
            className="modal-dialog-centered modal-xl"
            keyboard={false}
            backdrop="static"
        >
            <ModalHeader toggle={handleModal}>{t('Файл харах')}</ModalHeader>
            <ModalBody>
                <Alert color={'primary'} className={'p-50'}>
                    Файл нэр дээр дарж оруулсан файлаа харж болно
                </Alert>
                <Col md={12}>
                    <div><span className='fw-bolder'>Үзүүлэлт: </span>{t(rowData?.category?.name)}</div>
                    <div><span className='fw-bolder'>Дэд үзүүлэлт: </span>{t(rowData?.name)}</div>
                </Col>
                <Row>

                    <Col md={4} sm={12} className='mt-50'>
                        {
                            fileList?.map((file, idx) =>
                                <div
                                    key={file?.id}
                                    className={`p-1 border rounded mt-50 ${
                                        activeList === idx + 1 ? "text-primary border-primary" : "text-black cursor-pointer"
                                    }`}
                                    onClick={() => toggleList(file, (idx + 1))}
                                >
                                    <div className='d-flex justify-content-between align-items-center'>
                                        <div>{idx + 1}. {file?.file_url?.split('/').pop()}</div>
                                    </div>
                                    {
                                        user?.permissions?.includes('lms-profession-department-approve') ?
                                        file?.check_department
                                        &&
                                            <div className='d-flex mt-50'>
                                                <div>
                                                    <Badge color='primary'>{ 'ТЭ'}</Badge>
                                                </div>
                                                <div className='ms-1 text-dark'>
                                                    <span>{state_display(file?.dep_state)}</span>
                                                    {
                                                        file?.dep_description
                                                        &&
                                                        <p>Тайлбар: {file?.dep_description}</p>
                                                    }
                                                </div>
                                            </div>
                                        :

                                        user?.permissions?.includes('lms-science-list-approve') &&
                                        <div className='mt-1'>
                                            <div>
                                            {
                                                file?.check_science && rowData?.approve_type
                                                &&
                                                    <div className='d-flex'>
                                                        <div>
                                                            <Badge color='primary'>{'ШУТГ'}</Badge>
                                                        </div>
                                                        <div className='ms-1 text-dark'>
                                                            <span>{state_display(file?.check_science_state)}</span>
                                                            {
                                                                file?.check_science_description
                                                                &&
                                                                <p>Тайлбар: {file?.check_science_description}</p>
                                                            }
                                                        </div>
                                                    </div>

                                            }
                                            <div>
                                            </div>
                                            {
                                                rowData?.name == 'Иш татагдсан тоо бүрд'
                                                &&
                                                <div>
                                                    <Col md={4} className='mb-1'>
                                                        <Label>Иш татагдсан тоо</Label>
                                                        <Input
                                                            bsSize="sm"
                                                            disabled
                                                            defaultValue={file?.count}
                                                            placeholder='Иш татагдсан тоо'
                                                        />
                                                    </Col>
                                                    <Col md={4} className='mb-1'>
                                                        <Label>Иш татагдсан тооцох тоо</Label>
                                                        <Input
                                                            bsSize="sm"
                                                            defaultValue={file?.estimate_count}
                                                            placeholder='Иш татагдсан тоо'
                                                            onChange={(e) => setCount(e.target.value)}
                                                        />
                                                    </Col>
                                                </div>
                                            }
                                            </div>
                                            {/* ШУТГ тэнхимийн эрхлэгч зөвшөөрсны дараа шийдвэрлэх эрхтэй болно */}
                                            {
                                                (user?.permissions?.includes('lms-science-list-approve') && !rowData?.approve_type)
                                                &&
                                                <div>
                                                    {
                                                        typeOption?.map((stype) =>
                                                            <div>
                                                                <Input type='radio' id={`${stype?.name}_${idx}`} name={`solved_flag_${file?.id}`}  onChange={() => handleCheck(stype?.id, file?.id)}  checked={stype?.id === file?.check_science_state}/>
                                                                <Label className='ms-1' for={`${stype?.name}_${idx}`}>{stype?.name}</Label>
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        (file?.check_science_state == 2) && activeList == idx + 1
                                                        &&
                                                        <>
                                                            <Label for={`description_${idx}`}>{'Тайлбар'}</Label>
                                                            <Input type='textarea' invalid={error && true} id={`description_${idx}`} name='description' placeholder='Тооцохгүй тайлбар' onChange={(e) => setDescription(e?.target?.value)} defaultValue={file?.check_science_description}/>
                                                            {
                                                                (activeList == idx + 1) && error &&  <FormFeedback className='d-block'>{error}</FormFeedback>
                                                            }
                                                        </>
                                                    }
                                                    {
                                                        activeList == idx + 1
                                                        &&
                                                        <div className=''>
                                                            <Button color='primary' className='mt-2' type='submit' size='sm' onClick={() => onSubmit()}>{file?.is_edit ? 'Засах' : 'Хадгалах'}</Button>
                                                        </div>
                                                    }
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            )
                        }
                    </Col>
                    <Col md={8} sm="12" className="d-flex flex-column">
                        <iframe className="flex-grow-1 vh-100" src={fileUrl} title="Embedded File" allowFullScreen />
                    </Col>
                </Row>
            </ModalBody>
        </BootstrapModal>
    );
};

export default Modal;
