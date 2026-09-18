import React, { Fragment, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { X } from 'react-feather'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button, Col, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import * as Yup from 'yup'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import ScrollSelectFilter from '@src/components/ScrollSelectFilter'
import { validate } from '@utils'

import styles from './styles.module.scss'

const dtStyles = {
    fontSize: '12px',
    minHeight: '20px',
    maxHeight: '20px',
    height: '20px',
    padding: '0px !important',
    margin: '0px'
}

/**
 * to get unique merged array1 + array2 by id
 */
function getDistinctUnitedArray(array1, array2) {
    array1 = array1 || []
    array2 = array2 || []
    const array1Ids = new Set(array1.map((item) => item.id))
    const notDuplicatedArray2 = array2.filter((item2) => !array1Ids.has(item2.id))
    return [...array1, ...notDuplicatedArray2]
}

const Addmodal = ({ open, handleModal, refreshDatas, editId = '' }) => {
    const { t } = useTranslation()

    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

    const validateSchema = Yup.object().shape({
        name: Yup.string().trim().required('Хоосон байна')
    })

    // ** Hook
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        setError,
        watch
    } = useForm(validate(validateSchema))

    // selected values
    const selected = watch()

    // options to select
    const [selectStudent, setSelectStudent] = useState([])

    // selected students to remove
    const [removeStudents, setRemoveStudents] = useState([])

    const [editData, setEditData] = useState({})
    const [isDataTableValueSource, setIsDataTableValueSource] = useState({ student: true, selectStudent: true })

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({})
    const { isLoading: isLoadingSelectStudent, fetchData: selectStudentFetch } = useLoader({})

    // Api
    const levelGroupApi = useApi().student.levelGroup
    const subGroupApi = useApi().student.subGroup

    async function getOneData() {
        const { success, data } = await fetchData(levelGroupApi.getOne(editId))
        if (success) {
            setEditData(data)
        }
    }

    // Оюутны жагсаалт (available students)
    async function getSelectStudent() {
        if (!selected?.group && !selected?.subGroup) return

        const { success, data } = await selectStudentFetch(
            subGroupApi.getStudent({
                group: selected.group?.id,
                subGroup: selected.subGroup?.id,
                isExcludeUsedInLevelGroup: true,
                isMarkLGUsed: true
            })
        )

        if (success) setSelectStudent(data.results)
    }

    async function onSubmit(cdata) {
        cdata.student = cdata.student?.map((item) => item.id) || []

        if (editId) {
            const { success } = await postFetch(levelGroupApi.put(editId, cdata))
            if (success) {
                handleModal()
                refreshDatas()
            }
        } else {
            const { success, error } = await postFetch(levelGroupApi.post(cdata))
            if (success) {
                handleModal()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error['error']) {
                    setError(key, { type: 'custom', message: error['msg'] })
                }
            }
        }
    }

    useEffect(() => {
        getSelectStudent()
    }, [selected?.group?.id, selected?.subGroup?.id])

    useEffect(() => {
        if (editId) {
            getOneData()
        }
    }, [editId])

    useEffect(() => {
        if (Object.keys(editData)?.length > 0 && editId) {
            setValue('name', editData?.name || '')
            setValue('student', editData?.student || [])
        }
    }, [editData])

    return (
        <Fragment>
            {isLoading && Loader}
            <Modal isOpen={open} toggle={handleModal} className='modal-dialog-centered modal-lg' contentClassName='pt-0' backdrop='static'>
                <ModalHeader className='mb-1' toggle={handleModal} close={CloseBtn} tag='div'>
                    <h5 className='modal-title'>
                        {t('Түвшин бүлэг')} {editId ? t('засах') : t('бүртгэх')}
                    </h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col sm={12}>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='name'
                                render={({ field }) => (
                                    <>
                                        <Label className='form-label' for={field.name}>
                                            {t('Нэр')}
                                        </Label>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            bsSize='sm'
                                            placeholder={t('нэр')}
                                            type='text'
                                            invalid={errors[field.name] && true}
                                        />
                                        {errors[field.name] && <FormFeedback className='d-block'>{errors[field.name].message}</FormFeedback>}
                                    </>
                                )}
                            />
                        </Col>
                        <Col sm={12}>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='group'
                                render={({ field }) => {
                                    return (
                                        <>
                                            <Label className='form-label' for={field.name}>
                                                {t('Анги дамжаа')}
                                            </Label>
                                            <ScrollSelectFilter
                                                {...field}
                                                getApi={(page, search, limit) => subGroupApi.getGroup(limit, page, '', search)}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                            {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                        </>
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col sm={12}>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='subGroup'
                                render={({ field }) => {
                                    return (
                                        <>
                                            <Label className='form-label' for={field.name}>
                                                {t('Дэд бүлэг')}
                                            </Label>
                                            <ScrollSelectFilter
                                                {...field}
                                                getApi={(page, search, limit) => subGroupApi.get(limit, page, '', search, selected.group?.id || '')}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                                deps={[selected?.group?.id]}
                                            />
                                            {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                        </>
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col sm={6}>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='selectStudent'
                                render={({ field }) => {
                                    const value = field.value || []

                                    return (
                                        <>
                                            <Label className='form-label' for={field.name}>
                                                {t('Оюутан сонгоно уу')}{' '}
                                                {selected?.[field.name]?.length > 0 && <>({selected?.[field.name]?.length})</>}
                                            </Label>
                                            {selected[field.name]?.length > 0 && (
                                                <Button
                                                    size='sm'
                                                    color='success'
                                                    className='ms-1'
                                                    onClick={() => {
                                                        setIsDataTableValueSource({ ...isDataTableValueSource, [field.name]: false })
                                                        setValue('student', getDistinctUnitedArray(selected.student, value))
                                                    }}
                                                >
                                                    {t('Үүсгэх')}
                                                </Button>
                                            )}
                                            <div
                                                className={`react-dataTable react-dataTable-selectable-rows mx-50 rounded border my-50 ${styles.tableWrapper}`}
                                            >
                                                <DataTable
                                                    noHeader
                                                    className='react-dataTable'
                                                    progressPending={isLoadingSelectStudent}
                                                    progressComponent={
                                                        <div className='my-2'>
                                                            <h5>{t('Түр хүлээнэ үү...')}</h5>
                                                        </div>
                                                    }
                                                    noDataComponent={
                                                        <div className='my-2'>
                                                            <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                                        </div>
                                                    }
                                                    columns={[
                                                        {
                                                            name: '№',
                                                            selector: (row, index) => (
                                                                <div style={{ overflow: 'auto', height: '14.5px', width: '100%' }}>{index + 1}</div>
                                                            ),
                                                            width: '24px',
                                                            center: true,
                                                            conditionalCellStyles: [
                                                                {
                                                                    when: () => true,
                                                                    style: {
                                                                        padding: '0px',
                                                                        margin: '0px'
                                                                    }
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            name: <div className='text-center w-100'>{t('Оюутан')}</div>,
                                                            selector: (row) => (
                                                                <div style={{ overflow: 'auto', height: '14.5px', width: '100%' }}>
                                                                    {row.last_name?.charAt(0)?.toUpperCase()}. {row.first_name}
                                                                </div>
                                                            ),
                                                            wrap: true,
                                                            conditionalCellStyles: [
                                                                {
                                                                    when: () => true,
                                                                    style: {
                                                                        padding: '0',
                                                                        margin: '0 10px'
                                                                    }
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            name: <div className='text-center w-100'>{t('Код')}</div>,
                                                            selector: (row) => (
                                                                <div style={{ overflow: 'auto', height: '14.5px', width: '100%' }}>{row.code}</div>
                                                            ),
                                                            wrap: true,
                                                            center: true,
                                                            width: '100px',
                                                            conditionalCellStyles: [
                                                                {
                                                                    when: () => true,
                                                                    style: {
                                                                        padding: '0px',
                                                                        margin: '0px'
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]}
                                                    data={selectStudent}
                                                    fixedHeader
                                                    fixedHeaderScrollHeight='30vh'
                                                    selectableRows
                                                    onSelectedRowsChange={(state) => {
                                                        if (state.selectedRows.length !== value.length) {
                                                            if (isDataTableValueSource[field.name]) field.onChange(state.selectedRows)
                                                            else field.onChange(value)
                                                        }
                                                    }}
                                                    selectableRowSelected={(row) => {
                                                        const selectedState = value.map((item) => item.id)
                                                        if (!isDataTableValueSource[field.name])
                                                            setIsDataTableValueSource({ ...isDataTableValueSource, [field.name]: true })
                                                        return selectedState.includes(row.id)
                                                    }}
		                                            // selectableRowDisabled={row => row.is_used}
                                                    striped
                                                    highlightOnHover
                                                    selectableRowsHighlight
                                                    customStyles={{
                                                        header: {
                                                            style: dtStyles
                                                        },
                                                        headRow: {
                                                            style: dtStyles
                                                        },
                                                        headCells: {
                                                            style: dtStyles
                                                        },
                                                        rows: {
                                                            style: dtStyles
                                                        },
                                                        cells: {
                                                            style: dtStyles
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                        </>
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col sm={6}>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='student'
                                render={({ field }) => {
                                    const value = field.value || []

                                    return (
                                        <>
                                            <Label className='form-label' for={field.name}>
                                                {t('Сонгосон оюутнууд')}{' '}
                                                {selected?.[field.name]?.length > 0 && <>({selected?.[field.name]?.length})</>}
                                            </Label>
                                            {removeStudents?.length > 0 && (
                                                <Button
                                                    size='sm'
                                                    color='danger'
                                                    className='ms-1'
                                                    onClick={() => {
                                                        setIsDataTableValueSource({ ...isDataTableValueSource, [field.name]: false })
                                                        field.onChange(value.filter((item) => !removeStudents.includes(item.id)))
                                                        setRemoveStudents([])
                                                    }}
                                                >
                                                    {t('Устгах')}
                                                </Button>
                                            )}
                                            <div
                                                className={`react-dataTable react-dataTable-selectable-rows mx-50 rounded border my-50 ${styles.tableWrapper}`}
                                            >
                                                <DataTable
                                                    noHeader
                                                    className='react-dataTable'
                                                    progressPending={isLoading}
                                                    progressComponent={
                                                        <div className='my-2'>
                                                            <h5>{t('Түр хүлээнэ үү...')}</h5>
                                                        </div>
                                                    }
                                                    noDataComponent={
                                                        <div className='my-2'>
                                                            <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                                        </div>
                                                    }
                                                    columns={[
                                                        {
                                                            name: '№',
                                                            selector: (row, index) => (
                                                                <div style={{ overflow: 'auto', height: '14.5px', width: '100%' }}>{index + 1}</div>
                                                            ),
                                                            width: '24px',
                                                            center: true,
                                                            conditionalCellStyles: [
                                                                {
                                                                    when: () => true,
                                                                    style: {
                                                                        padding: '0px',
                                                                        margin: '0px'
                                                                    }
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            name: <div className='text-center w-100'>{t('Оюутан')}</div>,
                                                            selector: (row) => (
                                                                <div style={{ overflow: 'auto', height: '14.5px', width: '100%' }}>
                                                                    {row.last_name?.charAt(0)?.toUpperCase()}. {row.first_name}
                                                                </div>
                                                            ),
                                                            wrap: true,
                                                            conditionalCellStyles: [
                                                                {
                                                                    when: () => true,
                                                                    style: {
                                                                        padding: '0',
                                                                        margin: '0 10px'
                                                                    }
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            name: <div className='text-center w-100'>{t('Код')}</div>,
                                                            selector: (row) => (
                                                                <div style={{ overflow: 'auto', height: '14.5px', width: '100%' }}>{row.code}</div>
                                                            ),
                                                            wrap: true,
                                                            center: true,
                                                            width: '100px',
                                                            conditionalCellStyles: [
                                                                {
                                                                    when: () => true,
                                                                    style: {
                                                                        padding: '0px',
                                                                        margin: '0px'
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]}
                                                    data={value}
                                                    fixedHeader
                                                    fixedHeaderScrollHeight='30vh'
                                                    selectableRows
                                                    onSelectedRowsChange={(state) => {
                                                        if (state.selectedRows.length !== removeStudents.length) {
                                                            if (isDataTableValueSource[field.name])
                                                                setRemoveStudents(state.selectedRows.map((item) => item.id))
                                                        }
                                                    }}
                                                    selectableRowSelected={(row) => {
                                                        if (!isDataTableValueSource[field.name])
                                                            setIsDataTableValueSource({ ...isDataTableValueSource, [field.name]: true })
                                                        return removeStudents.includes(row.id)
                                                    }}
                                                    striped
                                                    highlightOnHover
                                                    selectableRowsHighlight
                                                    customStyles={{
                                                        header: {
                                                            style: dtStyles
                                                        },
                                                        headRow: {
                                                            style: dtStyles
                                                        },
                                                        headCells: {
                                                            style: dtStyles
                                                        },
                                                        rows: {
                                                            style: dtStyles
                                                        },
                                                        cells: {
                                                            style: dtStyles
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                        </>
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col md={12} className='mt-1 text-center'>
                            <Button className='me-1' color='primary' type='submit' disabled={postLoading}>
                                {postLoading && <Spinner size='sm' className='me-1' />}
                                {t('Хадгалах')}
                            </Button>
                            <Button color='secondary' type='reset' outline onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default Addmodal
