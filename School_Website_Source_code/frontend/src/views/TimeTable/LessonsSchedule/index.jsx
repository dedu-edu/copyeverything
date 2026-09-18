// ** React Imports
import { Fragment, useState, useEffect, useMemo } from "react";

// ** Third Party Imports
import {
	Card,
	CardBody,
	CardHeader,
	CardTitle,
	Col,
	Row,
	Table,
} from "reactstrap";

import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";

import { CSelect } from "@src/components/CSelect";

// ** Custom Imports (global)
import { get_day } from "@utils";

import DetailModal from "./DetailModal";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import useUpdateEffect from '@hooks/useUpdateEffect';


// unique classname wrapper to avoid style conflicts
const StyleWrapper = styled.div`
	.scheduleTable th,
	.scheduleTable td {
		text-align: center;
	}

	.activeTime {
		background: green !important;
		color: white;
	}
`;

const initiaSelectlValues = {
	department: '',
	teacher: '',
	group: '',
	day: '',
	lesson: '',
	school: '',
};

const startTime = new Date();
startTime.setHours(8, 30, 0, 0); // 08:30

const classLengthMin = 90
const classCount = 5
const classBreakLengthMin = 10

const parNumbers = Array.from({ length: classCount }, (v, i) => i + 1);

const shortTypeName = {
	1: "Лаб",
	2: "Лекц",
	3: "Сем",
	4: "Бу",
	5: "Прак",
	6: "Б/д",
};

function addMinutes(date, minutes) {
	return new Date(date.getTime() + minutes * 60 * 1000);
}

function generateTimeRanges(startDate, count, lengthMin, gapMin) {
	const ranges = [];
	let current = new Date(startDate);

	for (let i = 0; i < count; i++) {
		let from = new Date(current);
		let to = addMinutes(from, lengthMin);

		if(i == 1) {
			gapMin = 60
		} else {
			gapMin = classBreakLengthMin
		}

		ranges.push({
			classNumber: i + 1,
			start: from,
			end: to
		});

		current = addMinutes(to, gapMin);
	}

	return ranges;
}

function getClassNumberByTime(ranges, time) {
	const found = ranges.find(r => time >= r.start && time <= r.end);
	return found ? found.classNumber : 6;
}

const timeRanges = generateTimeRanges(startTime, classCount, classLengthMin, classBreakLengthMin)

