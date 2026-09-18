import '@styles/react/libs/flatpickr/flatpickr.scss';
import { t } from 'i18next';
import { useEffect, useRef } from 'react';
import { Plus } from 'react-feather';
import { FormProvider, useFieldArray, useForm } from "react-hook-form";

import {
    Button,
    Col,
    Form,
    FormFeedback,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from "reactstrap";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { formFieldNames, getOnlySpecifiedFields, KIND_BOOLEAN, KIND_MULTI_CHOICE, KIND_ONE_CHOICE, nullifyLackFields, nullifySpecifiedValues, parseObjectPath } from '@src/views/RemoteLesson/utils';

import SingleQuestion from './components/SingleQuestion';

export default function AddEditQuezQuestionsTotally({
    open,
    handleModal: handleModalOriginal,
    refreshDatas,
    onlineSubInfoId,
    editData: editDataOriginal,
}) {
    const editData = editDataOriginal?.editData
    const editQuezChoicesDatas = editDataOriginal?.editQuezChoicesDatas
    const visibleFieldsRef = useRef(new Set())

    const methods = useForm({
        defaultValues: {
            questions: [{
                ...Object.keys(formFieldNames.quezQuestions).reduce((acc, current) => {
                    acc[current] = ''
                    return acc
                }, [{}])
            }]
        }
    })

    const { control, handleSubmit, setError, setValue, reset, formState: { errors } } = methods

    const handleModal = () => {
        reset()
        handleModalOriginal()
    }

    const { fetchData, isLoading, Loader } = useLoader({ isFullScreen: true });
    const remoteApi = useApi().remote

    function receiveEditData(localData, fieldName, fieldIndex) {
        const answers = []

        for (let i = 0; i < localData.length; i++) {
            const localDataItem = localData[i]
            const answer = {}

            for (let key in localDataItem) {
                let finalValue = ''
                const value = localDataItem[key]

                if (value !== null && value !== undefined) {
                    if (key === 'choices') {
                        key = 'value'
                        finalValue = value
                    } else finalValue = value
                }

                answer[key] = finalValue
            }

            answers.push(answer)
        }

        setValue(`${fieldName}[${fieldIndex}].answers`, answers)
    }

    useEffect(() => {
        if (editData) {
            const questions = []

            for (let i = 0; i < editData.length; i++) {
                const editDataItem = editData[i]
                const question = {}

                for (let key in editDataItem) {
                    let finalValue = ''
                    const value = editDataItem[key]

                    if (value !== null && value !== undefined) {
                        finalValue = value
                    }

                    question[key] = finalValue
                }

                if ([KIND_MULTI_CHOICE, KIND_ONE_CHOICE].includes(editDataItem.kind)) {
                    const quezChoicesFiltered = editQuezChoicesDatas.filter(item => item.quez_question_id === editDataItem.id)
                    receiveEditData(quezChoicesFiltered, 'questions', 0)
                } else if ([KIND_BOOLEAN].includes(editDataItem.kind)) {
                    const booleanChoices = [
                        {
                            value: 'Тийм',
                            is_correct: editDataItem.yes_or_no === 1,
                        },
                        {
                            value: 'Үгүй',
                            is_correct: editDataItem.yes_or_no === 0,
                        }
                    ]

                    receiveEditData(booleanChoices, 'questions', 0)
                }

                questions.push(question)
            }

            appendQuestions('questions', questions)
        }
    }, [editData])

    async function onSubmit(cdata) {
        const visibleFieldByQuestion = []

        // #region to clear all unspecified fields, because they will be left by default, for example after kind changing from rating to one-choice then rating fields (max rating count, etc) will be stayed as trash
        const visibleFields = Array.from(visibleFieldsRef.current)

        for (let i = 0; i < visibleFields.length; i++) {
            const visibleField = visibleFields[i]
            const [arrayName, index, key] = parseObjectPath(visibleField)
            if (!visibleFieldByQuestion[index]) visibleFieldByQuestion[index] = { questionVisibleFields: [] }

            if (key === 'answers') {
                const visibleFieldOfAnswer = visibleField.replace(/^questions\[\d+\]\./, "")
                const [arrayName, indexAnswer, keyAnswer] = parseObjectPath(visibleFieldOfAnswer)
                if (!visibleFieldByQuestion[index].answers) visibleFieldByQuestion[index].answers = []
                if (!visibleFieldByQuestion[index].answers[indexAnswer]) visibleFieldByQuestion[index].answers[indexAnswer] = []
                visibleFieldByQuestion[index].answers[indexAnswer].push(keyAnswer)
                if (!visibleFieldByQuestion[index].questionVisibleFields.includes('answers')) visibleFieldByQuestion[index].questionVisibleFields.push(key)
            } else visibleFieldByQuestion[index].questionVisibleFields.push(key)
        }
        // #endregion

        // #region to build formdata
        // to add missing fields as null
        const allFormNames = Object.keys(formFieldNames.quezQuestions).map(key => formFieldNames.quezQuestions[key])
        allFormNames.push('answers')
        const allFormNamesChoices = Object.keys(formFieldNames.quezChoices).map(key => formFieldNames.quezChoices[key])
        const nullifyingValues = [undefined, '']

        const questions = []
        const cdataOriginal = cdata
        const formData = new FormData()

        for (let i = 0; i < cdataOriginal.questions.length; i++) {
            cdata = cdataOriginal.questions[i]
            visibleFieldByQuestion[i].questionVisibleFields.push('id')
            cdata = getOnlySpecifiedFields(cdata, visibleFieldByQuestion[i].questionVisibleFields)
            cdata['onlineSubInfoId'] = onlineSubInfoId
            cdata = nullifySpecifiedValues(cdata, nullifyingValues)
            cdata = nullifyLackFields(cdata, allFormNames)

            if (visibleFieldByQuestion[i].answers) {
                let answers = cdataOriginal.questions[i].answers
                for (let j = 0; j < answers.length; j++) {
                    if ([KIND_MULTI_CHOICE,KIND_ONE_CHOICE].includes(cdata.kind)) {
                        answers[j].choices = answers[j].value
                        visibleFieldByQuestion[i].answers[j].push('choices')
                    } else if ([KIND_BOOLEAN].includes(cdata.kind)) {
                        if (answers[j].is_correct) {
                            answers[j].yes_or_no = answers[j].value === 'Тийм' ? 1 : 0
                            visibleFieldByQuestion[i].answers[j].push('yes_or_no')
                        }
                    }

                    delete answers[j]['value']
                    visibleFieldByQuestion[i].answers[j].push('id')
                    answers[j] = getOnlySpecifiedFields(answers[j], visibleFieldByQuestion[i].answers[j])
                    answers[j] = nullifySpecifiedValues(answers[j], nullifyingValues)
                    answers[j] = nullifyLackFields(answers[j], allFormNamesChoices)

                    if (answers[j].image) formData.append(`question[${i}].choice[${j}].image`, answers[j].image)
                }
            }

            questions.push(cdata)

            if (cdata.image) formData.append(`question[${i}].image`, cdata.image)
        }

        formData.append('json_data', JSON.stringify(questions))
        // #endregion

        let apiFunc = null

        if (editData) apiFunc = () => remoteApi.quezQuestions.put(formData, 'totally')
        else apiFunc = () => remoteApi.quezQuestions.post(formData)

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

    const { fields: fieldsQuestions, append: appendQuestions, remove: removeQuestions } = useFieldArray({
        control,
        name: "questions",
    });

    function addQuestion() {
        appendQuestions()
    }

    return (
        <Modal
            isOpen={open}
            toggle={handleModal}
            className="modal-dialog-centered modal-lg"
            contentClassName="pt-0"
            fade={true}
            backdrop='static'
        >
            <ModalHeader toggle={handleModal} className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }}>
                {
                    editData !== undefined
                        ?
                        t('Асуулт засах')
                        :
                        t('Асуулт нэмэх')
                }
            </ModalHeader>
            <ModalBody className="flex-grow-50 mb-3 t-0">
                {isLoading && Loader}
                <FormProvider {...methods}>
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        {
                            fieldsQuestions.map((item, index) => {
                                return (
                                    <Col className='mb-2' md={12} key={item.id}>
                                        <SingleQuestion
                                            fieldsQuestions={fieldsQuestions}
                                            fieldIndex={index}
                                            fieldName={`questions`}
                                            fieldAppend={appendQuestions}
                                            fieldRemove={removeQuestions}
                                            visibleFieldsRef={visibleFieldsRef}
                                        />
                                    </Col>
                                )
                            })
                        }
                        <Col md={12} className={'p-0 mt-1'}>
                            <Button className='w-100 align-items-center py-50' color='primary' outline size='sm' onClick={() => { addQuestion() }}>
                                <Plus className='' size={12} />
                                <span className=''>{t('Асуулт нэмэх')}</span>
                            </Button>
                            {errors.questions && <FormFeedback className='d-block'>"questions": {t(errors.questions.message)}</FormFeedback>}
                            {errors.choices && <FormFeedback className='d-block'>"choices": {t(errors.choices.message)}</FormFeedback>}
                            {errors.score && <FormFeedback className='d-block'>"score": {t(errors.score.message)}</FormFeedback>}
                            {errors.image && <FormFeedback className='d-block'>"image": {t(errors.image.message)}</FormFeedback>}
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
                </FormProvider>
            </ModalBody>
        </Modal>
    )
}