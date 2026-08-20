import Legend from "../../parts/Legend"


export default function BackCover() {
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
					<td>
						<Legend />
					</td>
				</tr>
				<tr className="fontSize2" style={{ height: '50%' }}>
					<td>
						АРХИВТ ХҮЛЭЭЛГЭН ӨГСӨН ТЭМДЭГЛЭЛ
					</td>
				</tr>
				<tr style={{ height: '50%' }}>
					<td>
						<table className="textAlign1 width4" style={{ whiteSpace: 'nowrap', margin: '0 auto' }}>
							<tbody>
								<tr>
									<td>
										Хүлээлгэн өгсөн:
									</td>
									<td colSpan={2}>
										<table style={{ width: '100%' }}>
											<tbody>
												<tr>
													<td>
														огноо
													</td>
													<td className="border2" style={{ width: '100%' }}>
													</td>
												</tr>
											</tbody>
										</table>
									</td>
								</tr>
								<tr>
									<td>
									</td>
									<td>
										нэр, албан тушаал
									</td>
									<td className="border2" style={{ width: '100%' }}>
									</td>
								</tr>
								<tr>
									<td>
										Хүлээлгэн авсан:
									</td>
									<td colSpan={2}>
										<table style={{ width: '100%' }}>
											<tbody>
												<tr>
													<td>
														огноо
													</td>
													<td className="border2" style={{ width: '100%' }}>
													</td>
												</tr>
											</tbody>
										</table>
									</td>
								</tr>
								<tr>
									<td>
									</td>
									<td>
										нэр, албан тушаал
									</td>
									<td className="border2">
									</td>
								</tr>
							</tbody>
						</table>
					</td>
				</tr>
			</tbody>
		</table>
	)
}