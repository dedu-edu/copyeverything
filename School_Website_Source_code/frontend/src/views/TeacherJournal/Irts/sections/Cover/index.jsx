import ScrollSelectFilter from "../../../components/ScrollSelectFilter"
import { useState } from "react"


export default function Cover({ selectValue, setSelectValue, cyear_name, getTeachers, getSubOrgs, getGroups, groupsDeps, teachersDeps }) {
	const [areSelectsOpened, setAreSelectsOpened] = useState({ s1: false, s2: false, s3: false })

	return (
		<table
			className="fontWeight1 textAlign2"
			style={{
				height: '100%',
				width: '100%',
			}}
		>
			<tbody>
				<tr className="fontSize2">
					<td className="verticalAlign1">
						МОНГОЛ УЛС<br />
						ДОТООД ХЭРГИЙН ИХ СУРГУУЛЬ
					</td>
				</tr>
				<tr className="fontSize3" style={{ height: '100%' }}>
					<td className="padding3">
						СУРАЛЦАГЧИЙН ИРЦИЙГ<br />
						БҮРТГЭХ ДЭВТЭР
						<div className="fontSize2 padding2" style={{ whiteSpace: 'nowrap' }}>
							<table>
								<tbody>
									<tr>
										<td>
											Бүрэлдэхүүн сургууль
										</td>
										<td className="border2" style={{ width: '100%' }}>
											<div onClick={() => setAreSelectsOpened(current => ({ ...current, s1: !current.s1 }))}>
												<ScrollSelectFilter
													fieldName='subOrg'
													getApi={getSubOrgs}
													getOptionLabel={(option) => option.name}
													getOptionValue={(option) => option.id}
													onChange={(val) => setSelectValue(current => ({ ...current, subOrg: val ?? {} }))}
													value={selectValue.subOrg}
													menuIsOpen={areSelectsOpened.s1}
												/>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
							<table>
								<tbody>
									<tr>
										<td>
											Багш
										</td>
										<td className="border2" style={{ width: '100%' }}>
											<div onClick={() => setAreSelectsOpened(current => ({ ...current, s3: !current.s3 }))}>
												<ScrollSelectFilter
													fieldName='teacher'
													getApi={getTeachers}
													getOptionLabel={(option) => `${option.register_code ?? ''} ${option.register ?? ''} ${option.full_name}`}
													getOptionValue={(option) => option.id}
													onChange={(val) => setSelectValue(current => ({ ...current, teacher: val ?? {} }))}
													value={selectValue.teacher}
													deps={teachersDeps}
													menuIsOpen={areSelectsOpened.s3}
												/>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
							<table className="margin2">
								<tbody>
									<tr>
										<td>
											Анги
										</td>
										<td className="border2" style={{ width: '100%' }}>
											<div onClick={() => setAreSelectsOpened(current => ({ ...current, s2: !current.s2 }))}>
												<ScrollSelectFilter
													fieldName='group'
													getApi={getGroups}
													getOptionLabel={(option) => option.name}
													getOptionValue={(option) => option.id}
													onChange={(val) => setSelectValue(current => ({ ...current, group: val ?? {} }))}
													value={selectValue.group}
													deps={groupsDeps}
													menuIsOpen={areSelectsOpened.s2}
												/>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
							{cyear_name} оны хичээлийн жил
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	)
}