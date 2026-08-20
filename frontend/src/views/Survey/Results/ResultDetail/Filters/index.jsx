import Select from 'react-select'
import classNames from "classnames"
import { useTranslation } from "react-i18next"
import { Col, Label, Row } from "reactstrap"
import { useEffect, useState } from 'react'

import { get_gender_list, ReactSelectStyles } from "@src/utility/Utils"
import ScrollSelectFilter from '@src/views/Survey/components/ScrollSelectFilter'
import useApi from '@src/utility/hooks/useApi'


export default function Filters({ setSelectValue, selectValue }) {
	const { t } = useTranslation()

	useEffect(() => {
		sessionStorage.setItem("surveyResultsDetailFilters", JSON.stringify(selectValue))
	}, [selectValue])

	// fields
	const genderFieldName = 'gender'
	const professionFieldName = 'profession'
	const lessonFieldName = 'lesson'
	const groupFieldName = 'group'

	// options
	const [genders, setGenders] = useState(get_gender_list())

	// apis
	const professionApi = useApi().study.professionDefinition
	const lessonStandartApi = useApi().study.lessonStandart
    const groupApi = useApi().student.group

	const toRender = (
		<Row>
			<Col lg={2} md={4}>
				<Label>{t('Хүйс')}</Label>
				<Select
					value={selectValue[genderFieldName] ?? ''}
					onChange={(val) => {
						setSelectValue(current => ({ ...current, [genderFieldName]: val }))
					}}
					getOptionValue={(option) => option.id}
					getOptionLabel={(option) => option.name}
					options={genders}
					styles={ReactSelectStyles}
					classNamePrefix='select'
					className={classNames('react-select')}
					placeholder={t('-- Сонгоно уу --')}
					noOptionsMessage={() => t('Хоосон байна')}
					isClearable
				/>
			</Col>
			<Col lg={2} md={4}>
				<Label for='form-label'>{t('Хөтөлбөр')}</Label>
				<ScrollSelectFilter
					value={selectValue[professionFieldName] ?? ''}
					onChange={(val) => {
						setSelectValue(current => ({ ...current, [professionFieldName]: val }))
					}}
					getOptionValue={(option) => option.id}
					getOptionLabel={(option) => `${option.code} ${option.name}(${option.degree.degree_code})(${option.confirm_year})`}
					fieldName={professionFieldName}
					getApi={(page, search, limit) => professionApi.get(limit, page, '', search, '', '')}
				/>
			</Col>
			<Col lg={2} md={4}>
				<Label for='form-label'>{t('Хичээл')}</Label>
				<ScrollSelectFilter
					value={selectValue[lessonFieldName] ?? ''}
					onChange={(val) => {
						setSelectValue(current => ({ ...current, [lessonFieldName]: val }))
					}}
					getOptionValue={(option) => option.id}
					getOptionLabel={(option) => option.code + ' ' + option.name}
					fieldName={lessonFieldName}
					getApi={(page, search, limit) => lessonStandartApi.get(limit, page, '', search, '', '')}
				/>
			</Col>
			<Col lg={2} md={4}>
				<Label for='form-label'>{t('Анги дамжаа')}</Label>
				<ScrollSelectFilter
					value={selectValue[groupFieldName] ?? ''}
					onChange={(val) => {
						setSelectValue(current => ({ ...current, [groupFieldName]: val }))
					}}
					getOptionValue={(option) => option.id}
					getOptionLabel={(option) => `${option.name}(${option.degree.degree_code})(${option.year})`}
					fieldName={groupFieldName}
					getApi={(page, search, limit) => groupApi.get(limit, page, '', search, '', '', '', '', '', '')}
				/>
			</Col>
		</Row>
	)

	return toRender
}