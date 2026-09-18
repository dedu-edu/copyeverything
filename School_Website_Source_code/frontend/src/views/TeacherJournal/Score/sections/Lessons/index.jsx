import Legend from '../../parts/Legend'


export default function Lessons({
	pageNumber,
	scale,
	lessons,
	seasons,
	pagesNumbers
}) {
	const bodyHeight = 650 * scale;
	const rowHeight = 21 * scale;
	const visibleRows = Math.floor(bodyHeight / rowHeight);

	// indexes
	let rowIndex = 0

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
						ГАРЧИГ
					</td>
				</tr>
				<tr style={{ height: '100%' }}>
					<td className='verticalAlign1'>
						<div className="width5" style={{ height: '100%', overflow: 'auto' }}>
							<table className='border1' style={{ width: '100%' }}>
								<thead>
									<tr>
										<th rowSpan={2} style={{ whiteSpace: 'nowrap' }}>Д/д</th>
										<th colSpan={2}>Хичээлийн</th>
										<th rowSpan={2}>Багц цаг</th>
										<th rowSpan={2}>Улирал</th>
										<th rowSpan={2}>Хуудасны дугаар</th>
									</tr>
									<tr>
										<th>Нэр</th>
										<th>Индекс</th>
									</tr>
								</thead>
								<tbody>
									{
										lessons.map((item, index) => {
											const { name, code, kredit } = item

											return seasons.map((season, season_i) => {
												const { season_name } = season
												rowIndex++

												return (
													<tr key={`${index}-${season_i}`}>
														<td>
															{rowIndex}
														</td>
														<td className='textAlign1'>
															{name}
														</td>
														<td>
															{code}
														</td>
														<td>
															{kredit}
														</td>
														<td>
															{season_name}
														</td>
														<td>
															{pagesNumbers[item.id] && pagesNumbers[item.id][season.id]}
														</td>
													</tr>
												)
											})
										})
									}
									{
										Array.from({ length: (visibleRows - lessons.length * seasons.length) < 0 ? 0 : visibleRows - lessons.length * seasons.length }, (v, k) => k).map((item, index) => {
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
													<td>
													</td>
													<td>
													</td>
													<td>
													</td>
												</tr>
											)
										})
									}
								</tbody>
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