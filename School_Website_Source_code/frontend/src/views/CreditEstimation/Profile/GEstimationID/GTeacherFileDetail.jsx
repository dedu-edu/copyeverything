import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import classnames from 'classnames'
import useApi from '@src/utility/hooks/useApi'

function GTeacherFileDetail({ file }) {
	const { t } = useTranslation()
	const gApi = useApi(true).g_time

	const [minusScore, setMinusScore] = useState(0)
	const [description, setDescription] = useState('')
	const [loading, setLoading] = useState(false)
	const [activeTab, setActiveTab] = useState('1')

	useEffect(() => {
		setMinusScore(file?.minus_score || 0)
		setDescription(file?.check_senior_description || '')
	}, [file])

	const baseScore = file?.category_data?.score || 0
	const approveScore = Math.max(0, baseScore - minusScore)

	const toggle = tab => activeTab !== tab && setActiveTab(tab)

	const onSubmit = async decision => {
		if (!file?.id) return
		setLoading(true)

		const payload = {
			minus_score: decision === 1 ? minusScore : 0,
			check_senior_state: decision,
			check_senior: decision === 1,
			check_senior_description: description,
		}

		try {
			const { success } = await gApi.teacher.put(payload, file.id)
			if (success) alert('Амжилттай хадгалагдлаа')
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	const stateColor = { 1: 'success', 2: 'danger', 3: 'warning' }
	const stateText = { 1: 'Баталгаажсан', 2: 'Буцаасан', 3: 'Илгээсэн' }
	return (
		<div className="soft-border">
			<Nav tabs>
				{['1','2','3'].map(tab => (
					<NavItem key={tab}>
						<NavLink
							className={classnames({ active: activeTab === tab })}
							onClick={() => toggle(tab)}
							style={{ cursor: 'pointer' }}
						>
							{tab === '1' && 'Хүсэлт илгээгчийн утга'}
							{tab === '2' && 'Хяналтын явц'}
							{tab === '3' && 'Шийдвэрлэсэн үр дүн'}
						</NavLink>
					</NavItem>
				))}
			</Nav>

			<TabContent activeTab={activeTab}>
			<TabPane tabId="1">
				<div>
					<div className='header-gradient m-0 p-1 d-flex justify-content-between flex-row'>
						<strong>ОРЦ 9.1 Хүсэлт илгээгчийн утга </strong>
						<div><strong>{t('Илгээсэн огноо')}:</strong> {new Date(file.created_at).toLocaleString()}</div>
					</div>
					<div>
						<table className="table table-sm table-bordered">
							<tbody>
								<tr>
									<th>{t('Шалгуур')}</th>
									<td>{file.category_data ? file.category_data.name : '-'}</td>
								</tr>
								<tr>
									<th>{t('Хичээлийн жил')}</th>
									<td>{file.lesson_year}</td>
								</tr>
								<tr>
									<th>{t('Тооцох багц цаг')}</th>
									<td>{file?.category_data?.score || '-'}</td>
								</tr>
								<tr>
									<th>{t('Хэмжих нэгж')}</th>
									<td>{file?.category_data?.value || '-'}</td>
								</tr>
								<tr>
									<th>{t('Шийдвэрлэсэн')}</th>
									<td>{file?.approved_user_name || '-'}</td>
								</tr>
								<tr>
									<th>{t('Төлөв')}</th>
									<td>
									<Badge color={stateColor[file?.check_senior_state] || 'secondary'}>
										{stateText[file?.check_senior_state] || '-'}
									</Badge>
									</td>
								</tr>
								<tr>
									<th>Батлагдсан багц цаг</th>
									<td>{file?.approve_score || 'Тооцоо гараагүй байна'}</td>
								</tr>
								<tr>
									<th>Хорогдол</th>
									<td>{file?.minus_score || 'Тооцоо гараагүй байна'}</td>
								</tr>
								<tr>
									<th>Тайлбар</th>
									<td>
									<textarea
										className="form-control"
										value={description}
										disabled
										onChange={e => setDescription(e.target.value)}
									/>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					{file.file &&
						<div className="mt-1">
							<iframe
								src={"https://w3.pppl.gov/communications/web/tgrant.pdf"} //file.file || 
								title="PDF Viewer"
								width="100%"
								height="1000px"
								style={{ border: '1px solid #ccc', borderRadius: '8px' }}
							/>
						</div>
						}
				</div>
				</TabPane>
				<TabPane tabId="2">
					<div>
					<p className='header-gradient m-0 p-1'><strong>Явц 9.2 Хяналтын явц</strong></p>
					<div className="p-1 mb-2" style={{ backgroundColor: '#f8f9fa' }}>
						{/* 9.2.1 Арга зүйч тайлан хянах эсэх */}
						<div className="border-bottom-black border-1">
							<div className='mb-1 d-flex justify-content-between align-items-center'>
								<strong>9.2.1 Гүйцэтгэл зөв тооцсон эсэх</strong>
								<Badge color={file?.check_department ? "primary" : "warning"}>
								{file?.check_department ? "Тийм" : "Үгүй"}
								</Badge>
							</div>
							<div className="d-flex justify-content-between align-items-center mb-1">
								<strong>Төлөв</strong>
								<Badge color={stateColor[file?.check_dep_state]}>
								{stateText[file?.check_dep_state]}
								</Badge>
							</div>
							{file?.check_dep_description && (
								<div style={{ fontSize: '0.9rem', color: '#555' }}>
								{file.check_dep_description}
								</div>
							)}
						</div>

						{/* 9.2.2 Сургалтын төлөвлөлт шалгасан эсэх */}
						{/* <div className="d-flex justify-content-between align-items-center mt-2 mb-1">
							<strong>Гүйцэтгэлийг зөв тооцсон эсэх</strong>
							<Badge color={file?.check_senior ? "primary" : "warning"}>
							{file?.check_senior ? "Тийм" : "Үгүй"}
							</Badge>
						</div>
						<div className="d-flex justify-content-between align-items-center mb-1">
							<strong>Төлөв</strong>
							<Badge color={stateColor[file?.check_senior_state]}>
							{stateText[file?.check_senior_state]}
							</Badge>
						</div>
						{file?.check_senior_description && (
							<div style={{ fontSize: '0.9rem', color: '#555' }}>
							{file.check_senior_description}
							</div>
						)} */}

						{/* 9.2.3 Зөвлөлд танилуулах эсэх */}
						<div className="border-bottom-black border-1 mt-1">
							<div className='mb-1 d-flex justify-content-between align-items-center'>
								<strong> 9.2.3. Зөвлөлд танилуулах эсэх:</strong>
								<Badge color={file?.check_intro ? "primary" : "warning"}>
								{file?.check_intro ? "Тийм" : "Үгүй"}
								</Badge>
							</div>
							<div className="d-flex justify-content-between align-items-center mb-1">
								<strong>Төлөв</strong>
								<Badge color={stateColor[file?.check_intro_state]}>
								{stateText[file?.check_intro_state]}
								</Badge>
							</div>
							{file?.check_intro_description && (
								<div style={{ fontSize: '0.9rem', color: '#555' }}>
								{file.check_intro_description}
								</div>
							)}
						</div>

						{/* 9.2.4 Хуралдаан зохион байгуулах */}
						<div className="border-bottom-black border-1 mt-1">
							<div className='mb-1 d-flex justify-content-between align-items-center'>
								<strong>9.2.4. Хуралдаан зохион байгуулах</strong>
								<Badge color={file?.check_conference ? "primary" : "warning"}>
								{file?.check_conference ? "Тийм" : "Үгүй"}
								</Badge>
							</div>
							<div className="d-flex justify-content-between align-items-center mb-1">
								<strong>Төлөв</strong>
								<Badge color={stateColor[file?.check_conference_state]}>
								{stateText[file?.check_conference_state]}
								</Badge>
							</div>
							{file?.check_conference_description && (
								<div style={{ fontSize: '0.9rem', color: '#555' }}>
								{file.check_conference_description}
								</div>
							)}
							</div>
						</div> 
					</div>
				</TabPane>
				<TabPane tabId="3">
					<p>
						<strong>Суурь багц цаг</strong>
						<input className="form-control" value={baseScore} disabled />
					</p>

					<p>
						<strong>Хорогдол</strong>
						<input
							type="number"
							className="form-control"
							min={0}
							max={baseScore}
							value={minusScore}
							onChange={e => {
								let value = Number(e.target.value)
								if (value > baseScore) value = baseScore
								if (value < 0) value = 0
								setMinusScore(value)
							}}
						/>
					</p>

					<p>
						<strong>Батлагдсан багц цаг</strong>
						<input className="form-control" value={approveScore} disabled />
					</p>

					<div>
						<strong>Тайлбар</strong>
						<textarea
							className="form-control"
							value={description}
							onChange={e => setDescription(e.target.value)}
						/>
					</div>
					<p><strong>{t('Шийдвэрлэсэн')}:</strong> {file?.approved_user_name}</p>
					<p>
						<strong>{t('Төрөв')}:</strong>
						<Badge color={stateColor[file?.check_senior_state]}>{stateText[file?.check_senior_state] || '-'}</Badge>
					</p>
					<button
						className="btn btn-success me-1"
						onClick={() => onSubmit(1)}
						disabled={loading}
					>
						Зөвшөөрөх
					</button>

					<button
						className="btn btn-danger"
						onClick={() => onSubmit(2)}
						disabled={loading}
					>
						буцаах
					</button>
				</TabPane>
			</TabContent>
		</div>
	)
}

export default GTeacherFileDetail
