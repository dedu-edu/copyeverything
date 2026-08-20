import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap";

import useLoader from "@src/utility/hooks/useLoader";
import useApi from "@src/utility/hooks/useApi";
import { lessonTypes } from "@src/views/TeacherJournal/Irts/constants";


export default function LessonTitleModal({
	clicked,
	setClicked,
	refreshData,
}) {
	// #region hooks
	const { t } = useTranslation()
	const { isLoading, fetchData, Loader } = useLoader({})
	const teacherJournalApi = useApi().teacherJournal

	const [open, setOpen] = useState(false);

	// form
	const [title, setTitle] = useState(clicked?.title ?? '');
	const [content, setContent] = useState(clicked?.content ?? '');
	const [lessonType, setLessonType] = useState(clicked?.lessonType ?? '');

	useEffect(() => {
		handleClick()
	}, [clicked])
	// #endregion

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

	async function changeLessonTitle() {
		if (clicked?.id) {
			await fetchData(teacherJournalApi.patch('lms_Lesson_title_plan', clicked?.id, {
				lesson: clicked.lessonId,
				week: clicked.week,
				lesson_season: clicked.seasonId,
				title: title,
				content: content,
				lesson_type: lessonType,
			}))

		} else {
			await fetchData(teacherJournalApi.post('lms_Lesson_title_plan', {
				lesson: clicked.lessonId,
				week: clicked.week,
				lesson_season: clicked.seasonId,
				title: title,
				content: content,
				lesson_type: lessonType,
			}))
		}

		refreshData()
		closeModal()
	}

	return (
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
				{isLoading && Loader}
				<Form style={{ minWidth: '100px', margin: '0 auto' }}>
					<FormGroup>
						<Label>{t('Хичээлийн сэдэв')}</Label>
						<Input type="text" value={title} placeholder="Хичээлийн сэдэв" onChange={(e) => setTitle(e.target.value)} />
					</FormGroup>
					<FormGroup>
						<Label>{t('Агуулга')}</Label>
						<Input type="textarea" value={content} placeholder="Агуулга" onChange={(e) => setContent(e.target.value)} />
					</FormGroup>
					<FormGroup>
						<Label>{t('Хичээллэх төрөл')}</Label>
						<Input type="select" value={lessonType} onChange={(e) => setLessonType(e.target.value)}>
							<option value="">{t(`-- Сонгоно уу --`)}</option>
							{lessonTypes.map((item, index) => <option key={index} value={item.id}>{t(item.name)}</option>)}
						</Input>
					</FormGroup>
					<Button color="primary" onClick={changeLessonTitle}>{t('Хадгалах')}</Button>
				</Form>
			</ModalBody>
		</Modal>
	)
}