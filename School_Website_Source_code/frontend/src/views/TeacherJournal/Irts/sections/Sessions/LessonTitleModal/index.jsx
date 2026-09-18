import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap";

import useLoader from "@src/utility/hooks/useLoader";
import useApi from "@src/utility/hooks/useApi";
import { lessonTypes } from "@src/views/TeacherJournal/Irts/constants";
import AuthContext from "@src/utility/context/AuthContext";
import CustomModal from "@src/views/TeacherJournal/components/CustomModal";


const formKeys = ['title', 'content', 'lesson_type', 'lesson', 'week', 'lesson_season']

function isEmptyFields(dict) {
	const keys = Object.keys(dict)

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i]
		if (![undefined, null, ''].includes(dict[key])) return false
	}

	return true
}

export default function LessonTitleModal({
	clicked,
	setClicked,
	getIrts,
	getTimeTables
}) {
	// #region hooks
	const { t } = useTranslation()
	const { isLoading, fetchData, Loader } = useLoader({})
	const { user: userDetail } = useContext(AuthContext)

	// api
	const teacherJournalApi = useApi().teacherJournal
	const basicApi = useApi().basic

	const [open, setOpen] = useState(false);
	const [confirmModal, setConfirmModal] = useState();
	const [selectedExistingTitleId, setSelectedExistingTitleId] = useState(clicked?.id);

	// form
	const [title, setTitle] = useState(clicked?.title ?? '');
	const [content, setContent] = useState(clicked?.content ?? '');
	const [lessonType, setLessonType] = useState(clicked?.lesson_type ?? '');
	const [formErrors, setFormErrors] = useState(formKeys.reduce((acc, item) => { acc[item] = ''; return acc }, {}))

	useEffect(() => {
		handleClick()
	}, [clicked])
	// #endregion hooks

	function closeModal() {
		setOpen(false)
		setClicked(null)
	}

	const handleClick = () => {
		if (!clicked) {
			closeModal()
			return
		}

		setOpen(true);
	};

	function changeLessonTitle() {
		if (!userDetail.id) return

		function successHandler(data) {
			fetchData(basicApi.patch('lms_TimeTable', clicked?.timetableId, {
				type: lessonType,
				updated_user: userDetail.id,

			})).then(res => {
				getIrts()
				getTimeTables()
				closeModal()

			}).catch(err => {
				errorsHanlder(err)
			})
		}

		function errorsHanlder(errors) {
			console.error('Error:', errors)
			const newErrors = {}

			Object.keys(errors).forEach(key => {
				if (formKeys.includes(key)) newErrors[key] = errors[key]
				else if ('non_field_errors' === key) newErrors[key] = errors[key]
			})

			setFormErrors(newErrors)
		}

		if (selectedExistingTitleId) {
			fetchData(basicApi.patch('lms_Lesson_title_plan', selectedExistingTitleId, {
				lesson: clicked.lesson,
				week: clicked.week,
				lesson_season: clicked.lesson_season,
				title: title,
				content: content,
				lesson_type: lessonType,

			})).then(res => {
				successHandler(res.data)

			}).catch(err => {
				errorsHanlder(err)
			})

		} else {
			fetchData(teacherJournalApi.post('lms_Lesson_title_plan', {
				lesson: clicked.lesson,
				week: clicked.week,
				lesson_season: clicked.lesson_season,
				title: title,
				content: content,
				lesson_type: lessonType,

			})).then(res => {
				successHandler(res.data)

			}).catch(err => {
				errorsHanlder(err)
			})
		}
	}

	function lessonTypeHandler(e) {
		setLessonType(e.target.value)

		const existingTitle = clicked?.existingTitles?.[e.target.value]

		if (!existingTitle) {
			setSelectedExistingTitleId(null)
			return
		}

		setSelectedExistingTitleId(existingTitle.id)
		const modalProps = {}

		modalProps.header = t('Одоогоор байгаа мэдээлэл олдлоо')
		modalProps.body = <div>{t('Одоогоор байгаа мэдээллээр талбаруудыг солиулах уу?')}</div>
		modalProps.onConfirm = onConfirm
		modalProps.onDecline = onDecline

		setConfirmModal(modalProps)

		function onConfirm() {
			setContent(existingTitle.content)
			setTitle(existingTitle.title)
			setConfirmModal(null)
		}

		function onDecline() {
			setConfirmModal(null)
		}
	}

	return (
		<>
			<Modal
				isOpen={open}
				backdrop="static"
				centered
			>
				<ModalHeader
					toggle={closeModal}
				>
					{t('Заасан хичээлийн сэдэв')}
				</ModalHeader>
				<ModalBody style={{ textAlign: 'center', overflow: 'auto' }}>
					{isLoading && isEmptyFields(formErrors) && Loader}
					<Form style={{ minWidth: '100px', margin: '0 auto' }}>
						<FormGroup>
							<Label>{t('Хичээлийн сэдэв')}</Label>
							<Input type="text" value={title} placeholder="Хичээлийн сэдэв" onChange={(e) => setTitle(e.target.value)} />
							{formErrors.title && <FormFeedback className='d-block'>{formErrors.title.join()}</FormFeedback>}
						</FormGroup>
						<FormGroup>
							<Label>{t('Агуулга')}</Label>
							<Input type="textarea" value={content} placeholder="Агуулга" onChange={(e) => setContent(e.target.value)} />
							{formErrors.content && <FormFeedback className='d-block'>{formErrors.content.join()}</FormFeedback>}
						</FormGroup>
						<FormGroup>
							<Label>{t('Хичээллэх төрөл')}</Label>
							<Input type="select" value={lessonType} onChange={lessonTypeHandler}>
								<option value="">{t(`-- Сонгоно уу --`)}</option>
								{lessonTypes.map((item, index) => <option key={index} value={item.id}>{t(item.name)}</option>)}
							</Input>
							{formErrors.lesson_type && <FormFeedback className='d-block'>{formErrors.lesson_type.join()}</FormFeedback>}
						</FormGroup>
						{formErrors.non_field_errors && <FormFeedback className='d-block'>{formErrors.non_field_errors.join()}</FormFeedback>}
						<Alert color="warning">
							{t('Хичээлийн төрлийг өөрчилбөл хуваарьт заасан хичээлийн төрөл ч мөн өөрчлөгдөнө')}
						</Alert>
						<Button color="primary" onClick={changeLessonTitle}>{t('Хадгалах')}</Button>
					</Form>
				</ModalBody>
			</Modal>
			<CustomModal
				clicked={confirmModal}
				setClicked={setConfirmModal}
				header={confirmModal?.header}
			>
				{confirmModal?.body}
				<Button color="primary" onClick={confirmModal?.onConfirm} className="m-1 mt-3">{t('Тийм')}</Button>
				<Button color="primary" onClick={confirmModal?.onDecline} className="m-1 mt-3">{t('Үгүй')}</Button>
			</CustomModal>
		</>
	)
}
