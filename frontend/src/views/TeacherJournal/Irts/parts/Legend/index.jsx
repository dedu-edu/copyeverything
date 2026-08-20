export default function Legend() {
	return (
		<table className="border1 fontSize1" style={{ width: '100%' }}>
			<tbody>
				<tr>
					<td rowSpan={2} className="width1">
					</td>
					<td colSpan={2} className="textAlign1">
						Баримт бичгийн нэр:
					</td>
					<td colSpan={4} className="textAlign1">
						Суралцагчийн ирцийг бүртгэх дэвтэр
					</td>
					<td rowSpan={2} className="width1">
					</td>
				</tr>
				<tr>
					<td className="textAlign1">
						Код:
					</td>
					<td>
						А.Ж-101
					</td>
					<td className="textAlign1">
						Баталсан огноо:
					</td>
					<td className="width2">
					</td>
					<td className="textAlign1">
						Хувилбар:
					</td>
					<td className="width2">
						1
					</td>
				</tr>
			</tbody>
		</table>
	)
}