export default function AddTimetableComponentPublic() {
	const currentDate = new Date()
	const { t } = useTranslation();

	let activeDay = currentDate.getDay()

	let activeTime = getClassNumberByTime(timeRanges, currentDate)

	// ** other Hooks
	const { fetchData, isLoading, Loader } = useLoader({ isFullScreen: true  });
	const { fetchData: mainFetchDatas, isLoading: mainIsLoading } = useLoader({ isFullScreen: true  });

	const [isModal, setIsModal] = useState(false)
	const [modalDatas, setModalDatas] = useState({})
	const [selectedValue, setSelectValue] = useState(initiaSelectlValues);
	const [datas, setDatas] = useState({});
	const [lessonOptionDatas, setLessonOptionDatas] = useState([])
	const [teacherOptionDatas, setTeacherOptionDatas] = useState([])
	const [groupOptionDatas, setGroupOptionDatas] = useState([])

	// Api
	const lessonsScheduleApi = useApi().timetable.lessonsSchedule;

	const modalToggle = () => setIsModal(!isModal)

	const weekDays = useMemo(() => {
		if(selectedValue.day) {
			return get_day()?.filter((item) => item?.id === selectedValue.day)
		} else {
			return get_day()
		}
	}, [selectedValue.day])

	async function getAll() {
		const { success, data } = await mainFetchDatas(lessonsScheduleApi.get(selectedValue.teacher, selectedValue.group, selectedValue.day, selectedValue.lesson))
		if(success) {
			const processedData = data.reduce((r, a) => {
				// Энд нэмэлт шалгалт хийхгүй бол lesson_full_name гэсэн field заавал байх ёстой
				if (!r[a.lesson_full_name]) {
					r[a.lesson_full_name] = [];
				}
				r[a.lesson_full_name].push(a);
				return r;
			}, Object.create(null));

			setDatas(processedData)
		}
	}

	useEffect(() => {
		getAll()
	}, [])

	useUpdateEffect(() => {
		getAll()
	}, [selectedValue])

	useEffect(() => {
		async function getLessonDatas() {
			const { success, data } = await fetchData(lessonsScheduleApi.getLesson())
			if(success) {
				setLessonOptionDatas(data)
			}
		}
		getLessonDatas();
	}, []);

	useEffect(() => {
		async function getTeacherDatas() {
			const { success, data } = await fetchData(lessonsScheduleApi.getTeachers(selectedValue.lesson))
			if(success) {
				setTeacherOptionDatas(data)
			}
		}
		getTeacherDatas();

	}, [selectedValue.lesson])

	useEffect(() => {
		async function getGroupDatas() {
			const { success, data } = await fetchData(lessonsScheduleApi.getGroup(selectedValue.lesson, selectedValue.teacher))
			if(success) {
				setGroupOptionDatas(data)
			}
		}
		getGroupDatas();

	}, [selectedValue.lesson, selectedValue.teacher])

	useEffect(() => {
        // Үйлдэл хийх функц
        const action = () => {
            console.log("30 минут тутамд дахин ачаалж байна...");
            getAll();
        };

		// 60,000 milliseconds (1 минут)
		// 30 минут (30 * 60 * 1000 = 1,800,000 миллисекунд)
        const timerId = setInterval(action, 1800000);

        // Компонент устгагдах эсвэл дахин render хийгдэх үед хуучин таймерыг цэвэрлэх (CLEANUP)
        return () => {
            clearInterval(timerId);
        };
    }, []);

	const weekDaysHeaders = weekDays?.map((weekDay, weekDayI) => (
		<th key={weekDayI} colSpan={parNumbers.length} className={`${weekDay?.id === activeDay ? 'bg-success text-white' : ''}`}>
			{weekDay?.name}
		</th>
	));

	const classNumbersHeaders = weekDays?.map((weekDay, weekDayI) => (
		<Fragment key={weekDayI}>
			{parNumbers.map((classNumber, classNumberI) => (
				<th key={classNumberI} className={activeTime === classNumber && weekDay?.id === activeDay ? 'activeTime' : ''}>{classNumber}</th>
			))}
		</Fragment>
	));

	const rowsCells = useMemo(() => {
		return (
			Object.keys(datas)?.map((lesson, lessonI) => {
				const tTableDatas = datas[lesson]
				return (
					<tr key={lessonI}>
						<td key={lessonI} className="text-start fw-bolder" style={{ width: selectedValue?.day ? '20%' : '10%' }}>{lesson}</td>
						{
							weekDays?.map((week) => {
								const weekDay = week?.id
								let weekTDatas = tTableDatas?.filter((item) => item?.day === weekDay) || []
								return (
									<Fragment key={`${lessonI} ${weekDay}`}>
										{
											parNumbers.map((tPar, parIndex) => {
												const parDatas = weekTDatas?.filter((item) => item?.time === tPar) || []
												if (!parDatas?.length) return <td className="p-0" key={parIndex} style={{ width: selectedValue?.day ? '16%' : '3.6%' }}></td>

												return (
													<td key={`${lessonI} ${weekDay} ${parIndex}`} className="text-start fw-bolder p-25" style={{ width: selectedValue?.day ? '16%' : '3.6%' }}>
														{
															parDatas?.map((item, index) => {
																let name = shortTypeName[item.type]
																let style = {}
																let color = '#ededed'
																let border_color = 'primary'

																if(activeDay === weekDay) {
																	border_color = 'success'
																	if(tPar === activeTime) {
																		// Хичээл орж байгаа
																		color = '#00b300'
																	} else if(tPar < activeTime) {
																		// Хичээл орсон
																		color = '#e6e6e6'
																	} else {
																		// Хичээл орно
																		color = '#e6e600'
																	}
																	style.background = color
																} else if (weekDay < activeDay) {
																	// Хичээл орох өдөр аль хэдийн өнгөрсөн
																	style.background = '#f6f6f6'
																	border_color = 'secondary'
																} else {
																	// Орох өдөр болоогүй байгаа
																	style.background = '#dae1e7'
																}

																return <p className={`p-25 border border-${border_color} shadow rounded`} key={`${lessonI} ${weekDay} ${parIndex} ${index}`} style={{ fontSize: "10px", lineHeight: '11px', ...style }}
																		title={`Дамжаа - ${item.groups.join(', ')} (${name}) Хичээлийн байр-${item.building_name} Өрөө-${item.room_code} Багш-${item?.teacher_name}`}
																		onClick={() => {
																			modalToggle()
																			setModalDatas(item)
																		}}
																	>
																	{
																		selectedValue?.day
																		?
																			`Дамжаа - ${item?.groups?.join(', ')} (${name}) Өрөө-/${item?.room_code}/ Багш-${item?.teacher_name}`
																		:
																			`${item?.groups?.join(', ')} (${name}) Ө-/${item?.room_code}/`
																	}
																</p>
															})
														}
													</td>
												)
											})
										}
									</Fragment>
								)
							})
						}
					</tr>
				)
			})
		)
	}, [datas])

	const timeTable = (
		<Table size="sm" bordered responsive className="scheduleTable mt-1 fw-bold" style={{ fontSize: "12px", lineHeight: '12px' }}>
			<thead>
				<tr>
					<th rowSpan={2} style={{ verticalAlign: 'middle' }}>{t("Хичээл")}</th>
					{weekDaysHeaders}
				</tr>
				<tr>{classNumbersHeaders}</tr>
			</thead>
			<tbody>
				{
					Object.keys(datas)?.length > 0
					?
						rowsCells
					:
						<tr>
							<td colSpan={26}>Хуваарь олдсонгүй</td>
						</tr>
				}
			</tbody>
		</Table>
	);

	return (
		<Card>
			{(isLoading || mainIsLoading) && Loader}
			<CardHeader className="border-bottom justify-content-center">
				<CardTitle tag="h4">{t("Хичээлийн хуваарь")}</CardTitle>
			</CardHeader>
			<CardBody className="mt-1 border-bottom px-25">
				<Row md={12} className="align-items-end">
					<Col md={2} sm={6} xs={12} lg={2}>
						<CSelect
							id="lesson"
							options={lessonOptionDatas}
							onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        lesson: val,
										teacher: "",
										group: ""
                                    }
                                })
                            }}
							value={selectedValue?.lesson ? lessonOptionDatas?.find((val) => val?.id === selectedValue?.lesson) : ''}
							getOptionLabel={(option) => `${option.code ?? ""} ${option.name}`}
							label={t("Хичээл")}
							getOptionValue={(option) => option.id}
						/>
					</Col>
					<Col md={2} sm={6} xs={12} lg={2}>
						<CSelect
							id="teacher"
							options={teacherOptionDatas}
							onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        teacher: val,
										group: "",
                                    }
                                })
                            }}
							value={selectedValue?.teacher ? teacherOptionDatas?.find((val) => val?.id === selectedValue?.teacher) : ''}
							getOptionLabel={(option) => `${option?.last_name ?? ""} ${option?.first_name}`}
							label={t("Багш")}
							getOptionValue={(option) => option.id}
						/>
					</Col>
					<Col md={2} sm={6} xs={12} lg={2}>
						<CSelect
							id="group"
							options={groupOptionDatas}
							onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        group: val,
                                    }
                                })
                            }}
							value={selectedValue?.group ? groupOptionDatas?.find((val) => val?.id === selectedValue?.group) : ''}
							getOptionLabel={(option) => option?.name}
							label={t("Дамжаа")}
							getOptionValue={(option) => option.id}
						/>
					</Col>
					<Col md={2} sm={6} xs={12} lg={2}>
						<CSelect
							id="day"
							options={get_day()}
							onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        day: val,
                                    }
                                })
                            }}
							value={selectedValue?.day ? get_day()?.find((val) => val?.id === selectedValue?.day) : ''}
							getOptionLabel={(option) => option.name}
							label={t("Өдөр")}
							getOptionValue={(option) => option.id}
						/>
					</Col>
				</Row>
				<div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
					<StyleWrapper>
						{timeTable}
					</StyleWrapper>
				</div>
			</CardBody>
			{
				isModal &&
				<DetailModal
					isOpen={isModal}
					datas={modalDatas}
					handleModal={() => {
						setModalDatas({})
						modalToggle()
					}}
				/>
			}
		</Card>
	);
}
