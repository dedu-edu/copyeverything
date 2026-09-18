import { useState } from 'react'
import { t } from 'i18next'
import { AlertCircle, X } from 'react-feather'
import {
    Col,
    Input,
    Label,
    Modal,
    Button,
    ModalBody,
    ModalHeader,
    FormFeedback,
    Row,
    Alert
} from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

const FileModal = ({ isOpen, handleModal, refreshData, title, season, is_graduate, is_audit }) => {

    const defaultExt = ['csv', 'xlsx']
    const [isLoading, setLoader] = useState(false)
    const [file, setFile] = useState('')
    const [fileExt, setFileExt] = useState('')
    const [error, setFileError] = useState('')
    const [resError, setResError] = useState([])

    const { fetchData } = useLoader({})
    const fileApi = useApi().challenge.question

    const getFile = (e, action) => {
        if (action === 'Get') {
            const files = e.target.files
            const fileName = files[0]?.name

            if (fileName) {
                const ext = fileName.split('.').pop().toLowerCase()
                if (!defaultExt.includes(ext)) {
                    setFileError('Зөвхөн .csv, .xlsx  өргөтгөлтэй файл оруулна уу')
                    setFile('')
                } else {
                    setFile(files[0])
                    setFileError('')
                    setFileExt(ext)
                }
            }
        } else {
            setFile('')
            setFileError('Хоосон байна.')
        }
    }

    async function onSubmit() {
        if (!file) {
            setFileError('Хоосон байна.')
            return
        }

        setLoader(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('ext', fileExt)
        if (is_graduate || is_audit) {
            formData.append('main_title', title)
        } else {
            formData.append('title', title)
        }

        try {
            const response = await fileApi.postExcel(formData)
            const { success, data } = response
            if (success) {
                handleModal()
                refreshData()
                setResError([])
            } else if (data?.errors) {
                setResError(data?.errors)
            }
        } catch (err) {
            if (err.errors) {
                setResError(err.errors)
            } else {
                setResError([{ row: '-', error: 'Серверийн алдаа гарлаа.' }])
            }
        } finally {
            setLoader(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={handleModal}
            className={`modal-dialog-centered ${resError.length > 0 ? 'modal-xl' : 'modal-sm'}`}
        >
            <ModalHeader toggle={handleModal}>{t('Асуултууд файлаар оруулах')}</ModalHeader>
            <ModalBody>
                <Row>
                    <Col>
                        <Label>{t('Файл')}</Label>
                        <Input
                            type='file'
                            bsSize='sm'
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            onChange={(e) => getFile(e, 'Get')}
                            invalid={!!error}
                        />
                        {error ? (
                            <FormFeedback className='d-block'>{t(error)}</FormFeedback>
                        ) : (
                            <Col className="ps-0">
                                <AlertCircle color="#28bcf7" size={15} />
                                <Label className="ms-1">{t('Зөвхөн .csv, .xlsx  өргөтгөлтэй файл оруулна уу.')}</Label>
                            </Col>
                        )}

                        <hr className='mb-0' />

                        {file && (
                            <Col md={12} className='mt-50'>
                                <div style={{ fontSize: '11px' }}>
                                    <p className='mb-0'>Файл нэр: {file?.name}</p>
                                    <span>Файл хэмжээ: {file?.size}</span>
                                    <X
                                        className='ms-50'
                                        role="button"
                                        color="red"
                                        size={15}
                                        onClick={(e) => getFile(e, 'Delete')}
                                    />
                                </div>
                            </Col>
                        )}

                        <Col md={resError.length > 0 ? 6 : 6} sm={12} className="mt-2 d-flex justify-content-start mb-0">
                            <Button color="primary" type="submit" onClick={onSubmit}>
                                {isLoading && <i className="fas fa-spinner-third fa-spin me-2"></i>}
                                {t('Хадгалах')}
                            </Button>
                            <Button className='ms-1' color="secondary" type="reset" outline onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Col>
                    {
                        resError.length > 0 && (
                        <Col md={12} sm={12} className='mt-50'>
                            <Alert color="danger" className="p-2" style={{ backgroundColor: '#1e1e1e', color: '#ff4d4f', borderRadius: '8px' }}>
                            <h6 className="fw-bold mb-2" style={{ color: '#ff6b6b' }}>
                                {t('⚠️ Импорт амжилтгүй боллоо')}
                            </h6>
                            <div
                                style={{
                                    maxHeight: '60vh',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    backgroundColor: '#2b2b2b',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid white'
                                }}
                            >
                                {resError.map((err, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            borderBottom: '1px dashed white',
                                            padding: '6px 8px',
                                            color: '#f5f5f5',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <span style={{ color: '#ffa500', fontWeight: 'bold' }}>
                                            {t('Excel мөрийн дугаар')}: {err?.row ? err?.row : "Тодорхойгүй"}
                                        </span>
                                        <span className='text-info'>
                                            {t('Асуулт')}: {err?.question}
                                        </span>
                                        <span>Алдаа: {t(err.error)}</span>
                                    </div>
                                ))}
                            </div>
                            </Alert>
                        </Col>
                        )}
                </Row>
            </ModalBody>
        </Modal>
    )
}

export default FileModal
