import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Input, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import moment from "moment";

import useLoader from "@src/utility/hooks/useLoader";
import useApi from "@src/utility/hooks/useApi";

import Timetable from "./Timetable";
import { getWeekNumber } from "@src/views/TeacherJournal/utils";


function getDateInSameWeekByWeekDay(weekDay, date) {
	const inputDate = new Date(date);
	let currentWeekDay = inputDate.getDay();
	if (currentWeekDay === 0) currentWeekDay = 7
	const diff = weekDay - currentWeekDay;
	const resultDate = new Date(inputDate);
	resultDate.setDate(inputDate.getDate() + diff);
	return moment(resultDate).format('YYYY-MM-DD');
}

export default function IrtsModal({
	clicked,
	setClicked,
	refreshData,
	startStudyDate,
	timetables
}) {
	function filterTimetables() {
		if (!clicked) return
		const clickedTimeTable = timetables.find(item => item.id === clicked.timetableId)

		// to change week numbers sequence to 1-7 (1 is monday) instead of default sequence: 0-6 (0 is sunday)
		let clickedWeekDayNumber = new Date(clicked.date).getDay()
		if (clickedWeekDayNumber === 0) clickedWeekDayNumber = 7

		if (clickedWeekDayNumber !== clickedTimeTable.day) clicked.date = getDateInSameWeekByWeekDay(clickedTimeTable.day, clicked.date)

		return timetables.filter(item =>
			item.lesson.id === clicked.lessonId &&
			item.lesson_season === clicked.seasonId
		)
	}

	const filteredTimetables = filterTimetables()

	// #region hooks
	const { t } = useTranslation()
	const { isLoading, fetchData, Loader } = useLoader({})
	const basicApi = useApi().basic

	const [open, setOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState(clicked?.date);

	useEffect(() => {
		handleClick()
		if (!selectedDate && clicked?.date) setSelectedDate(clicked.date)

		return () => {
			setSelectedDate('')
		}
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

	async function changeIrts(timetableId) {
		// NOTE edit is prohibited
		return null
		if (clicked.irtsId) {
			await fetchData(basicApi.patch('lms_IrtsQr', clicked.irtsId, {
				timetable: timetableId,
				generate_date: selectedDate,
				week: getWeekNumber(startStudyDate, selectedDate)
			}))
		}

		refreshData()
		closeModal()
	}

	return (
		clicked &&
		<Modal
			isOpen={open}
			backdrop="static"
			centered
		>
			<ModalHeader
				toggle={closeModal}
			>
				{t('Ирц')}
			</ModalHeader>
			<ModalBody style={{ textAlign: 'center', overflow: 'auto' }}>
				{isLoading && Loader}
				<div style={{ minWidth: '100px' }}>
					<Row>
						<Col xs={12} className="pb-1">
							<div style={{ display: 'inline-block' }}>
								<Input type="date" onChange={(e) => setSelectedDate(e.target.value)} value={selectedDate} />
							</div> ({t('7 хоног')}: {getWeekNumber(startStudyDate, selectedDate)})
						</Col>
						<Col xs={12}>
							<Timetable handleSelect={changeIrts} selectedDate={selectedDate} timetables={filteredTimetables} />
						</Col>
					</Row>
				</div>
			</ModalBody>
		</Modal>
	)
}