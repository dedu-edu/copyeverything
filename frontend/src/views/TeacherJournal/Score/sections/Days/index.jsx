import { useState } from "react";
import { Badge } from "reactstrap";

import useLoader from "@src/utility/hooks/useLoader";
import useApi from "@src/utility/hooks/useApi";

import PopoverToId from "../../../components/Popover";
import Legend from "../../parts/Legend"
import { generateDictStructure, getValueFromDict } from "../../../utils";
import IrtsModal from "./IrtsModal";
import { marks } from "../../constants";


const weekDays = 19

export default function Days({ pageNumber, scale, students, daysCols, daysStates, season, getRegisterIrts, startStudyDate, timetables, lesson }) {
	const bodyHeight = 530 * scale;
	const rowHeight = 21 * scale;
	const visibleRows = Math.floor(bodyHeight / rowHeight);

	let rowIndex = 0
	let colIndex = 0
	const totalsRows = {}

	const headDays = daysCols.map((item, index) => {
		colIndex++
		const dayData = { ...item, seasonId: season.id, lessonId: lesson.id }

		return (
			<th key={index} className="textAlign1 padding5" style={{ writingMode: 'sideways-lr' }} onClick={() => handleDayClick(dayData)}>
				{colIndex} {`${item.date.split('-')[1]}-${item.date.split('-')[2]}`}
			</th>
		)
	})

	const restDays = Array.from({ length: weekDays - daysCols.length > 0 ? weekDays - daysCols.length : 0 }, (v, k) => k + 1)

	// #region to change state
	const [clickedId, setClickedId] = useState(null)
	const [clickedData, setClickedData] = useState({})

	const { isLoading, fetchData, Loader } = useLoader({})
	const basicApi = useApi().basic

	function handleCellClick(cellId, data) {
		setClickedId(cellId)
		setClickedData(data)
	}
	// #endregion

	const [clickedDay, setClickedDay] = useState(null)

	function handleDayClick(day) {
		setClickedDay(day)
	}

	return (
		<>
			{isLoading && Loader}
			<table
				className="textAlign2 fontSize1"
				style={{
					height: '100%',
					width: '100%',
				}}
			>
				<tbody>
					<tr>
						<td className='padding4'>
							<Legend />
						</td>
					</tr>
					<tr>
						<td className='padding4'>
							СУРАЛЦАГЧИЙН ИРЦ ({season.season_name})
						</td>
					</tr>
					<tr style={{ height: '100%' }}>
						<td className='verticalAlign1'>
							<div className="width5" style={{ height: '100%', overflow: 'auto' }}>
								<table className="border1" style={{ width: '100%' }}>
									<thead>
										<tr>
											<th style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
												Д/д
											</th>
											<th rowSpan={2}>
												Суралцагчийн овог, нэр
											</th>
											<th colSpan={weekDays}>
												Сар, өдөр
											</th>
											<th colSpan={marks.length}>
												Дүн
											</th>
										</tr>
										<tr>
											{headDays}
											{
												restDays.map((item, index) => {
													colIndex++

													return (
														<th key={index} className="textAlign1 padding5" style={{ writingMode: 'sideways-lr' }}>
															{colIndex}
														</th>
													)
												})
											}
											{
												marks.map((item, index) =>
													<th key={index} className="textAlign1 padding5" style={{ writingMode: 'sideways-lr' }}>
														{item.name}
													</th>
												)
											}
										</tr>
									</thead>
									<tbody>
										{
											students.map((student, index) => {
												rowIndex++
												const totalsCols = {}

												return (
													<tr key={index}>
														<td>
															{rowIndex}
														</td>
														<td>
															{student.last_name} {student.first_name}
														</td>
														{
															daysCols.map((item, index) => {
																let stateLetter = null
																const studentState = getValueFromDict(daysStates, [student.id, item.id], {})

																if (studentState.state) {
																	stateLetter = ((marks.find(mark => mark.id === studentState.state) ?? {}).name ?? '').charAt(0).toLowerCase()

																	if (!Object.keys(totalsCols).includes(`${studentState.state}`)) totalsCols[studentState.state] = 0
																	totalsCols[studentState.state]++

																	generateDictStructure(totalsRows, [item.id, studentState.state], 0)
																	totalsRows[item.id][studentState.state]++
																}

																const cellId = `cell-${pageNumber}-${rowIndex}-${index}`
																const dataToSave = { studentState: studentState, irtsId: item.id, studentId: student.id }

																return (
																	<td key={index} style={{ height: rowHeight }} onClick={() => handleCellClick(cellId, dataToSave)} id={cellId}>
																		{stateLetter}
																	</td>
																)
															})
														}
														{
															restDays.map((item, index) =>
																<td key={index} style={{ height: rowHeight }}>
																</td>
															)
														}
														{
															marks.map((item, index) => {
																generateDictStructure(totalsRows, ['all', item.id], 0)
																totalsRows['all'][item.id] += totalsCols[item.id] ?? 0

																return (
																	<th key={index} style={{ height: rowHeight }}>
																		{totalsCols[item.id]}
																	</th>
																)
															})
														}
													</tr>
												)
											})
										}
										{
											Array.from({ length: visibleRows - students.length > 0 ? visibleRows - students.length : 0 }, (v, k) => k).map((item, index) => {
												rowIndex++

												return (
													<tr key={index}>
														<td>
															{rowIndex}
														</td>
														<td>
														</td>
														{
															daysCols.map((item, index) =>
																<td key={index} style={{ height: rowHeight }}>
																</td>
															)
														}
														{
															restDays.map((item, index) =>
																<td key={index} style={{ height: rowHeight }}>
																</td>
															)
														}
														{
															marks.map((item, index) =>
																<th key={index} style={{ height: rowHeight }}>
																</th>
															)
														}
													</tr>
												)
											})
										}
									</tbody>
									<tfoot>
										{
											marks.map((mark, index) =>
												<tr key={index}>
													{
														index === 0 &&
														<th rowSpan={marks.length}>
															Дүн
														</th>
													}
													<th>
														{mark.name}/{mark.name.charAt(0).toLowerCase()}/
													</th>
													{
														daysCols.map((irts, i1) => {

															return (
																<th key={i1} style={{ height: rowHeight }}>
																	{totalsRows[irts.id]?.[mark.id]}
																</th>
															)
														})
													}
													{
														restDays.map((day, i1) =>
															<th key={i1} style={{ height: rowHeight }}>
															</th>
														)
													}
													{
														marks.map((mark, i1) =>
															<th key={i1} style={{ height: rowHeight }}>
																{mark.id === mark.id && totalsRows['all'] && totalsRows['all'][mark.id]}
															</th>
														)
													}
												</tr>
											)
										}
									</tfoot>
								</table>
							</div>
						</td>
					</tr>
					<tr>
						<td>
							{pageNumber}
						</td>
					</tr>
				</tbody>
			</table>
			<IrtsModal clicked={clickedDay} setClicked={setClickedDay} refreshData={getRegisterIrts} startStudyDate={startStudyDate} timetables={timetables} />
		</>
	)
}