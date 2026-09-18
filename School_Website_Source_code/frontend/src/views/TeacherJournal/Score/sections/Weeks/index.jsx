import { useEffect } from "react";
import Legend from "../../parts/Legend"
import { generateDictStructure, getValueFromDict } from "../../../utils";
import { marks } from "../../constants";


export default function Weeks({ pageNumber, scale, students, weeksStates, setTotalsWeeksPage1 }) {
	const bodyHeight = 530 * scale;
	const rowHeight = 21 * scale;
	const visibleRows = Math.floor(bodyHeight / rowHeight);

	const weeks = Array.from({ length: 7 }, (v, k) => k + 1)

	// counts
	let rowIndex = 0
	const totals = {}
	const totalsCols = {}

	const tbody = students.map((student, index) => {
		rowIndex++

		return (
			<tr key={index}>
				<td>
					{rowIndex}
				</td>
				<td colSpan={2}>
					{student.last_name} {student.first_name}
				</td>
				{
					weeks.map((week, i1) => {
						const items = getValueFromDict(weeksStates, [week, student.id], [])

						const statesCounts = items.reduce((acc, item) => {
							if (!Object.keys(acc).includes(`${item}`)) acc[item] = 0
							acc[item]++

							// footer totals
							generateDictStructure(totals, [week, item], 0)
							totals[week][item]++

							generateDictStructure(totalsCols, [student.id, item], 0)
							totalsCols[student.id][item]++

							return acc
						}, {})

						return marks.map((mark, i2) =>
							<td key={`${i1}-${i2}`}>
								{statesCounts[mark.id]}
							</td>
						)
					})
				}
			</tr>
		)
	})

	useEffect(() => {
		setTotalsWeeksPage1(totalsCols)
	}, [weeksStates])

	return (
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
						<table style={{ margin: '0 auto' }}>
							<tbody>
								<tr>
									<td className="width3 border2">
									</td>
									<td>
										ХАГАС ЖИЛИЙН
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
										<th colSpan={3}>
											Долоо хоног
										</th>
										{
											weeks.map((item, index) =>
												<th key={index} colSpan={marks.length}>
													{item}
												</th>
											)
										}
									</tr>
									<tr>
										<th style={{ whiteSpace: 'nowrap' }}>
											Д/д
										</th>
										<th>
											Суралцагчийн овог, нэр
										</th>
										<th className="textAlign1 padding5" style={{ writingMode: 'sideways-lr' }}>
											Оролцоогүй<br />шалтгаан
										</th>
										{
											weeks.map((week, i1) =>
												marks.map((mark, i2) =>
													<th key={`${i1}-${i2}`} className="textAlign1 padding5 height1" style={{ writingMode: 'sideways-lr' }}>
														{mark.name}
													</th>
												)
											)
										}
									</tr>
								</thead>
								<tbody>
									{tbody}
									{
										Array.from({ length: (visibleRows - students.length) < 0 ? 0 : visibleRows - students.length }, (v, k) => k).map((item, index) => {
											rowIndex++

											return (
												<tr key={index}>
													<td>
														{rowIndex}
													</td>
													<td colSpan={2}>
													</td>
													{
														weeks.map((week, i1) =>
															marks.map((mark, i2) =>
																<td key={`${i1}-${i2}`}>
																</td>
															)
														)
													}
												</tr>
											)
										})
									}
								</tbody>
								<tfoot>
									{
										marks.map((item, index) =>
											<tr key={index}>
												{
													index === 0 &&
													<th rowSpan={marks.length}>
														Дүн
													</th>
												}
												<th colSpan={2}>
													{item.name}/{item.name.charAt(0).toLowerCase()}/
												</th>
												{
													weeks.map((week, i1) =>
														marks.map((mark, i2) =>
															<th key={`${i1}-${i2}`}>
																{item.id === mark.id && totals[week] && totals[week][mark.id]}
															</th>
														)
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
	)
}