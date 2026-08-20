import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, CardText, CardTitle, Col, Row } from "reactstrap";
import { useState } from "react";

import CustomTable from "./components/CustomTable";
import useApiCustom from "./components/useApiCustom";
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import useModal from "@src/utility/hooks/useModal";
import excelDownload from '@src/utility/excelDownload'

export default function Control() {
	const { t } = useTranslation()
	const scienceControlApi = useApi().science.control
	const { isLoading: isLoadingPut, fetchData, Loader: LoaderPut } = useLoader({})
	const { showWarning } = useModal()

	// states
	const [refresh, setRefresh] = useState(false)

	const { data: apiResult, isLoading, Loader } = useApiCustom({
		apiFunction: () => scienceControlApi.get({}),
		deps: [refresh]
	})

	const data = apiResult?.data?.results ?? []
	const schools = apiResult?.extra_data.schools ?? []
	const is_approve = apiResult?.is_approve ?? false

	async function closeCancelPermission(schoolId, state, is_department=false) {
		let mode = state ? 'blockCancelPermission' : 'blockOpenPermission'
		if (is_department) {
			mode = 'backDepartmentRequest'
		}
		const { success } = await fetchData(scienceControlApi.put({ mode: mode, schoolId: schoolId }))
		if (success) setRefresh(current => !current)
	}

	async function downloadExcel() {
		const { success, data } = await fetchData(scienceControlApi.download())
		if (success) {
			const rowInfo = {
                headers: [
                    '№',
                    'Сургуулийн нэр',
                    'Тэнхимийн нэр',
                    'Овог',
                    'Нэр',
                    'Албан тушаал',
                    'И-мэйл',
                    'Утасны дугаар',
                    'Биелүүлэх оноо',
                    'Хуримтлагдсан оноо',
                    'Батлагдсан оноо',
                    'Нийт оноо',
                ],

                datas: [
                    'index',
                    'school_name',
                    'salbar_name',
                    'last_name',
                    'first_name',
                    'rank_name',
                    'email',
                    'phone_number',
                    'norm',
                    'science_score',
                    'approve_score',
                    'total_score',
                ]
            }
            excelDownload(data, rowInfo, 'ЭШ_онооны_жагсаалт')
		}
	}

	async function approve() {
		const { success } = await fetchData(scienceControlApi.put({ mode: 'approve' }))
		if (success) setRefresh(current => !current)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Эрдэм шинжилгээ гүйцэтгэлийн хяналт')}</CardTitle>
				<div>
					{
						<Button
							size="sm"
							color="primary"
							onClick={() => downloadExcel()}
						>
							{t('Онооны мэдээлэл татах')}
						</Button>
					}
					<Button
						size="sm"
						color="primary"
						className="ms-1"
						onClick={() => showWarning({
							header: {
								title: `${t('Хүсэлт илгээх')}`,
							},
							question: `Та  ТӨСБЗГ-луу бүх багшийн ЭШ гүйцэтгэлийн онооны мэдээллийг илгээх гэж байна. Хүсэлт илгээсний дараа засвар илгээх боломжгүйг анхаарна уу?`,
							onClick: () => approve(),
							btnText: 'Хүсэлт илгээх',
						})}
						disabled={is_approve}
					>
						{t('ТӨСБЗГ-луу Хүсэлт илгээх')}
					</Button>
				</div>
			</CardHeader>
			<CardBody>
				<CardText className="mb-1">
					{t('Уг цэсний тусламжтай баталгаажуулагүй тэнхим, багшийг хайж олох; сургууль, тэнхим, багш нарын файл оруулалтыг хянах.')}
				</CardText>
				<Row>
					{isLoading && Loader}
					{
						schools.map((school, index) => {
							const { id } = school
							const dataBySchool = data.filter(item => item.school_id === id)

							return (
								<Col key={index} sm={12} className="mb-3">
									{isLoadingPut && LoaderPut}
									<CustomTable rows={dataBySchool} extraData={school} closeCancelPermission={closeCancelPermission} is_approve={is_approve}/>
								</Col>
							)
						})
					}
				</Row>
			</CardBody>
		</Card>
	)
}
