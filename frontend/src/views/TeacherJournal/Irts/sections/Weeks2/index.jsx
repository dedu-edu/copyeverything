import { marks } from "../../constants";
import Legend from "../../parts/Legend"
import { generateDictStructure, getValueFromDict } from "../../../utils";


export default function Weeks2({ pageNumber, scale, students, selectValue, weeksStates, totalsWeeksPage1 }) {
	const bodyHeight = 530 * scale;
	const rowHeight = 21 * scale;
	const visibleRows = Math.floor(bodyHeight / rowHeight);

	let startWeek = 7
	const weeks = Array.from({ length: 9 }, (v, k) => { startWeek += 1; return startWeek })

	// counts
	const totals = {}

	const tbody = students.map((student, index) => {
		const totalsCols = {}

		return (
			<tr key={index}>
				{
					weeks.map((week, i1) => {
						const items = getValueFromDict(weeksStates, [week, student.id], [])

						const statesCounts = items.reduce((acc, item) => {
							if (!Object.keys(acc).includes(`${item}`)) acc[item] = 0
							acc[item]++

							// footer totals
							generateDictStructure(totals, [week, item], 0)
							totals[week][item]++

							// cols totals
							if (!Object.keys(totalsCols).includes(`${item}`)) totalsCols[item] = 0
							totalsCols[item]++

							return acc
						}, {})

						return marks.map((mark, i2) =>
							<td key={`${i1}-${i2}`} style={{ height: rowHeight }}>
								{statesCounts[mark.id]}
							</td>
						)
					})
				}
				{
					marks.map((item, index) => {
						const totalsPage1 = getValueFromDict(totalsWeeksPage1, [student.id, item.id], 0)
						const totalsPage2 = getValueFromDict(totalsCols, [item.id], 0)

						let result = null
						if (totalsPage1 || totalsPage2) result = totalsPage1 + totalsPage2
						return <th key={index} style={{ height: rowHeight }}>{result}</th>
					})
				}
			</tr>
		)
	})

	const tfoot = marks.map((item, index) => {
		const totalsPage1 = Object.keys(totalsWeeksPage1).reduce((acc, key) => {
			acc += totalsWeeksPage1[key][item.id] ?? 0
			return acc
		}, 0)

		const totalsPage2 = Object.keys(totals).reduce((acc, key) => {
			acc += totals[key][item.id] ?? 0
			return acc
		}, 0)

		let totalsOfBoth = null

		return (
			<tr key={index}>
				{
					weeks.map((week, i1) =>
						marks.map((mark, i2) =>
							<th key={`${i1}-${i2}`} style={{ height: rowHeight }}>
								{item.id === mark.id && totals[week] && totals[week][mark.id]}
							</th>
						)
					)
				}
				{
					marks.map((mark, i2) => {
						if (item.id === mark.id) totalsOfBoth = totalsPage1 + totalsPage2
						else totalsOfBoth = null

						return (
							<th key={i2} style={{ height: rowHeight }}>
								{totalsOfBoth}
							</th>
						)
					})
				}
			</tr>
		)
	})

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
									<td className="minWidth3 border2">
										{selectValue.group.name}
									</td>
									<td>
										СУРАЛЦАГЧИЙН ИРЦИЙН ТОВЧОО
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
										{
											weeks.map((item, index) =>
												<th key={index} colSpan={marks.length}>
													{item}
												</th>
											)
										}
										<th colSpan={marks.length}>
											Дүн
										</th>
									</tr>
									<tr>
										{
											weeks.map((week, i1) =>
												marks.map((mark, i2) =>
													<th key={`${i1}-${i2}`} className="textAlign1 padding5 height1" style={{ writingMode: 'sideways-lr' }}>
														{mark.name}
													</th>
												)
											)
										}
										{
											marks.map((item, index) =>
												<th key={index} className="textAlign1 padding5 height1" style={{ writingMode: 'sideways-lr' }}>
													{item.name}
												</th>
											)
										}
									</tr>
								</thead>
								<tbody>
									{tbody}
									{
										Array.from({ length: (visibleRows - students.length) < 0 ? 0 : visibleRows - students.length }, (v, k) => k).map((item, index) =>
											<tr key={index}>
												{
													weeks.map((week, i1) =>
														marks.map((mark, i2) =>
															<td key={`${i1}-${i2}`} style={{ height: rowHeight }}>
															</td>
														)
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
									}
								</tbody>
								<tfoot>
									{tfoot}
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