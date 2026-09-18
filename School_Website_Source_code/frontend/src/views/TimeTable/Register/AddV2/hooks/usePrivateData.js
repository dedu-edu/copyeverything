// ** React Imports
import { useEffect, useState } from "react";

// ** Custom Imports (global)
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { useRTL } from "@hooks/useRTL";
import useUpdateEffect from "@hooks/useUpdateEffect";

import { get_time_date } from "@utils";

export const shortTypeName = {
	'Лаборатор': 'Лаб',
	'Лекц': 'Лекц',
	'Семинар': 'Сем',
	'Бусад': 'Бу',
	'Практик': 'Прак',
	'Бие даалт': 'Б/д',
}

export default function usePrivateData({ cellLabel, school_id, isResourceGrouping, isIncludeKuratsForPublic }) {
	const blankEvent = {
		start: "",
		end: "",
		resource: "",
	};

	var range_date = {
		start: "",
		end: "",
	};

	const { fetchData, isLoading, Loader } = useLoader({});
	const [is_loading, setLoader] = useState(false);

	const [isCalendar, setIsCalendar] = useState(false);

	const [radioName, setRadio] = useState("lesson");

	const initiaSelectlValues = {
		department: undefined,
		teacher: undefined,
		group: undefined,
		day: undefined,
		lesson: undefined,
	};
	const [selectedValue, setSelectValue] = useState(initiaSelectlValues);

	const [optionFilter, setOptionFilter] = useState("");

	const [resourceOption, setResourceOption] = useState([]);

	const [selectedMntName, setSelectedMntName] = useState("Хичээл");
	const [useMouseOver, setUseMouseOver] = useState(true);

	// ** states
	const [datas, setDatas] = useState([]);

	const [resourceGroupField, setResourceGroupField] = useState(
		isResourceGrouping ? "lesson" : ""
	);

	// ** Hooks
	const [isRtl] = useRTL();

	// Api
	const calendarListApi = useApi().timetable.register;
	const lessonApi = useApi().study.lessonStandart;
	const groupApi = useApi().student.group;
	const teacherApi = useApi().hrms.teacher;

	async function getAll() {
		setLoader(true);
		try {
			// 1. Датагаа салгаж авах (Destructuring)
			const [calendarData, resourceData] = await Promise.all([
				fetchData(
					calendarListApi.getCalendar(
						isCalendar,
						selectedValue.department,
						radioName,
						optionFilter,
						resourceGroupField === "lesson" ? true : false,
						selectedValue.teacher?.id,
						selectedValue.group?.id,
						selectedValue.day?.id,
						selectedValue.lesson?.id,
						isIncludeKuratsForPublic
					)
				),
				// Resource дата
				fetchData(
					calendarListApi.selectionDatas(
						radioName,
						selectedValue.department,
						optionFilter,
						resourceGroupField === "lesson" ? true : false,
						selectedValue.teacher?.id || "",
						selectedValue.group?.id || "",
						selectedValue.day?.id || "",
						selectedValue.lesson?.id || "",
						isResourceGrouping,
						isIncludeKuratsForPublic
					)
				),
			]);

			const calendarDatas = calendarData?.data || []
			const resourceDatas = resourceData?.data || []

			// 2. Хуваарийн датаг боловсруулах (Map ашиглах нь илүү цэвэрхэн)
			if (calendarDatas && calendarDatas.length > 0) {
				const processedCalendar = calendarDatas.map(item => {
					const stimes = get_time_date(item.time, item.day);
					const songosonTitle = `${item.title} ${item.is_optional ? "сон" : ""}`;

					// Шинэ объект үүсгэх (Мутаци хийхээс зайлсхийх)
					const newItem = {
						...item,
						start: stimes?.start_time,
						end: stimes?.end_time,
						title: cellLabel(
							songosonTitle,
							item.lesson_name,
							item.room_name?.trim() ?? '',
							shortTypeName[item.type_name]
						),
						textColor: item.textcolor || "white",
						classNames: item.odd_even == 1 ? ["box"] : item.odd_even == 2 ? ["box1"] : []
					};

					// Resource ID оноох логик
					switch (radioName) {
						case "group":
							newItem.resourceIds = item.group_list || [];
							break;
						case "teacher":
							newItem.resourceId = item.teacher;
							break;
						case "lesson":
							newItem.resourceId = `${item.lesson}_${item.teacher}`;
							break;
						case "room":
							newItem.resourceId = item.room;
							break;
					}
					return newItem;
				});

				setDatas(processedCalendar);
			}

			// 3. Resource датаг тусад нь оноох
			setResourceOption(resourceDatas);

		} catch (error) {
			console.error("Дата татахад алдаа гарлаа:", error);
		} finally {
			setLoader(false);
		}
	}

	useEffect(() => {
		if (isCalendar == false) {
			getAll();
		}
	}, [radioName, isCalendar]);

	/** 300 милсекунд дараа Collapse hover-лоход алга болгохгүй болгоно */
	useUpdateEffect(() => {
		if (!useMouseOver) {
			const timer = setTimeout(() => {
				setUseMouseOver(true);
			}, 60);

			return () => clearTimeout(timer);
		}
	}, [useMouseOver]);

	return {
		radioName,
		Loader,
		setSelectValue,
		initiaSelectlValues,
		setSelectedMntName,
		isResourceGrouping,
		calendarListApi,
		isCalendar,
		setRadio,
		setUseMouseOver,
		setResourceGroupField,
		fetchData,
		getAll,
		useMouseOver,
		isRtl,
		datas,
		range_date,
		resourceOption,
		blankEvent,
		resourceGroupField,
		setLoader,
		optionFilter,
		selectedValue,
		isLoading,
		selectedMntName,
		teacherApi,
		groupApi,
		lessonApi,
		setOptionFilter,
		setIsCalendar,
		is_loading,
		setDatas
	};
}
