import classnames from 'classnames'
import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import TreeView, { flattenTree } from 'react-accessible-treeview'
import { CheckSquare, ChevronRight, MinusSquare, Search, Square } from 'react-feather'
import { Button, Col, Input, Label, Row, Spinner } from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

import StateCustomPagination from '../../../../components/StateCustomPagination'

import './checkbox.css'

function Student({ onChosenScopeChange }) {
    const [isAll, setIsAll] = useState(false)
    const [formatData, setFormatData] = useState({})
    const { isLoading, fetchData } = useLoader({})

    const [selectedValue, setSelectedValue] = useState('')

    // #region pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPageCount, setTotalPageCount] = useState(1)
    const [recordsLimit, setRecordsLimit] = useState(25)
    // endregion

    const surveyApi = useApi().survey.surveyrange

    async function getDatas() {
        const { success, data: apiResult } = await fetchData(
            surveyApi.get({ limit: recordsLimit, page: currentPage, types: 'student', selectedValue: selectedValue, search: searchText })
        )
        if (success) {
            const data = apiResult?.results
            setTotalPageCount(apiResult?.count)
            var formattedData = {}
            if (selectedValue === 'is_org') {
                formattedData = {
                    name: 'Бүгд',
                    id: 'all',
                    children: data.map((citem1) => ({
                        name: citem1.name,
                        id: `school${citem1?.id}`,
                        children: citem1.children
                            ? citem1.children.map((citem2) => ({
                                  name: citem2.name,
                                  id: `subschool${citem2?.id}`,
                                  children: citem2.children
                                      ? citem2.children.map((citem3) => ({
                                            name: citem3.name,
                                            id: `salbar${citem3?.id}`,
                                            children: citem3.children
                                                ? citem3.children.map((citem4) => ({
                                                      name: citem4.name,
                                                      id: `pro${citem4?.id}`,
                                                      children: citem4.children
                                                          ? citem4.children.map((citem5) => ({
                                                                id: citem5?.id,
                                                                name: citem5.name
                                                            }))
                                                          : []
                                                  }))
                                                : []
                                        }))
                                      : []
                              }))
                            : []
                    }))
                }
            } else if (selectedValue === 'is_dep') {
                formattedData = {
                    name: 'Бүгд',
                    id: 'all',
                    children: data.map((citem1) => ({
                        name: citem1.name,
                        id: `salbar${citem1?.id}`,
                        children: citem1.children
                            ? citem1.children.map((citem2) => ({
                                  name: citem2.name,
                                  id: `pro${citem2?.id}`,
                                  children: citem2.children
                                      ? citem2.children.map((citem3) => ({
                                            name: citem3.name,
                                            id: `group${citem3?.id}`,
                                            children: citem3.children
                                                ? citem3.children.map((citem4) => ({
                                                      name: citem4.name,
                                                      id: citem4?.id
                                                  }))
                                                : []
                                        }))
                                      : []
                              }))
                            : []
                    }))
                }
            } else if (selectedValue === 'is_pro') {
                formattedData = {
                    name: 'Бүгд',
                    id: 'all',
                    children: data.map((citem1) => ({
                        name: citem1.name,
                        id: `pro${citem1?.id}`,
                        children: citem1.children
                            ? citem1.children.map((citem2) => ({
                                  name: citem2.name,
                                  id: `group${citem2?.id}`,
                                  children: citem2.children
                                      ? citem2.children.map((citem3) => ({
                                            name: citem3.name,
                                            id: citem3?.id
                                        }))
                                      : []
                              }))
                            : []
                    }))
                }
            } else if (selectedValue === 'is_group') {
                formattedData = {
                    name: 'Бүгд',
                    id: 'all',
                    children: data.map((citem1) => ({
                        name: citem1.name,
                        id: `group${citem1?.id}`,
                        children: citem1.children
                            ? citem1.children.map((citem2) => ({
                                  name: citem2.name,
                                  id: citem2?.id
                              }))
                            : []
                    }))
                }
            }

            setFormatData(formattedData)
        }
    }

    useEffect(() => {
        getDatas()
    }, [selectedValue])

    const handleTreeSelect = (selectedItems) => {
        var selectedIds = []
        selectedItems?.treeState?.selectedIds.forEach((select_id) => {
            if (typeof select_id === 'number') selectedIds.push(select_id)
        })

        onChosenScopeChange(selectedIds)
    }

	// #region search
	const [searchText, setSearchText] = useState('')

	function handleSearch(text) {
		setSearchText(text.trimStart())
		setCurrentPage(1)
	}

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			getDatas()
		}, 1000);

		return () => {
			clearTimeout(timeoutId)
		}
	}, [searchText])
	// #endregion

    return (
        <Row>
            <Col md={6} sx={12}>
                <div className='added-cards mb-2'>
                    <div className={classnames('cardMaster rounded border p-1')}>
                        <p>Хамрах хүрээ</p>
                        <div className='mb-1'>
                            <Input
                                type='checkbox'
                                className='me-1'
                                name={'all'}
                                id={'all'}
                                checked={isAll}
                                onChange={(e) => {
                                    setIsAll(e.target.checked), onChosenScopeChange(null, true)
                                }}
                            />
                            <Label className='form-check-label' for={'all'}>
                                {'Бүх оюутнууд'}
                            </Label>
                        </div>

                        {!isAll && (
                            <>
                                <div className='mb-1'>
                                    <Input
                                        type='checkbox'
                                        className='me-1'
                                        id='is_org'
                                        name={'is_org'}
                                        checked={selectedValue === 'is_org'}
                                        onChange={(e) => setSelectedValue(e.target.name)}
                                    />
                                    <Label className='form-check-label' for={'is_org'}>
                                        {'Салбар сургууль'}
                                    </Label>
                                </div>
                                <div className='mb-1'>
                                    <Input
                                        type='checkbox'
                                        className='me-1'
                                        id='is_dep'
                                        name={'is_dep'}
                                        checked={selectedValue === 'is_dep'}
                                        onChange={(e) => setSelectedValue(e.target.name)}
                                    />
                                    <Label className='form-check-label' for={'is_dep'}>
                                        {'Тэнхим'}
                                    </Label>
                                </div>
                                <div className='mb-1'>
                                    <Input
                                        type='checkbox'
                                        className='me-1'
                                        id='is_pro'
                                        name={'is_pro'}
                                        checked={selectedValue === 'is_pro'}
                                        onChange={(e) => setSelectedValue(e.target.name)}
                                    />
                                    <Label className='form-check-label' for={'is_pro'}>
                                        {'Мэргэжил'}
                                    </Label>
                                </div>
                                <div className='mb-1'>
                                    <Input
                                        type='checkbox'
                                        className='me-1'
                                        name={'is_group'}
                                        id={'is_group'}
                                        checked={selectedValue === 'is_group'}
                                        onChange={(e) => setSelectedValue(e.target.name)}
                                    />
                                    <Label className='form-check-label' for={'is_group'}>
                                        {'Анги'}
                                    </Label>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Col>
            {!isAll && (
                <Col md={6} sx={12}>
                    {isLoading && (
                        <div className='suspense-loader'>
                            <Spinner />
                            <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                        </div>
                    )}
                    <div className={classnames('cardMaster rounded border p-1')}>
						<Row>
							<Col>
								<Label className="form-label" for="search-input">
									{t('Хайлт')}
								</Label>
							</Col>
							<Col className='d-flex align-items-end mobile-datatable-search '>
								<Input
									className='dataTable-filter mb-50'
									type='text'
									bsSize='sm'
									id='search-input'
									placeholder={t("Хайх")}
									value={searchText}
									onChange={(e) => handleSearch(e.target.value)}
									onKeyPress={e => e.key === 'Enter' && handleSearch(searchText)}
								/>
								<Button
									size='sm'
									className='ms-50 mb-50'
									color='primary'
									onClick={() => handleSearch(searchText)}
								>
									<Search size={15} />
									<span className='align-middle ms-50'></span>
								</Button>
							</Col>
						</Row>
                        {totalPageCount > 0 && (
                            <StateCustomPagination
                                refreshDatas={getDatas}
                                current_page={currentPage}
                                setParentStateLimit={setRecordsLimit}
                                setParentStatePage={setCurrentPage}
                                totalCount={totalPageCount}
                            />
                        )}
                        <div className='checkbox'>
                            <TreeView
                                data={flattenTree(formatData)}
                                aria-label='Checkbox tree'
                                multiSelect
                                propagateSelect
                                propagateSelectUpwards
                                togglableSelect
                                onSelect={handleTreeSelect}
                                nodeRenderer={({
                                    element,
                                    isBranch,
                                    isExpanded,
                                    isSelected,
                                    isHalfSelected,
                                    getNodeProps,
                                    level,
                                    handleSelect,
                                    handleExpand
                                }) => {
                                    return (
                                        <div {...getNodeProps({ onClick: handleExpand })} style={{ marginLeft: 40 * (level - 1) }}>
                                            {isBranch && <ArrowIcon isOpen={isExpanded} />}
                                            <CheckBoxIcon
                                                className='checkbox-icon'
                                                size={20}
                                                onClick={(e) => {
                                                    handleSelect(e)
                                                    e.stopPropagation()
                                                }}
                                                variant={isHalfSelected ? 'some' : isSelected ? 'all' : 'none'}
                                            />
                                            <span className='name'>{element.name}</span>
                                        </div>
                                    )
                                }}
                            />
                        </div>
                    </div>
                </Col>
            )}
        </Row>
    )
}

// treeview ийн Icon
const ArrowIcon = ({ isOpen, className }) => {
    const baseClass = 'arrow'
    const classes = classnames(baseClass, { [`${baseClass}--closed`]: !isOpen }, { [`${baseClass}--open`]: isOpen }, className)
    return <ChevronRight className={classes} />
}
const CheckBoxIcon = ({ variant, ...rest }) => {
    switch (variant) {
        case 'all':
            return <CheckSquare size={15} {...rest} />
        case 'none':
            return <Square size={15} {...rest} />
        case 'some':
            return <MinusSquare size={15} {...rest} />
        default:
            return null
    }
}

export default Student
