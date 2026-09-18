import { forwardRef, useContext, useEffect, useState } from "react"
import HTMLFlipBook from "react-pageflip";
import { Lock, Unlock } from "react-feather";
import moment from "moment";
import { Alert } from "reactstrap";

import useApi from "@hooks/useApi"
import ActiveYearContext from "@src/utility/context/ActiveYearContext"
import useLoader from "@src/utility/hooks/useLoader";

import Approval from "./sections/Approval";
import BackCover from "./sections/BackCover";
import Cover from "./sections/Cover";
import Days from "./sections/Days";
import Lessons from "./sections/Lessons";
import Sessions from "./sections/Sessions";
import Weeks from "./sections/Weeks";
import Weeks2 from "./sections/Weeks2";

import DefaultStyles from "./parts/DefaultStyles";
import { generateDictStructure, getValueFromDict } from "../utils";
import { height, width } from "./constants";


const scale = 1

export default forwardRef(function Irts({ hideNotice }, bookRef) {
	// #region react-pageflip
	const [isLock, setIsLock] = useState(false);
	const [maxPage, setMaxPage] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);
	const [bookChangeTrigger, setBookChangeTrigger] = useState(false)

	// After the flip ends
	const onFlip = (e) => {
		const curPage = e.data;
		if (curPage > maxPage) setMaxPage(curPage);
		setCurrentPage(curPage)
	};

	function refreshBook() {
		setBookChangeTrigger(current => !current)
	}

	function lockHandler() {
		setIsLock(current => !current)
		refreshBook()
	}
	// #endregion

	const [selectValue, setSelectValue] = useState({
		teacher: {},
		subOrg: {},
		group: {}
	})

	const teacherJournalApi = useApi().teacherJournal
	const { cyear_name } = useContext(ActiveYearContext);

	// #region to get static data
	// to get timetables
	const [timetables, setTimeTables] = useState([])

	// to get start study date
	const [startStudyDate, setStartStudyDate] = useState(null)

	// to get lessons
	const [lessons, setLessons] = useState([])

	// to get seasons
	const [seasons, setSeasons] = useState([])

	// to get students
	const [students, setStudents] = useState([])

	const { isLoading: isLoadingTimeTables, Loader, fetchData: fetchDataTimeTables } = useLoader({})

	async function getTimeTables() {
		if (selectValue.teacher.id && selectValue.subOrg.id && selectValue.group.id) {
			const { success, data } = await fetchDataTimeTables(teacherJournalApi.get('lms_TimeTable', {
				teacher: selectValue.teacher.id,
				school: selectValue.subOrg.id,
				group: selectValue.group.id,
			}))

			if (success) {
				setTimeTables(data.timetables)
				setStartStudyDate(data.start_study_date)
				setLessons(data.lessons)

				// sort seasons
				data.seasons.sort((a, b) => a.season_name.localeCompare(b.season_name))

				setSeasons(data.seasons.filter(item => ['намар', 'хавар'].includes(item.season_name.toLowerCase())))

				// sort students
				data.students.sort((a, b) => `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`))

				setStudents(data.students)
				refreshBook()
			}
		}
	}

	useEffect(() => {
		getTimeTables()
	}, [selectValue.group.id, selectValue.teacher.id, selectValue.subOrg.id])
	// #endregion

	// #region to filter with select input
	function getSubOrgs(pageLocal, searchLocal, limitLocal) {
		return teacherJournalApi.get('core_SubOrgs', {
			limit: limitLocal,
			page: pageLocal,
			sort: '',
			search: searchLocal,
			search_fields: 'name',
		})
	}

	function getGroups(pageLocal, searchLocal, limitLocal) {
		return teacherJournalApi.get('lms_Group', {
			limit: limitLocal,
			page: pageLocal,
			sort: '',
			search: searchLocal,
			teacher: selectValue.teacher.id,
			school: selectValue.subOrg.id,
			search_fields: 'name',
		})
	}

	function getTeachers(pageLocal, searchLocal, limitLocal) {
		const APPROVED = 2
		const ACTION_TYPE_ALL = 3

		return teacherJournalApi.get('core_Teachers', {
			limit: limitLocal,
			page: pageLocal,
			sort: '',
			search: searchLocal,
			action_status: APPROVED,
			action_status_type: ACTION_TYPE_ALL,
			search_fields: 'first_name,register,register_code',
			sub_org: selectValue.subOrg.id,
		})
	}
	// #endregion

	// #region to get students irts moments
	const [daysCols, setDaysCols] = useState({})
	const [lessonTitles, setLessonTitles] = useState({})

	const { isLoading: isLoadingIrts, fetchData: fetchDataIrts } = useLoader({})

	async function getIrts() {
		if (selectValue.teacher.id && selectValue.subOrg.id && selectValue.group.id) {
			const { success, data } = await fetchDataIrts(teacherJournalApi.get('lms_IrtsQr', {
				teacher: selectValue.teacher.id,
				school: selectValue.subOrg.id,
				group: selectValue.group.id,
			}))

			if (success) {
				const daysCols = {}
				const lessonTitles = {}

				const irtsqr = data.irtsqr

				for (let i = 0; i < irtsqr.length; i++) {
					const item = irtsqr[i]

					const day = moment(item.generate_date).format('YYYY-MM-DD')

					generateDictStructure(daysCols, [item.lesson, item.season], [])
					daysCols[item.lesson][item.season].push({ date: day, classNumber: item.timetable_time, week: item.week, id: item.id, timetableId: item.timetable, lessonType: item.lesson_type })
				}

				// #region lesson titles
				const lessonTitlePlan = data.lesson_title_plan

				for (let i = 0; i < lessonTitlePlan.length; i++) {
					const item = lessonTitlePlan[i]

					generateDictStructure(lessonTitles, [item.lesson, item.week, item.lesson_type], {})
					lessonTitles[item.lesson][item.week][item.lesson_type] = { title: item.title, content: item.content, id: item.id }
				}
				// #endregion

				// sort date columns
				Object.keys(daysCols).forEach(lessonId =>
					Object.keys(daysCols[lessonId]).forEach(seasonId =>
						daysCols[lessonId][seasonId].sort((a, b) => {
							return a.date.localeCompare(b.date) || a.classNumber - b.classNumber
						})
					)
				)

				setDaysCols(daysCols)
				setLessonTitles(lessonTitles)
				// refreshBook() //TODO maybe not necessary
			}
		}
	}

	useEffect(() => {
		getIrts()
	}, [selectValue.group.id, selectValue.teacher.id, selectValue.subOrg.id])
	// #endregion

	// #region to get students irts states
	const [weeksStates, setWeeksStates] = useState({})
	const [daysStates, setDaysStates] = useState({})

	const { isLoading: isLoadingRegisterIrts, fetchData: fetchDataRegisterIrts } = useLoader({})

	async function getRegisterIrts() {
		if (selectValue.teacher.id && selectValue.subOrg.id && selectValue.group.id) {
			const { success, data } = await fetchDataRegisterIrts(teacherJournalApi.get('lms_RegisterIrts', {
				teacher: selectValue.teacher.id,
				school: selectValue.subOrg.id,
				group: selectValue.group.id,
			}))

			if (success) {
				const weeksStates = {}
				const daysStates = {}

				const registerIrts = data

				for (let i = 0; i < registerIrts.length; i++) {
					const item = registerIrts[i]

					// days states
					generateDictStructure(daysStates, [item.student, item.qr], null)
					daysStates[item.student][item.qr] = { state: item.state, registerIrtsId: item.id }

					// weeks states
					generateDictStructure(weeksStates, [item.week, item.student], [])
					weeksStates[item.week][item.student].push(item.state)
				}

				setWeeksStates(weeksStates)
				setDaysStates(daysStates)
			}
		}
	}

	useEffect(() => {
		getRegisterIrts()
	}, [selectValue.group.id, selectValue.teacher.id, selectValue.subOrg.id])
	// #endregion

	// #region to get repeating pages
	const [repeatingPages, setRepeatingPages] = useState([])
	const [pagesNumbers, setPagesNumbers] = useState({})

	function addRepeatingPages(lessonIndex = 0, seasonIndex = 0, lesson, season, newRepeatingPages, newPagesNumbers) {
		const currentPageNumber = 6 + (lessonIndex * seasons.length + seasonIndex) * 2
		const titles = getValueFromDict(lessonTitles, [getValueFromDict(lesson, ['id'])], {})

		newRepeatingPages.push(
			<div className='book' key={`${lessonIndex}-${seasonIndex}-1`}>
				{maxPage > 1 && <Days
					pageNumber={currentPageNumber}
					scale={scale}
					lesson={lesson ?? {}}
					season={season ?? {}}
					students={students}
					daysCols={getValueFromDict(daysCols, [getValueFromDict(lesson, ['id']), getValueFromDict(season, ['id'])], [])}
					daysStates={daysStates}
					getRegisterIrts={getRegisterIrts}
					startStudyDate={startStudyDate}
					timetables={timetables}
				/>}
			</div>,
			<div className='book' key={`${lessonIndex}-${seasonIndex}-2`}>
				{maxPage > 1 && <Sessions
					pageNumber={currentPageNumber + 1}
					scale={scale}
					lesson={lesson ?? {}}
					season={season ?? {}}
					daysCols={getValueFromDict(daysCols, [getValueFromDict(lesson, ['id']), getValueFromDict(season, ['id'])], [])}
					lessonTitles={titles}
					getIrts={getIrts}
					getTimeTables={getTimeTables}
				/>}
			</div>
		)

		if (lesson) {
			if (!Object.keys(newPagesNumbers).includes(`${lesson.id}`)) newPagesNumbers[lesson.id] = {}
			if (!Object.keys(newPagesNumbers[lesson.id]).includes(`${season.id}`)) newPagesNumbers[lesson.id][season.id] = currentPageNumber
		}
	}

	useEffect(() => {
		const newRepeatingPages = []
		const newPagesNumbers = {}
		for (let i = 0; i < lessons.length; i++) for (let j = 0; j < seasons.length; j++) addRepeatingPages(i, j, lessons[i], seasons[j], newRepeatingPages, newPagesNumbers)
		if (!lessons.length) addRepeatingPages(null, null, null, null, newRepeatingPages, newPagesNumbers)
		setRepeatingPages(newRepeatingPages)
		setPagesNumbers(newPagesNumbers)
	}, [lessons, maxPage, daysStates, lessonTitles])
	// #endregion

	// to define general loading value
	const isLoadingAll = isLoadingTimeTables || isLoadingRegisterIrts || isLoadingIrts

	const [totalsWeeksPage1, setTotalsWeeksPage1] = useState({})

	return (
		<>
			{
				!hideNotice &&
				<Alert color="primary" className="p-1">
					Номын зүүн дээд буланд байгаа түгжээний дүрсийг дарж номыг түгжиж, хайлтын талбарт текст оруулах боломжтой болгоно уу.
				</Alert>
			}
			<DefaultStyles scale={scale} />
			{isLock ? <Lock className='cursor-pointer' onClick={lockHandler} /> : <Unlock className='cursor-pointer' onClick={lockHandler} />}
			{isLoadingAll && Loader}
			<HTMLFlipBook
				ref={bookRef}
				startPage={currentPage}
				className="font1 fontSize1"
				width={width * scale}
				height={height * scale}
				showCover={true}
				onFlip={onFlip}
				disableFlipByClick
				useMouseEvents={!isLock}
				key={bookChangeTrigger} // react-pageflip requires total rerender (remounting), so key is toggling
			>
				<div className='book'>
					<Cover
						selectValue={selectValue}
						setSelectValue={setSelectValue}
						cyear_name={cyear_name}
						getSubOrgs={getSubOrgs}
						getGroups={getGroups}
						getTeachers={getTeachers}
						groupsDeps={[selectValue.subOrg.id, selectValue.teacher.id]}
						teachersDeps={[selectValue.subOrg.id]}
					/>
				</div>
				<div className='book'>
					<Approval
						selectValue={selectValue}
						cyear_name={cyear_name}
					/>
				</div>
				<div className='book'>
					<Lessons
						pageNumber={3}
						scale={scale}
						lessons={lessons}
						seasons={seasons}
						pagesNumbers={pagesNumbers}
						bookRef={bookRef}
					/>
				</div>
				<div className='book'>
					{maxPage > 0 &&
						<Weeks
							pageNumber={4}
							scale={scale}
							students={students}
							weeksStates={weeksStates}
							setTotalsWeeksPage1={setTotalsWeeksPage1}
						/>
					}
				</div>
				<div className='book'>
					{maxPage > 0 &&
						<Weeks2
							pageNumber={5}
							scale={scale}
							students={students}
							weeksStates={weeksStates}
							selectValue={selectValue}
							totalsWeeksPage1={totalsWeeksPage1}
						/>
					}
				</div>
				{repeatingPages}
				<div className='book'>
					{maxPage > 3 && <BackCover />}
				</div>
			</HTMLFlipBook>
		</>
	);
})
