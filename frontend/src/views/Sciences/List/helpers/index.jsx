import { t } from 'i18next';
import React, {  useRef, useContext, useState } from "react";
import useLoader from "@hooks/useLoader";
import useModal from '@hooks/useModal';
// import { RefreshCcw, SkipBack } from "react-feather";
import {
    Input,
	Badge,
	Button,
	UncontrolledTooltip
} from "reactstrap";

import AuthContext from '@context/AuthContext'
import useApi from '@src/utility/hooks/useApi';
import { useNavigate } from 'react-router-dom';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, is_department, is_science,  check_science, check_dep, handleBack) {
	const page_count = Math.ceil(total_count / rowsPerPage)
	const { showWarning } = useModal()

	const focusData = useRef(undefined)

	const { user } = useContext(AuthContext)
	const { fetchData } = useLoader({ isFullScreen: false })
	const estimateApi = useApi().science.list

	const navigate = useNavigate()

	/** Input-ээс идэвхгүй болох үеийн event */
	const focusOut = (event) => {
		if (focusData.current || focusData.current == '')
		{
			event.target.value = focusData.current
		}
	}

    if (currentPage > page_count) {
        currentPage = 1
    }

	async function onSubmit(row, value, index, key)
	{
		let cdata = {}

		cdata = {
			'score': value,
		}

        if(row.id) {
            const { success } = await fetchData(estimateApi.putScore(row?.id, cdata))
            if(success) {
				focusData.current = (undefined)
				row[`${key}`] = value

				var nextElementId = `${key}-${index + 1}-input`
				var element = document.getElementById(`${nextElementId}`)
				if (element) element.focus()
			}
        }
    }

	const handleChangeScore = (event, code, index, key) => {
		if (["e", "E", "+", "-"].includes(event.key)) {
			event.preventDefault()
		}
		else if (event.key === 'Enter') {
			const value = event.target.value || 0
			onSubmit(code, value, index, key)
		}
	};

    const columns = [
		{
            name: "№",
            selector: (row, index) => {
				return (
					(currentPage - 1) * rowsPerPage + (index + 1)
				)
			},
            width: "50px",
            center:true,
        },
		{
			name: `${t('Багш')}`,
			selector: (row) => (
				<div style={{ textAlign: 'center', maxWidth: '180px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
					<div title={row?.full_name} style={{ fontWeight: 500 }}>
						{row?.full_name}
					</div>
					<div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
						{row?.email}
					</div>
				</div>
			),
			center: true,
			minWidth: '210px',
			wrap: true
		},
		{
			name: `${t('Сургууль')}`,
			selector: (row) => (<span title={row?.school_name}>{row?.school_name}</span>),
			maxWidth: '180px',
			left: true,
			wrap: true
		},
		{
			name: `${t('Тэнхим')}`,
			selector: (row) => (<span title={row?.salbar_name}>{row?.salbar_name}</span>),
			maxWidth: '150px',
			wrap: true,

		},
		{
			name: `${t('Албан тушаал')}`,
			selector: (row) => (<span title={row?.org_position}>{row?.org_position}</span>),
			minWidth: '120px',
			wrap: true,
			center: true,
		},
		{
			name: `${t('Биелүүлэх оноо')}`,
			selector: (row) => (<span>{`${row?.norm} `} </span>),
			maxWidth: '10px',
		},
		{
			name: `${'Хуримтлагдсан оноо'}`,
			selector: (row, index) => {
				return (
					<Input
						id={`science_score-${index}-input`}
						defaultValue={row?.science_score}
						onBlur={focusOut}
						type="number"
						bsSize='sm'

						placeholder={`Хуримтлагдсан оноо`}
						disabled={(Object.keys(user).length > 0 && (user?.permissions.includes('lms-science-list-update')) && !row?.is_approve) ? false : true}
						onFocus={(e) => focusData.current = (e.target.value)}
						onKeyPress={(e) => {
							handleChangeScore(e, row, index, 'science_score')
						}}
					/>
				)
			},
			maxWidth: '20px',
        },
		{
			name: `${'Өөрийн үнэлгээний оноо'}`,
			selector: (row) => row?.not_total_count,
			maxWidth: '20px',
			center: true,
        },
		{
			name: `${'Баталгаажуулсан оноо'}`,
			selector: (row) => (row?.total_count),
			maxWidth: '10px',
			center: true,
        },
		{
			name: `${'Хүсэлт илгээгдсэн эсэх'}`,
			selector: (row) => {
				return (
					<div>
						{
							row?.send_type
							?
								row?.is_approve
								?
									<Badge color='success'>Баталгаажуулсан</Badge>
								:
								row?.check_science
								?
									<Badge color='success'>Шалгаж дууссан</Badge>
								:
								row?.check_dep
								?
									<Badge color='primary'> ТЭ илгээсэн</Badge>
								:
									<Badge color='info'>Багш илгээсэн</Badge>
							:
								<Badge color='warning'>Илгээгээгүй</Badge>
						}
					</div>
				)
			},
			center: true,
			maxWidth: '160px',
		},
		{
			name: `${t('Үйлдэл')}`,
			selector: (row) => {
				return (
					<>
					{
						row?.is_file && is_department
						?
							<div className='d-flex'>
								<Button color='primary' size='sm' onClick={() => navigate(`/research/b-estimate/${row?.id}/`, {state: {'data': row, 'is_department': is_department}})} disabled={!row?.files_count}>{'Файл харах' }</Button>
							</div>
						:
							(row?.is_file )
							&&
							<Button color='primary' size='sm' onClick={() => navigate(`/research/b-estimate/${row?.id}/`, {state: {'data': row, 'is_department': is_department}})} disabled={!row?.files_count}>{(is_science && !is_department && !row?.is_approve) ? 'Файл шалгах' : 'Файл харах'}</Button>
					}
					</>
				)
			},
			center: true,
			minWidth: '100px',
		},
	]

	if(is_department) {
		var update_column = {
			name: `${t('Хүсэлт буцаах')}`,
			selector: (row) => {
				return (
					row?.is_open
					&&
					<Button color='primary' size='sm' className='ms-50'
						onClick={() => showWarning({
							header: {
								title: t(`Хүсэлт буцаах`),
							},
							question: t(`Та энэ багшийн илгээсэн хүсэлтийг буцаах гэж байна. Ингэснээр тэнхимээс ШУТГ-луу хүсэлт илгээх боломжгүй болохыг анхаарна уу?`),
							onClick: () => handleBack(row?.id),
							btnText: t('Илгээх'),
						})}
						disabled={(!row?.send_type || row?.check_science || row?.check_dep) ? true : false}
					>
						{'Хүсэлт буцаах' }
					</Button>
				)
			},
			center: true,
		}
		columns.push(update_column)
	}
    return columns
}
