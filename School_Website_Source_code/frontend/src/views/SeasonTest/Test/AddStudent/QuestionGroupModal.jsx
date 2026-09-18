import React, { useRef, useState } from 'react'
import { X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Col, Form, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'

// #region ⚠️ only before ReactQuill import
import Quill from "quill"
const Image = Quill.import("formats/image")
const originalSanitize = Image.sanitize
Image.sanitize = function (url) {
  if (url && url.startsWith("blob:")) return url
  return originalSanitize(url)
}
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// #endregion

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { handleQuillImage, quillOpts } from '@src/utility/quillHelpers';

export default function QuestionGroupModal({ open, handleModal, refreshDatas, selectedQuestionIds, challengeId }) {
    const { t } = useTranslation()
    const { fetchData, isLoading, Loader } = useLoader({})
    const challengeAPI = useApi().challenge

    const [description, setDescription] = useState('')
    const [file, setFile] = useState('')
    const [fileName, setFileName] = useState('')

    // #region quill
    const [quill, setQuill] = useState()
    const quillImagesRef = useRef({})
    const quillImages = quillImagesRef.current

    const handleQuillRef = (el) => {
        if (!el || quill) return;
        const quillEditor = el.getEditor();
        setQuill(quillEditor)
        quillEditor.getModule('toolbar').addHandler('image', () => handleQuillImage(quillEditor, handleNewQuillImages, quillImagesRef))
    };

    function handleNewQuillImages(newState) {
        quillImagesRef.current = newState
    }
    // #endregion

    async function postQuestionGroup(e) {
        e.preventDefault()
        const formData = new FormData()

        for (const key in quillImages) {
            formData.append('quillImages', quillImages[key])
            formData.append('quillImageKeys', key)
        }

        const cdata = {
            name: e.target.name.value,
            description: description,
            challenge_id: challengeId
        }

        formData.append('cdata', JSON.stringify(cdata))
        formData.append('file', file)
        formData.append('selectedQuestionIds', selectedQuestionIds || [])

        const { success } = await fetchData(challengeAPI.semester.postQuestionGroup(formData))

        if (success) {
            refreshDatas()
            handleModal()
        }
    }

    return (
        <Modal isOpen={!!open} className='modal-dialog-centered'>
            <ModalHeader
                toggle={() => {
                    handleModal()
                }}
                cssModule={{ 'modal-title': 'w-100 text-center' }}
            >
                {t('Асуултын бүлэг')}
            </ModalHeader>
            <ModalBody>
                {isLoading && Loader}
                <Row tag={Form} onSubmit={postQuestionGroup}>
                    <Col md={12}>
                        <Label className='form-label'>{t('Асуултын бүлгийн нэр')}</Label>
                        <Input
                            name='name'
                            bsSize='sm'
                            placeholder='Асуултын бүлгийн нэр'
                            type='text'
                            defaultValue={''}
                        />
                    </Col>
                    <Col md={12} className='mt-1'>
                        <Label className='form-label'>{t('Асуултын бүлгийн тайлбар')}</Label>
                        <ReactQuill
                            name='description'
                            ref={handleQuillRef}
                            theme="snow"
                            value={description || ''}
                            onChange={(val) => {
                                setDescription(val)

                                if (quill) {
                                    // to get still remained in editor values
                                    const imgsAfter = quill.root.querySelectorAll('img');
                                    const newState = {}
                                    imgsAfter.forEach(({ src }) => { if (quillImages[src]) newState[src] = quillImages[src] })

                                    // to update files in state if some of them is removed inside editor
                                    if (Object.keys(newState).length !== Object.keys(quillImages).length) handleNewQuillImages(newState)
                                }
                            }}
                            modules={quillOpts?.modules}
                            formats={quillOpts?.formats}
                            placeholder={t('Асуултын бүлгийн тайлбар')}
                        />
                    </Col>
                    <Col md={12} className={'mt-1'}>
                        <Label className="form-label">
                            {t('Файл оруулах (аудио, видео)')}
                        </Label>
                        <Input
                            type="file"
                            size="sm"
                            accept={".mp3,.wav,.mpc,.msv,.nmf,.mp4,.avi,.mov,.webm,.ogg,.ogv,.3gp,.flv"}
                            onChange={(e) => { setFile(e.target.files[0]); setFileName(e.target.files[0]?.name) }}
                        />
                        {fileName &&
                            <Label className="form-label">
                                {fileName}
                                <X
                                    className="ms-50"
                                    role="button"
                                    color="red"
                                    size={15}
                                    onClick={() => { setFile(''); setFileName('') }}
                                ></X>
                            </Label>
                        }
                    </Col>
                    <Col md={12} className='text-end'>
                        <Button color='primary' size='sm' className='mt-1' type='submit'>
                            {t('Хадгалах')}
                        </Button>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    )
}
