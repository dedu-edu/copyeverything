import classnames from 'classnames'
import React, { useReducer, useState } from 'react'
import { Edit, MinusCircle, Save } from 'react-feather'
import Select from 'react-select'
import { Col, Input, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { get_levelseasons, ReactSelectStyles } from '@utils'

export default function EditModal({ open, handleModal, questionDetail, getDatas }) {
    const [data, setData] = useState(questionDetail)
    const [levelType] = useState(get_levelseasons())

    const [editQuestion, setEditQuestion] = useState({ id: null, isEdit: false })

    const initialQuestionRow = {
        question: '',
        image: '',
        score: '',
        level: ''
    }
    const questionReducer = (state, action) => {
        switch (action.type) {
            case 'SET_QUESTION':
                return { ...state, question: action.payload }
            case 'SET_LEVEL':
                return { ...state, level: action.payload }
            case 'SET_KIND':
                return { ...state, kind: action.payload }
            case 'SET_SCORE':
                return { ...state, score: action.payload }
            case 'SET_IMAGE':
                return { ...state, image: action.payload }
            case 'SET_RESET':
                return initialQuestionRow
            default:
                return state
        }
    }

    const [questionState, dispatchQuestion] = useReducer(questionReducer, initialQuestionRow)

    const { fetchData } = useLoader({})
    const questionAPI = useApi().challenge.question

    function handleQuestionEdit(questoinData) {
        setEditQuestion({ id: questoinData.id, isEdit: true })
        dispatchQuestion({ type: 'SET_QUESTION', payload: questoinData.question })
        dispatchQuestion({ type: 'SET_SCORE', payload: questoinData.score })
        dispatchQuestion({ type: 'SET_LEVEL', payload: questoinData.level })
        if (questoinData.image) {
            dispatchQuestion({ type: 'SET_IMAGE', payload: { preview: process.env.REACT_APP_SERVER_URL + questoinData.image } })
        }
    }

    async function handleQuestionSave(questionId) {
        const formData = new FormData()
        for (let key in questionState) {
            formData.append(key, questionState[key])
        }
        const { success, data } = await fetchData(questionAPI.putTestQuestions(formData, questionId))
        if (success) {
            if (data) {
                setEditQuestion({ id: null, isEdit: false })
                dispatchQuestion({ type: 'SET_RESET' })
                setData(data)
            }
        }
    }

    return (
        <Modal isOpen={open} className='modal-dialog-centered modal-xl'>
            <ModalHeader
                className=''
                tag='div'
                toggle={() => {
                    handleModal()
                    getDatas()
                }}
            >
                <div>
                    <h4 className='mb-0'>Асуултын дэлгэрэнгүй</h4>
                </div>
            </ModalHeader>
            <ModalBody className=''>
                <Row className='border border-primary p-1 py-50 g-0' style={{}} key={data.id}>
                    <Col md={12} className='d-flex justify-content-end'>
                        {editQuestion.isEdit && editQuestion.id == data.id ? (
                            <>
                                <div
                                    className='cursor-pointer'
                                    onClick={() => {
                                        handleQuestionSave(data.id)
                                    }}
                                >
                                    <Save className='text-success ' size={16} />
                                </div>
                                <div
                                    className='cursor-pointer ms-50'
                                    onClick={() => {
                                        setEditQuestion({ id: null, isEdit: false })
                                        dispatchQuestion({ type: 'SET_RESET', payload: '' })
                                    }}
                                >
                                    <MinusCircle className='' size={16} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className='cursor-pointer'
                                    onClick={() => {
                                        handleQuestionEdit(data)
                                    }}
                                >
                                    <Edit className='text-info ' size={16} />
                                </div>
                            </>
                        )}
                    </Col>
                    <Col md={6} className='' style={{}}>
                        <Row className='g-0 gy-50 mb-50'>
                            <Col md={12}>
                                <label className='me-50'>Асуулт:</label>
                                {editQuestion.isEdit && editQuestion.id == data.id ? (
                                    <Input
                                        id={'question' + data.id}
                                        name={'question' + data.id}
                                        value={questionState.question || ''}
                                        type='textarea'
                                        bsSize={'sm'}
                                        onChange={(e) => {
                                            dispatchQuestion({ type: 'SET_QUESTION', payload: e.target.value })
                                        }}
                                    />
                                ) : (
                                    <span>{data.question}</span>
                                )}
                            </Col>
                            <Col md={12} className='d-flex align-items-center'>
                                <label className='me-50'>Нийт оноо:</label>
                                {editQuestion.isEdit && editQuestion.id == data.id ? (
                                    <span className=''>
                                        <Input
                                            value={questionState.score}
                                            type='number'
                                            bsSize={'sm'}
                                            onChange={(e) => {
                                                dispatchQuestion({ type: 'SET_SCORE', payload: e.target.value })
                                            }}
                                        />
                                    </span>
                                ) : (
                                    <span>{data.score}</span>
                                )}
                            </Col>
                            <Col md={12} className='d-flex align-items-center'>
                                <label className='me-50'>Асуултын түвшин:</label>
                                {editQuestion.isEdit && editQuestion.id == data.id ? (
                                    <Select
                                        classNamePrefix='select'
                                        className={classnames('react-select')}
                                        options={levelType}
                                        value={levelType.find((v) => v.id == questionState.level) || ''}
                                        placeholder={'-- Сонгоно уу --'}
                                        noOptionsMessage={() => 'Хоосон байна.'}
                                        onChange={(val) => {
                                            dispatchQuestion({ type: 'SET_LEVEL', payload: val?.id || '' })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                ) : (
                                    <span className=''>{levelType.find((v) => v.id == data.level)?.name}</span>
                                )}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    )
}
