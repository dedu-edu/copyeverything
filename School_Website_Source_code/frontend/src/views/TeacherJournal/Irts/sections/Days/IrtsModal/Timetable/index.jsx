import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid'
import moment from "moment";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { get_time_name } from "@src/utility/Utils";
import useWindowDimensions from "@src/components/useWindowDimensions";


export default function Timetable({ handleSelect, selectedDate, timetables }) {
	// #region Hooks
	const { t } = useTranslation()
	const calendarRef = useRef()

	// Дэлгэцний өргөн, өндөр авах
	const { width } = useWindowDimensions()

	useEffect(() => {
		if (calendarRef.current && selectedDate) calendarRef.current.getApi().gotoDate(selectedDate)
	}, [selectedDate])
	// #endregion

	function getDatas() {
		const data = [...timetables]

		for (const i in data) {
			data[i] = { ...data[i] }

			const times = get_time_name(data[i].time);
			data[i].startTime = times.start_time;
			data[i].endTime = times.end_time;
			data[i].title = (data[i]?.room?.code ? data[i]?.room?.code + ' тоот, ' : ' ') + data[i]?.lesson?.name + `(${data[i]?.type})`;
			data[i].daysOfWeek = [`${data[i].day === 7 ? 0 : data[i].day}`];
		}

		return data
	}

	const datas = getDatas() ?? []

	const calendarOptions = {
		ref: calendarRef,
		allDaySlot: false,
		headerToolbar: false,
		displayEventTime: false,
		events: datas,
		plugins: [timeGridPlugin],
		initialView: 'timeGridDay',
		initialDate: selectedDate,
		firstDay: 1,
		height: "430px",
		slotMinTime: "08:30",
		slotMaxTime: "16:00",
		slotDuration: '01:40:00',
		slotLabelFormat: function (data) {
			var hours = moment(data.date)
			if (hours.format("HH") >= '11') {
				hours = hours.add(50, 'minutes')
			}

			return hours.format("HH:mm") + " ~ " + hours.add(90, 'minutes').format("HH:mm");
		},
		dayHeaderContent: ({ date }) => {
			const fd = date.getDay()
			const days = [t('Ня'), t('Да'), t('Мя'), t('Лх'), t('Пү'), t('Ба'), t('Бя')]
			if (width < 1000) return days[fd]
			const weekdays = [t('Ням'), t('Даваа'), t('Мягмар'), t('Лхагва'), t('Пүрэв'), t('Баасан'), t('Бямба')]
			return weekdays[fd]
		},
		eventClick: (info, event) => { handleSelect(info.event.extendedProps.event_id) },
	}

	const toRender = <FullCalendar {...calendarOptions} />
	return toRender
}