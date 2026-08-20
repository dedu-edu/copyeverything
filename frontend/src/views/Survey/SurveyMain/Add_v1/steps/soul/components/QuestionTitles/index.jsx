import {
	Col,
	Input,
	Label,
	Row
} from "reactstrap";

import { Button } from 'reactstrap';
import classnames from "classnames";

import { useCallback } from "react";
import Questions from "../../Questions";

const default_page = [0, 5, 10, 15, 20]

export default function QuestionTitles({
	errors,
	isEdit,
	questionTitles,
	setQuestionTitles,
}) {
	const cvalues = {
		kind: '',
		rating_max_count: '',
		rating_words: [],
	}

	// Асуултын сэдэв onChange
	const onHandleChangeTitle = useCallback(
		(index, value, name) => {
			const data = [...questionTitles];

			if (data && data.length > 0) {
				data[index][name] = value
			}

			setQuestionTitles(data);
		},

		[questionTitles]
	)

	function addQuestions(titleIndex, question, count) {
		const newTitles = [...questionTitles]

		const newTitle = { ...newTitles[titleIndex] }
		newTitles[titleIndex] = newTitle

		const newQuestions = [...newTitle.questions]

		if (count === 0) {
			newTitle.questions = []
			setQuestionTitles(newTitles)
			return
		}

		newTitle.questions = newQuestions
		for (let i = 0; i < count; i++) newQuestions.push(question)
		setQuestionTitles(newTitles)
	}

	function replaceQuestion(titleIndex, index, question) {
		const newTitles = [...questionTitles]

		const newTitle = { ...newTitles[titleIndex] }
		newTitles[titleIndex] = newTitle

		const newQuestions = [...newTitle.questions]
		newTitle.questions = newQuestions

		newQuestions[index] = question
		setQuestionTitles(newTitles)
	}

	function copyArrayFieldIfExist(object, arrayField) {
		if (Object.prototype.hasOwnProperty.call(object, arrayField)) object[arrayField] = [...object[arrayField]]
	}

	function deepCopyQuestion(question) {
		const result = { ...question }
		copyArrayFieldIfExist(result, 'rating_words')
		return result
	}

	function copyQuestion(titleIndex, index) {
		const questions = questionTitles[titleIndex].questions
		const newQuestion = deepCopyQuestion(questions[index])
		addQuestions(titleIndex, newQuestion, 1)
	}

    // Асуулт onChange
    function changeQuestion(titleIndex, index, value, name) {
		const question = questionTitles[titleIndex].questions[index]
		const newQuestion = deepCopyQuestion(question)

		if (name === 'rating_max_count') newQuestion.rating_words.splice(value)
		newQuestion[name] = value

		replaceQuestion(titleIndex, index, newQuestion)
	}

    function removeQuestion(titleIndex, index) {
		const newTitles = [...questionTitles]

		const newTitle = { ...newTitles[titleIndex] }
		newTitles[titleIndex] = newTitle

		const newQuestions = [...newTitle.questions]
		newTitle.questions = newQuestions

		newQuestions.splice(index, 1);
		setQuestionTitles(newTitles)
	}

	const removeTitle = (index) => {
		const newTitles = [...questionTitles]
		newTitles.splice(index, 1)
		setQuestionTitles(newTitles)
	}

	return questionTitles.map((questionTitlesItem, idx) => {
		const { name, questions } = questionTitlesItem;

		return (
			<div className='added-cards mt-1' key={idx} >
				<div className={classnames('cardMaster rounded border p-1')}>
					<Row className='mt-1'>
						<Row>
							<div className='d-flex justify-content-between'>
								<h5>{`Асуултын сэдэв(${idx + 1})`}</h5>
								{
									!isEdit &&
									<div className=''>
										<Button color="danger" size='sm' outline onClick={() => removeTitle(idx)}>
											Устгах
										</Button>
									</div>
								}
							</div>
						</Row>
						<Row>
							<Col md={6} className='mt-1'>
								<Label className="form-label" htmlFor="name">
									{'Асуултын сэдэв'}
								</Label>
								<Input
									id="name"
									name="name"
									bsSize="sm"
									placeholder="Асуултын сэдвээ бичнэ үү"
									type="text"
									value={name || ''}
									onChange={(e) => onHandleChangeTitle(idx, e.target.value, e.target.name)}
								/>
							</Col>
						</Row>
						<div className="mt-1">
							<h3>{'Судалгааны асуулт'} {isEdit ? 'засах' : 'нэмэх'}</h3>
							{
								!isEdit &&
								<Col
									md={4}
									sm={12}
								>
									<hr></hr>
									<Label className='form-label'>
										{"Хуудсанд харуулах асуултын тоо"}
									</Label>
									<Input
										type="select"
										bsSize="sm"
										style={{ height: "30px", width: '100%' }}
										onChange={(e) => {
											const count = parseInt(e.target.value)
											if (count) addQuestions(idx, cvalues, count)
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
							<Questions
								questions={questions}
								errors={errors}
								changeQuestion={changeQuestion}
								titleIndex={idx}
								copyQuestion={copyQuestion}
								questionTitles={questionTitles}
								isEdit={isEdit}
								removeQuestion={removeQuestion}
							/>
							{
								!isEdit &&
								<div className=''>
									<Button color="primary" size='sm' className="mt-2" onClick={() => addQuestions(idx, cvalues, 1)}>
										Асуулт нэмэх
									</Button>
								</div>
							}
						</div>
					</Row>
				</div>
			</div>
		)
	})
}
