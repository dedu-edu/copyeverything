import classnames from 'classnames'
import { useEffect, useState } from 'react'
import { MinusCircle, PlusCircle } from 'react-feather'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { Button, Col, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import * as Yup from 'yup'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { getPagination, ReactSelectStyles, validate } from '@utils'

import { oralExam } from '../../../constants'
import styles from './styles.module.scss'

const validateSchema = Yup.object().shape({
    name: Yup.string().trim().required('Хоосон байна')
    // questions: Yup.array().min(1, "Асуулт нэмнэ үү").required("Хоосон байна")
})

export default function AddTitle({ open, setOpen, getAllTitle, setActiveTitle, teacher_id, lessonId }) {
    const title = open.editTitle
    const editId = open.editTitle ? title.id : ''

    const [questionList, setQuestionList] = useState()
    const [lessonOption, setLessonOption] = useState([])

    // pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(20)
    const [totalCount, setTotalCount] = useState(0)
    const Pagination = getPagination((page) => setCurrentPage(page.selected + 1), currentPage, rowsPerPage, totalCount)

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm(validate(validateSchema))
    const selected = watch()

    // api
    const questionAPI = useApi().challenge.question
    const oralExamQuestionAPI = useApi().challenge.oralExam.question
    const lessonApi = useApi().study.lessonStandart

    // loaders
    const { fetchData: fetchLesson, Loader, isLoading: isLessonLoading } = useLoader({})
    const { fetchData: fetchCurrentTitle, isLoading: isCurrentTitleLoading } = useLoader({})
    const { fetchData: fetchFreeTitle, isLoading: isFreeTitleLoading } = useLoader({})
    const { fetchData: fetchSave, isLoading: isSaveLoading } = useLoader({})

    const { t } = useTranslation()

    useEffect(() => {
        if (editId) getOneTitle()
    }, [])

    useEffect(() => {
        getAllQuestoin()
    }, [currentPage])

    async function getOneTitle() {
        const { success, data: apiResult } = await fetchCurrentTitle(oralExamQuestionAPI.get(1, 'Бүгд', '', editId, teacher_id, '', '', lessonId))
        if (success) {
            const questions = apiResult?.results
            setValue('questions', questions)
            setValue('name', title?.name)
            setValue('lesson', lessonId)
        }
    }

    const getLessons = async () => {
        try {
            const { success, data } = await fetchLesson(lessonApi.getList())
            if (success) {
                setLessonOption(data)
            }
        } catch (error) {
            console.error('Error fetching lessons:', error)
        }
    }

    async function getAllQuestoin() {
        const { success, data } = await fetchFreeTitle(oralExamQuestionAPI.get(currentPage, rowsPerPage, '', -1, teacher_id, '', '', lessonId))

        if (success) {
            if (selected.questions) data.results = data.results.filter(item => !selected.questions.some(selItem => selItem.id === item.id))
            setQuestionList(data.results)
            setTotalCount(data.count)
        }
    }

    async function onSubmit(datas) {
        if (datas['questions']) {
            datas['questions'] = datas['questions']?.map((v) => v.id)
            datas['other_questions'] = questionList.map((v) => v.id)
            datas['teacher_id'] = teacher_id
            datas['is_oral'] = true
        }
        const { success, data } = await fetchSave(editId ? questionAPI.putTitle(editId, datas) : questionAPI.postTitle(datas))
        if (success) {
            getAllTitle()
            if (editId) setActiveTitle(editId)
            else setActiveTitle(data.id)
            setOpen({ type: false, editTitle: null })
        }
    }

    useEffect(() => {
        getLessons()
    }, [])

    return (
        <>
            <Modal
                isOpen={open.type}
                toggle={() => {
                    setOpen({ type: false, editTitle: null })
                }}
                className='sidebar-xl'
                modalClassName='modal-slide-in custom-80'
                contentClassName='p-0'
            >
                <ModalHeader className='' tag='div' style={{ position: 'relative' }}>
                    <div>
                        <h4 className='mb-0'>Багц асуулт {editId ? 'засах' : 'нэмэх'}</h4>
                    </div>
                </ModalHeader>
                <ModalBody className='w-100 h-100 '>
                    <Row className='g-1' tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className='form-label' for='lesson'>
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='lesson'
                                name='lesson'
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name='lesson'
                                            id='lesson'
                                            classNamePrefix='select'
                                            isClearable
                                            isLoading={isLessonLoading}
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={lessonOption || []}
                                            value={lessonOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.code + ' ' + option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='name'>
                                {t('Хичээлийн сэдэв')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='name'
                                name='name'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id='name'
                                        bsSize='sm'
                                        placeholder={t('Багц асуултын нэр')}
                                        type='text'
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>

                        <Controller
                            defaultValue={[]}
                            control={control}
                            id='questions'
                            name='questions'
                            render={({ field: { value, onChange } }) => (
                                <>
                                    <Col md={6} className={errors.questions ? 'border-danger rounded' : ' '}>
                                        <Label className='form-label' for='questions'>
                                            {t('Хичээлийн сэдэвт багцлагдсан асуултууд')}
                                        </Label>
                                        {value && value?.length > 0 ? (
                                            <ul className='border border-2 rounded p-0' style={{ listStyle: 'none' }}>
                                                {value.map((question, index) => {
                                                    return (
                                                        <li className='py-25 px-25 d-flex justify-content-between align-items-center' key={index}>
                                                            <div>
                                                                <span className='px-25'>{index + 1}.</span>
                                                                <span>{question.question}</span>
                                                            </div>
                                                            <div>
                                                                <MinusCircle
                                                                    className='text-danger cursor-pointer'
                                                                    size={16}
                                                                    onClick={() => {
                                                                        setQuestionList([...questionList, question])
                                                                        onChange(value.filter((v) => v.id !== question.id))
                                                                    }}
                                                                />
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        ) : (
                                            ''
                                        )}
                                    </Col>
                                    <Col md={6} className='position-relative'>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <Label className='form-label' for='questions'>
                                                {t('Багцлах боломжтой асуултууд')}
                                            </Label>
                                            <Button
                                                type='button'
                                                className='mb-1'
                                                color='primary'
                                                size='sm'
                                                onClick={() => {
                                                    onChange([...value, ...questionList])
                                                    setQuestionList([])
                                                }}
                                            >
                                                {t('Бүгд')}
                                            </Button>
                                        </div>
                                        {(isLessonLoading || isCurrentTitleLoading || isFreeTitleLoading || isSaveLoading) && Loader}
                                        <ul className='border border-2 rounded p-25' style={{ listStyle: 'none' }}>
                                            {questionList?.map((question, index) => {
                                                return (
                                                    <li className='py-25 px-25 d-flex justify-content-between align-items-center' key={index}>
                                                        <div>
                                                            <span className='px-25'>{(currentPage - 1) * rowsPerPage + index + 1}.</span>
                                                            <span>{question.question}</span>
                                                        </div>
                                                        <div>
                                                            <PlusCircle
                                                                className='text-primary cursor-pointer'
                                                                size={16}
                                                                onClick={() => {
                                                                    onChange([...value, question])
                                                                    setQuestionList(questionList.filter((v) => v.id !== question.id))
                                                                }}
                                                            />
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                            <div className={styles.paginationWrapper}>
                                                <Pagination />
                                            </div>
                                        </ul>
                                    </Col>
                                </>
                            )}
                        />
                        {errors.questions && <FormFeedback className='d-block'>{t(errors.questions.message)}</FormFeedback>}

                        <Col md={12}>
                            <Button type='submit' className='me-1' color='primary' size='sm'>
                                Хадгалах
                            </Button>
                            <Button
                                color='primary'
                                outline
                                size='sm'
                                onClick={() => {
                                    setOpen({ type: false, editTitle: null })
                                }}
                            >
                                Буцах
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </>
    )
}
