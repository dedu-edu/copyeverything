import React, { Fragment, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from "react-feather"
import { useTranslation } from 'react-i18next';

import {
    Row,
    Col,
    Button,
    Label,
    Input,
} from "reactstrap";

import useLoader from "@hooks/useLoader";
import useApi from '@hooks/useApi';

import QuestionTitles from './components/QuestionTitles';

const default_page = [0, 5, 10, 15, 20]

const cvalues = {
    name: '',
    questions: [],
}

function sortArrayInObject(data, arrayField, sortField) {
    if (!data[arrayField]) return
    data[arrayField].sort((a, b) => a[sortField] - b[sortField]);
}

const Asuult = ({ handleModal, stepper, data, editData, isEdit, refreshDatas, editDataGeneral, editDataByType }) => {
    const { t } = useTranslation()

    // TODO
    const [errors, setErrors] = useState({})

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });

    // API
    const surveyAPI = useApi().survey

    const onSubmit = async () => {
        var formData = new FormData()
        const questions = []

        for (let i = 0; i < questionTitles.length; i++) {
            const questionTitle = questionTitles[i]
            const questionItems = questionTitle.questions

            for (let j = 0; j < questionItems.length; j++) {
                const questionItem = { ...questionItems[j] }
                questionItem.titleName = questionTitle.name

                questionItem.title = {
                    id: questionTitle.id,
                    name: questionTitle.name
                }

                questions.push(questionItem)
            }
        }

        for (let idx in questions) {

            var choices = questions[idx].choices
            var quesionImg = questions[idx].image

            if (quesionImg) {
                formData.append('questionImg', quesionImg)
            }

            for (let ckey in choices) {
                var choiceImg = choices[ckey].image

                if (choiceImg) {
                    formData.append('choiceImg', choiceImg)
                }
            }

            formData.append('question', JSON.stringify(questions[idx]))
        }

        var selectedIds = data.selected_ids
        if (selectedIds != undefined) {
            delete data.selected_ids

            selectedIds.forEach(element => {
                formData.append('selected_id', element)
            });
        }

        for (let key in data) {
            if (key === 'soul_teacher' && Array.isArray(data[key])) {
                const soul_teacher_ids = data[key].map(item => item.id)
                formData.append(key, soul_teacher_ids)
            } else formData.append(key, data[key])
        }

        // Update хийх хэсэг
        if (Object.keys(editData).length > 0) {
            const { success, error } = await fetchData(surveyAPI.put(formData, editData?.id))

            if (success) {
                handleModal()
                refreshDatas()
            }
        } else {
            const { success, error } = await fetchData(surveyAPI.post(formData))

            if (success) {
                handleModal()
                refreshDatas()
            }
        }
    }

    const [questionTitles, setQuestionTitles] = useState([])

    // Асуултын сэдэв нэмэх
    function addTitles(title, count) {
        if (count === 0) {
            setQuestionTitles([])
            return
        }

        const newTitles = [...questionTitles]
        for (let i = 0; i < count; i++) newTitles.push(title)
        setQuestionTitles(newTitles)
    }

    function copyDictItemsOfArray(arrayWithDictItems) {
        for (let i = 0; i < arrayWithDictItems?.length; i++) {
            arrayWithDictItems[i] = { ...arrayWithDictItems[i] }
        }
    }

    function copyArrayIfExist(parent, field) {
        if (parent && Object.prototype.hasOwnProperty.call(parent, field) && Array.isArray(parent[field])) parent[field] = [...parent[field]]
    }

    function getEditDataCopy(editData) {
        const editDataCopy = { ...editData }

        // to copy dicts and arrays
        copyArrayIfExist(editDataCopy, 'oyutans')
        copyArrayIfExist(editDataCopy, 'teachers')
        if (editDataCopy.scope) editDataCopy.scope = { ...editDataCopy.scope }

        // #region to copy nested array of dicts
        copyArrayIfExist(editDataCopy, 'question_titles')
        copyDictItemsOfArray(editDataCopy?.question_titles)

        for (let j = 0; j < editDataCopy?.question_titles?.length; j++) {
            copyArrayIfExist(editDataCopy.question_titles[j], 'questions')
            copyDictItemsOfArray(editDataCopy.question_titles[j]?.questions)

            for (let i = 0; i < editDataCopy.question_titles[j]?.questions?.length; i++) {
                copyArrayIfExist(editDataCopy.question_titles[j].questions[i], 'choices')
                copyDictItemsOfArray(editDataCopy.question_titles[j].questions[i]?.choices)

                copyArrayIfExist(editDataCopy.question_titles[j].questions[i], 'rating_words')
            }
        }
        // #endregion

        return editDataCopy
    }

    function getMergedEditData(editDataDestination, editDataSource) {
        const editDataSourceCopy = getEditDataCopy(editDataSource)
        let editDataDestinationCopy = getEditDataCopy(editDataDestination)

        const editDataDestinationCopyQuestionTitles = editDataDestinationCopy.question_titles
        editDataDestinationCopy = { ...editDataDestinationCopy, ...editDataSourceCopy }
        if (editDataSourceCopy.question_titles?.length) editDataDestinationCopy.question_titles = []

        for (let i = 0; i < editDataSourceCopy.question_titles?.length; i++) {
            const editDataDestinationCopyQuestionTitle = editDataDestinationCopyQuestionTitles?.[i] ? editDataDestinationCopyQuestionTitles[i] : []
            const editDataDestinationCopyQuestionTitlesQuestions = editDataDestinationCopyQuestionTitles?.[i].questions
            editDataDestinationCopy.question_titles.push({ ...editDataDestinationCopyQuestionTitle, ...editDataSourceCopy.question_titles[i] })
            if (editDataSourceCopy.question_titles[i].questions?.length) editDataDestinationCopy.question_titles[i].questions = []

            for (let j = 0; j < editDataSourceCopy.question_titles[i].questions?.length; j++) {
                const editDataDestinationCopyQuestionTitlesQuestion = editDataDestinationCopyQuestionTitlesQuestions?.[j] ? editDataDestinationCopyQuestionTitlesQuestions[j] : []
                const editDataDestinationCopyQuestionTitlesQuestionsChoices = editDataDestinationCopyQuestionTitlesQuestions?.[j].choices
                editDataDestinationCopy.question_titles[i].questions.push({ ...editDataDestinationCopyQuestionTitlesQuestion, ...editDataSourceCopy.question_titles[i].questions[j] })
                if (editDataSourceCopy.question_titles[i].questions[j].choices?.length) editDataDestinationCopy.question_titles[i].questions[j].choices = []

                for (let k = 0; k < editDataSourceCopy.question_titles[i].questions[j].choices?.length; k++) {
                    const editDataDestinationCopyQuestionTitlesQuestionsChoice = editDataDestinationCopyQuestionTitlesQuestionsChoices?.[k] ? editDataDestinationCopyQuestionTitlesQuestionsChoices[k] : []
                    editDataDestinationCopy.question_titles[i].questions[j].choices.push({ ...editDataDestinationCopyQuestionTitlesQuestionsChoice, ...editDataSourceCopy.question_titles[i].questions[j].choices[k] })
                }
            }
        }

        return editDataDestinationCopy
    }

    useEffect(() => {
        if (
            editDataGeneral && Object.prototype.hasOwnProperty.call(editDataGeneral, 'question_titles') &&
            editDataByType && Object.prototype.hasOwnProperty.call(editDataByType, 'question_titles')
        ) {
            let mergedEditData = getMergedEditData(editData, editDataGeneral)
            mergedEditData = getMergedEditData(mergedEditData, editDataByType)

            // #region to sort (in backend it is very heavy for servers)
            sortArrayInObject(mergedEditData, 'question_titles', 'id')

            for (let i = 0; i < mergedEditData?.question_titles?.length; i++) {
                const title = mergedEditData?.question_titles[i]
                sortArrayInObject(title, 'questions', 'id')

                for (let j = 0; j < title?.questions?.length; j++) {
                    const question = title?.questions[j]
                    sortArrayInObject(question, 'choices', 'id')
                }
            }
            // #endregion

            if (mergedEditData?.question_titles) setQuestionTitles(mergedEditData.question_titles)
        }
    }, [editDataGeneral, editDataByType])

    return (
        <Fragment>
            {isLoading && Loader}
            <Row>
                <h3>{'Судалгааны асуултын сэдэв'} {isEdit ? 'засах2' : 'нэмэх'}</h3>
            </Row>
            <Row>
                {
                    !isEdit &&
                    <Col
                        md={4}
                        sm={12}
                    >
                        <hr></hr>
                        <Label className='form-label'>
                            {"Хуудсанд харуулах асуултын сэдвийн тоо"}
                        </Label>
                        <Input
                            type="select"
                            bsSize="sm"
                            style={{ height: "30px", width: '100%' }}
                            onChange={(e) => {
                                const count = parseInt(e.target.value)
                                addTitles(cvalues, count)
                            }}
                        >
                            {default_page.map((page, idx) => (
                                <option key={idx} value={page}>
                                    {page}
                                </option>
                            ))}
                        </Input>
                    </Col>
                }
                <QuestionTitles
                    errors={errors}
                    isEdit={isEdit}
                    questionTitles={questionTitles}
                    setQuestionTitles={setQuestionTitles}
                />
                {
                    !isEdit &&
                    <div>
                        <Button color="primary" size='sm' className="mt-2" onClick={() => addTitles(cvalues, 1)}>
                            {t('Асуултын сэдэв нэмэх')}
                        </Button>
                    </div>
                }
            </Row>
            <Col md={12} className="text-center mt-2">
                <div className='d-flex justify-content-between mt-3'>
                    <Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
                        <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                        <span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
                    </Button>
                    <Button color='primary' className='btn-next ' type="submit" onClick={onSubmit}>
                        <span className='align-middle d-sm-inline-block'>Бүртгэх <ChevronRight size={14} className='align-middle ms-sm-25 ms-0' /></span>
                    </Button>
                </div>
            </Col>
        </Fragment>
    )
}
export default Asuult;


