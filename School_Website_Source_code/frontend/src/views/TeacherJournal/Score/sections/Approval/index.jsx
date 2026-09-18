import Legend from '../../parts/Legend'


export default function Approval({ selectValue, cyear_name }) {
	return (
		<table
			className='textAlign2'
			style={{
				height: '100%',
				width: '100%',
			}}
		>
			<tbody>
				<tr className='fontSize2'>
					<td className='padding1'>
						<Legend />
					</td>
				</tr>
				<tr className='fontSize2 fontWeight1'>
					<td>
						МОНГОЛ УЛС<br />
						ДОТООД ХЭРГИЙН ИХ СУРГУУЛЬ
					</td>
				</tr>
				<tr className='fontSize3 fontWeight1' style={{ height: '100%' }}>
					<td>
						СУРАЛЦАГЧИЙН ИРЦИЙГ
						БҮРТГЭХ ДЭВТЭР
						<div className='fontSize2 padding2 fontWeight2' style={{ whiteSpace: 'nowrap' }}>
							<table>
								<tbody>
									<tr>
										<td>
											Бүрэлдэхүүн сургууль
										</td>
										<td className='border2' style={{ width: '100%' }}>
											{selectValue.subOrg.name}
										</td>
									</tr>
								</tbody>
							</table>
							<table className='margin2'>
								<tbody>
									<tr>
										<td>
											Анги
										</td>
										<td className='border2' style={{ width: '100%' }}>
											{selectValue.group.name}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</td>
				</tr>
				<tr>
					<td className='padding1'>
						<table className="border1">
							<thead style={{ whiteSpace: 'nowrap' }}>
								<tr>
									<th className='textAlign1'>
										Гүйцэтгэл:
									</th>
									<th>
										Албан тушаал
									</th>
									<th className='width3'>
										Нэр
									</th>
									<th className='width3'>
										Гарын үсэг
									</th>
									<th className='width2'>
										Огноо
									</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className='textAlign1'>
										Баталсан:
									</td>
									<td>
										Тэргүүн дэд захирал
									</td>
									<td>
									</td>
									<td>
									</td>
									<td>
									</td>
								</tr>
								<tr>
									<td className='textAlign1'>
										Хянасан:
									</td>
									<td>
										Сургалтын бодлого, төлөвлөлтийн газрын дарга
									</td>
									<td>
									</td>
									<td>
									</td>
									<td>
									</td>
								</tr>
								<tr>
									<td className='textAlign1'>
										Боловсруулсан:
									</td>
									<td>
										СБТГ-ын ахлах мэргэжилтэн
									</td>
									<td>
									</td>
									<td>
									</td>
									<td>
									</td>
								</tr>
							</tbody>
						</table>
					</td>
				</tr>
				<tr>
					<td>
						{cyear_name} оны хичээлийн жил
					</td>
				</tr>
			</tbody>
		</table>
	)
}