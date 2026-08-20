import React, { Fragment, useState,  useCallback, useEffect } from 'react'
import {
    Row,
    Col,
    Button,
    Label,
    Input,
    Spinner
} from "reactstrap";

import { ChevronLeft, Check, ChevronRight } from "react-feather"
import Questions from "./Questions"

import useLoader from "@hooks/useLoader";
import useApi from '@hooks/useApi';
import useToast from '@src/utility/hooks/useToast'

// import QuestionsBlock from './components/QuestionsBlock';
import { useTranslation } from 'react-i18next';
import QuestionTitles from './components/QuestionTitles';


const Asuult = ({ handleModal , stepper, cdata, editData, isEdit, refreshDatas, editDataGeneral, editDataByType }) => {

    const { t } = useTranslation()
    const addToast = useToast()
    const default_page = [0, 5, 10, 15, 20];

    const [popoverIdx, setPopoverIdx] = useState('')
    const [index_name, setIdx] = useState('')
    const [popoverTidx, setPopoverTidx] = useState('')

    const [choiceErrors, setChoiceErrors] = useState({})
    const [questionTitles, setQuestionTitles] = useState([])

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });

    // API
    const surveyAPI = useApi().survey

    // State Array item устгах
    const removeDataField = (index, data, setData) => {
        const dataRow = [...data];
        dataRow.splice(index, 1);
        setData(dataRow);
    }

    // Сонголтын зурагны popover
    const handlePopOver = useCallback(
        (cidx='', idx="", tidx='') =>
        {
            if (popoverIdx === cidx) {
                setPopoverIdx('')
            } else {
                setPopoverIdx(cidx)
            }
            setIdx(idx)
            setPopoverTidx(tidx)

        }, [popoverIdx]
    )

    // #region to manage questions local state
    // Асуулт нэмэх
    function handleAddQuestion (generateNumber, setQuestions, copyIndex) {
        setQuestions((questions) => {
            const generatesDatas = []

            if (copyIndex >= 0) {
                const generatesDatasItem = { ...questions[copyIndex] }
                generatesDatasItem.rating_words = [...(questions[copyIndex].rating_words ?? [])]
                generatesDatasItem.choices = questions[copyIndex].choices.map(choice => ({ ...choice }))
                return [...questions, generatesDatasItem]
            } else {
                const cvalues = {
                    kind: '',
                    imageUrl: '',
                    image: '',
                    rating_max_count: '',
                    rating_words: [],
                    max_choice_count: '',
                    choices: [],
                }

                if (generateNumber === 0) {
                    return generatesDatas
                } else if (generateNumber) {
                    for (let i = 0; i < generateNumber; i++) {
                        generatesDatas.push({...cvalues})
                    }

                    return generatesDatas
                } else {
                    return [...questions, cvalues];
                }
            }
        })
    }

    // Асуултын тоог generate хийх
    function handlePerPage(e, setQuestions) {
        var value = parseInt(e.target.value)

        if (value) {
            handleAddQuestion(value, setQuestions)
        }
	}

    // Асуултын сонголт нэмэх
    const handleAddChoice =
        (index, setQuestions) => {
            setQuestions((questions) => {
                const data = [...questions];

                var row_choices = questions[index].choices

                const cvalues = {
                    choices: '',
                    imageUrl: '',
                    image: '',
                    imageName: '',
                }

                data[index]['choices'] = [...row_choices, cvalues]

                return data;
            })
        }

    // Сонголтын мөр устгах
    const removeChoicesField =
        (index, choice_idx, setQuestions) => {
            setQuestions((questions) => {
                const data = [...questions];

                var row_choices = questions[index].choices

                var crow_choices = [...row_choices]

                crow_choices.splice(choice_idx, 1);

                data[index]['choices'] = crow_choices

                return data;
            })
        }

    // Асуулт onChange
    const onHandleChange =
        (index, value, name, setQuestions) => {
            setQuestions((questions) => {
                const data = [...questions];

                if(data && data.length > 0) {

                    if (name === 'image') {
                        if (value.length > 0) {

                            data[index]['image'] = value[0]
                            data[index]['imageName'] = value[0]?.name

                            var generalDataImg = window.URL.createObjectURL(value[0])

                            data[index]['imageUrl'] = generalDataImg
                        }
                    } else if (name === 'rating_max_count') {
                        if (questions[index].rating_words) questions[index].rating_words?.splice(value)
                        else questions[index].rating_words = Array.from({length: value},(_, vidx) => '')
                        data[index][name] = value
                    } else {
                        data[index][name] = value
                    }
                }
                return data;
            })
        }

    // Rating word onChange
    const onHandleRatingWordChange =
        (index, rating_word_idx, value, setQuestions) =>
        {
            setQuestions((questions) => {
                const data = [...questions];
                const row_rating_words = questions[index].rating_words
                row_rating_words[rating_word_idx] = value
                data[index]['rating_words'] = row_rating_words
                return data;
            })
        }

    // Асуултын сонголт onChange
    const onHandleChoiceChange =
        (index, choice_idx, value, name, setQuestions) =>
        {
            setQuestions((questions) => {
                const data = [...questions];
                var row_choices = questions[index].choices

                if (name == 'image') {
                    if (value.length > 0) {

                        row_choices[choice_idx]['image'] = value[0]
                        var generalDataImg = window.URL.createObjectURL(value[0])

                        row_choices[choice_idx]['choices'] = ''
                        row_choices[choice_idx]['imageUrl'] = generalDataImg
                        row_choices[choice_idx]['imageName'] = value[0]?.name

                        data[index]['choices'] = row_choices

                        setPopoverIdx('')
                        return data;
                    }
                } else {

                    row_choices[choice_idx][name] = value

                    data[index]['choices'] = row_choices

                    return data;
                }
            })
        }

    // Асуултын зураг устгах
    const handleDeleteImage =
        (index, setQuestions) =>
        {
            setQuestions((questions) => {
                const dataRow = [...questions];
                dataRow[index]['image'] = ''
                dataRow[index]['imageUrl'] = ''
                dataRow[index]['imageName'] = ''

                return dataRow;
            })
        }

    // Зураг дээр дарахад
    const clickLogoImage =
        (idx) =>
        {
            var logoInput = document.getElementById(`logoInput${idx}`)

            logoInput.click()
        }

    // Хариултын зураг дээр дарахад
    const clickAnswerImg =
        (idx) =>
        {
            var logoImgInput = document.getElementById(`imgInput${idx}`)

            logoImgInput.click()
        }

    // Хариултын зураг устгах
    const handleDeleteChoiceImage =
        (idx, cIdx, setQuestions) =>
        {
            setQuestions((questions) => {
                const data = [...questions];
                var row_choices = questions[idx].choices

                row_choices[cIdx]['image'] = ''
                row_choices[cIdx]['imageUrl'] = ''
                row_choices[cIdx]['imageName'] = ''

                data[idx]['choices'] = row_choices

                return data;
            })
        }
    // #endregion

    // #region to manage questions global state
    const onSubmit = async () => {
        // to build formData
        const formData = new FormData()
        formData.append('questionTitles', JSON.stringify(questionTitles))
        formData.append('data', JSON.stringify(cdata))

        for (let i = 0; i < questionTitles.length; i++) {
            for (let j = 0; j < questionTitles[i].questions.length; j++) {
                for (let k = 0; k < questionTitles[i].questions[j].choices.length; k++) if (questionTitles[i].questions[j].choices[k].image) formData.append(`choiceImg${i}_${j}_${k}`, questionTitles[i].questions[j].choices[k].image)
                if (questionTitles[i].questions[j].image) formData.append(`questionImg${i}_${j}`, questionTitles[i].questions[j].image)
            }
        }

        // to call api
        let response = null
        if (Object.keys(editData).length > 0) response = await fetchData(surveyAPI.put(formData, editData?.id))
        else response = await fetchData(surveyAPI.post(formData))
        const { success, errors } = response

        if (success) {
            handleModal()
            refreshDatas()

        } else if (errors) {
            addToast({
                type: 'error',
                text: (
                    <div style={{
                        whiteSpace: 'pre-wrap',
                        display: 'inline-block',
                        wordBreak: 'break-word',
                        maxWidth: 'none'
                    }}>
                        {Object.keys(errors).map((key, index) => <div key={index}>{key}: {errors[key].join('. ')}</div>)}
                    </div>
                )
            })
        }
    }

    /**
     * to shallow copy object items in array to theirself
     * @param {Array} arrayWithDictItems array with objects: [{}, {}, {}...]
     */
    function copyDictItemsOfArray(arrayWithDictItems) {
        for (let i = 0; i < arrayWithDictItems?.length; i++) {
            arrayWithDictItems[i] = { ...arrayWithDictItems[i] }
        }
    }

    /**
     * to shallow copy array field to itself
     * @param {Object} parent object with array field. {fieldname: []}
     * @param {String} field array field name
     */
    function copyArrayIfExist(parent, field) {
        if (parent && Object.prototype.hasOwnProperty.call(parent, field) && Array.isArray(parent[field])) parent[field] = [...parent[field]]
    }

    /**
     * to copy editData
     * @param {Object} editData editData
     * @returns copy of editData
     */
    function getEditDataCopy(editData) {
        const editDataCopy = { ...editData }

        // to copy dicts and arrays
        copyArrayIfExist(editDataCopy, 'oyutans')
        copyArrayIfExist(editDataCopy, 'teachers')
        if (editDataCopy.scope_kind) editDataCopy.scope_kind = { ...editDataCopy.scope_kind }

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

    /**
     * to merge fields of objects into destination object
     * @param {Object} editDataDestination destination to merge
     * @param {Object} editDataSource source to merge
     * @returns destination object with merged fields from source object
     */
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

    /**
     * to sort array inside object in specified field
     * @param {Object} data object with array to sort
     * @param {String} arrayField array field name
     * @param {String} sortField sort field name
     * @returns object with sorted array field
     */
    function sortArrayInObject(data, arrayField, sortField) {
        if (!data[arrayField]) return
        data[arrayField].sort((a, b) => a[sortField] - b[sortField]);
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
    // #endregion

    // function DisabledButton(){
    //     if () {
    //         <Button color='primary' className='btn-next' type="submit" onClick={onSubmit} >
    //             <span className='align-middle d-sm-inline-block d-none'>Бүртгэх <Check size={14} className='align-middle ms-sm-25 ms-0' /></span>
    //         </Button>
    //     } else {
    //         <Button color='primary' className='btn-next' type="submit" >
    //             <span className='align-middle d-sm-inline-block d-none'>Бүртгэх <Spinner size={14} className='align-middle ms-sm-25 ms-0' /></span>
    //         </Button>
    //     }
    // }

    // Асуултын сэдэв нэмэх
    function handleAddQuestionTitle (generateNumber) {
        const generatesDatas = []

        const cvalues = {
            name: '',
        }

        if (generateNumber === 0) {
            setQuestionTitles(generatesDatas)
        } else if (generateNumber) {
            for (let i = 0; i < generateNumber; i++) {
                generatesDatas.push({...cvalues})
            }

            setQuestionTitles(generatesDatas)
        } else {
            setQuestionTitles([...questionTitles, cvalues]);
        }
    }

    // Асуултын сэдвийн тоог generate хийх
    function handleAddQuestionTitleMulti(e) {
        const value = parseInt(e.target.value)

        if (value) {
            handleAddQuestionTitle(value)
        }
	}

    // Асуултын сэдэв onChange
    const onHandleChangeTitle = useCallback (
        (index, value, name) => {
            const data = [...questionTitles];

            if(data && data.length > 0) {
                data[index][name] = value
            }

            setQuestionTitles(data);
        },

        [questionTitles]
    )

    return (
        <Fragment>
            {isLoading && Loader}
            <Row>
                <h3>{'Судалгааны асуултын сэдэв'} {isEdit ? 'засах' : 'нэмэх'}</h3>
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
                            onChange={(e) => handleAddQuestionTitleMulti(e)}
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
					removeDataField={removeDataField}
					onHandleChange={onHandleChange}
					handleAddChoice={handleAddChoice}
					choiceErrors={choiceErrors}
					onHandleRatingWordChange={onHandleRatingWordChange}
					handleDeleteImage={handleDeleteImage}
					clickLogoImage={clickLogoImage}
					handlePopOver={handlePopOver}
					popoverIdx={popoverIdx}
					popoverTidx={popoverTidx}
					index_name={index_name}
					readOnly={false}
					handleAddQuestion={handleAddQuestion}
					default_page={default_page}
					handlePerPage={handlePerPage}
					isEdit={isEdit}
                    questionTitles={questionTitles}
                    onHandleChangeTitle={onHandleChangeTitle}
                    setQuestionTitles={setQuestionTitles}

                    // #region this props are being used in ChoiceInput component
                    removeChoicesField={removeChoicesField}
                    onHandleChoiceChange={onHandleChoiceChange}
                    clickAnswerImg={clickAnswerImg}
                    handleDeleteChoiceImage={handleDeleteChoiceImage}
                    // #endregion
                />
                <div>
                    <Button color="primary" size='sm' className="mt-2" onClick={() => handleAddQuestionTitle(null)}>
                        {t('Асуултын сэдэв нэмэх')}
                    </Button>
                </div>
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


