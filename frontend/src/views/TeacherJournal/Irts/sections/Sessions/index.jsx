import { useState } from "react";

import Legend from "../../parts/Legend"
import LessonTitleModal from "./LessonTitleModal";
import { lessonTypes } from "../../constants";


export default function Sessions({ pageNumber, scale, lesson, daysCols, lessonTitles, getIrts, getTimeTables, season }) {
	const bodyHeight = 580 * scale;
	const rowHeight = 21 * scale;
	const visibleRows = Math.floor(bodyHeight / rowHeight);

	let rowIndex = 0
	const rowCounts = {}

	const [clickedTitle, setClickedTitle] = useState(null)

	function handleTitleClick(data) {
		setClickedTitle(data)
	}

	return (
		<>
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
							<table style={{ width: '100%' }}>
								<tbody>
									<tr>
										<td className="textAlign1" style={{ width: '1px', whiteSpace: 'nowrap' }}>
											ХИЧЭЭЛИЙН НЭР, ИНДЕКС
										</td>
										<td className="minWidth3 border2">
											{lesson.name} {lesson.code}
										</td>
										<td className="textAlign3">
											БАГЦ ЦАГ
										</td>
										<td className="width1 border2">
											{lesson.kredit}
										</td>
									</tr>
								</tbody>
							</table>
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
												Сар, өдөр
											</th>
											<th rowSpan={2}>
												Заасан хичээлийн сэдэв
											</th>
											<th colSpan={lessonTypes.length}>
												Хичээлийн хэлбэр
											</th>
											<th rowSpan={2}>
												Багшийн гарын үсэг
											</th>
										</tr>
										<tr>
											{
												lessonTypes.map((lessonType, lessonTypeIndex) =>
													<th key={lessonTypeIndex} className="padding5" style={{ writingMode: 'sideways-lr' }}>
														{lessonType.name}
													</th>
												)
											}
										</tr>
									</thead>
									<tbody>
										{
											daysCols.map((item, index) => {
												rowIndex++
												const lessonTitlesFromDb = lessonTitles?.[item.week] ?? {}
												const lessonTitleFromDb = lessonTitlesFromDb[item.lessonType] ?? {}
												const dataToChange = {}

												if (Object.keys(lessonTitleFromDb).length) {
													dataToChange.title = lessonTitleFromDb.title
													dataToChange.content = lessonTitleFromDb.content
												}

												dataToChange.lesson = lesson.id
												dataToChange.lesson_season = season.id
												dataToChange.lesson_type = item.lessonType
												dataToChange.timetableId = item.timetableId
												dataToChange.week = item.week
												dataToChange.existingTitles = lessonTitlesFromDb

												return (
													<tr key={index}>
														<td>
															{rowIndex}
														</td>
														<td>
															{`${item.date.split('-')[1]}-${item.date.split('-')[2]}`}
														</td>
														<td onClick={() => handleTitleClick(dataToChange)} className='cursor-pointer'>
															{lessonTitleFromDb.title}
														</td>
														{
															lessonTypes.map((lessonType, lessonTypeIndex) => {
																let lessonTypeCount = 0
																if (item.lessonType === lessonType.id) lessonTypeCount = 1

																if (!Object.keys(rowCounts).includes(`${lessonType.id}`)) rowCounts[lessonType.id] = 0
																rowCounts[lessonType.id] += lessonTypeCount

																return (
																	<td key={lessonTypeIndex}>
																		{lessonTypeCount}
																	</td>
																)
															})
														}
														<td>
														</td>
													</tr>
												)
											})
										}
										{
											Array.from({ length: visibleRows - daysCols.length > 0 ? visibleRows - daysCols.length : 0 }, (v, k) => k).map((item, index) => {
												rowIndex++

												return (
													<tr key={index}>
														<td>
															{rowIndex}
														</td>
														<td>
														</td>
														<td>
														</td>
														{
															lessonTypes.map((lessonType, lessonTypeIndex) =>
																<th key={lessonTypeIndex}>
																</th>
															)
														}
														<td>
														</td>
													</tr>
												)
											})
										}
									</tbody>
									<tfoot>
										<tr>
											<th colSpan={2}>
												Дүн
											</th>
											<th>
											</th>
											{
												lessonTypes.map((lessonType, lessonTypeIndex) =>
													<th key={lessonTypeIndex}>
														{rowCounts[lessonType.id]}
													</th>
												)
											}
											<th>
											</th>
										</tr>
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
		</>
	)
}