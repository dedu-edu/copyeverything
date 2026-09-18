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

const validateSchema = Yup.object().shape({
    name: Yup.string().trim().required('Хоосон байна')
})

const dtStyles = {
    fontSize: '12px',
    minHeight: '20px',
    maxHeight: '20px',
    height: '20px',
    padding: '0px !important',
    margin: '0px'
}

const Addmodal = ({ open, handleModal, refreshDatas, editId = '' }) => {
    const { t } = useTranslation()

    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

    // ** Hook
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm(validate(validateSchema))

    // selected values
    const selected = watch()

    // options to select
    const [student, setStudent] = useState([])

    // edit data
    const [editData, setEditData] = useState({})
    const [isEditDataLoad, setIsEditDataLoad] = useState(false)

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })
    const { isLoading: isLoadingStudent, fetchData: studentFetch } = useLoader({})
    const { isLoading: submitLoading, fetchData: submitFetch } = useLoader({})

    // Api
    const subGroupApi = useApi().student.subGroup

    // Оюутны жагсаалт
    async function getStudent() {
        if (!selected?.group) return

        // to build request
        const request = { group: selected.group.id, excludeSubGroup: editId, isMarkSGUsed: true }
        if (!editId) request.isExcludeUsedInSubGroup = true

        const { success, data } = await studentFetch(subGroupApi.getStudent(request))
        if (success) setStudent(data.results)
    }

    async function onSubmit(cdata) {
        if (cdata.group) cdata.group = [cdata.group.id]
        let response = null
        if (editId) response = await submitFetch(subGroupApi.put(editId, cdata))
        else response = await submitFetch(subGroupApi.post(cdata))
        const { success } = response

        if (success) {
            handleModal()
            refreshDatas()
        }
    }

    useEffect(() => {
        getStudent()
    }, [selected?.group?.id])

    async function getEditData() {
        if (!editId) return
        const { success, data } = await fetchData(subGroupApi.getOne(editId))
        if (success) setEditData(data)
    }

    useEffect(() => {
        getEditData()
    }, [editId])

    useEffect(() => {
        if (editData && Object.keys(editData)?.length > 0 && editId) {
            setValue('name', editData?.name || '')
            setValue('group', editData?.group?.[0] || '')
            setValue('student', editData?.student?.map((item) => item.id) || '')
            setIsEditDataLoad(true)
        }
    }, [editData])

    return (
        <Fragment>
            {isLoading && Loader}
            <Modal isOpen={open} toggle={handleModal} className='modal-dialog-centered' contentClassName='pt-0' backdrop='static'>
                <ModalHeader className='mb-1' toggle={handleModal} close={CloseBtn} tag='div'>
                    <h5 className='modal-title'>{t('Дэд бүлэг')} {editId ? t('засах') : t('бүртгэх')}</h5>
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
                                name='student'
                                render={({ field }) => {
                                    return (
                                        <>
                                            <Label className='form-label' for={field.name}>
                                                {t('Дэд бүлэгт хуваарилагдсан оюутнууд')}{' '}
                                                {selected?.student?.length > 0 && <>({selected?.student?.length})</>}
                                            </Label>
                                            <div
                                                className={`react-dataTable react-dataTable-selectable-rows mx-50 rounded border my-50 ${styles.tableWrapper}`}
                                            >
                                                <DataTable
                                                    noHeader
                                                    className='react-dataTable'
                                                    progressPending={isLoadingStudent}
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
                                                                    {row.last_name.charAt(0).toUpperCase()}. {row.first_name}
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
                                                    data={student}
                                                    fixedHeader
                                                    fixedHeaderScrollHeight='30vh'
                                                    selectableRows
                                                    onSelectedRowsChange={(state) => {
                                                        const selectedState = field.value || []
                                                        const newSelectedIds = state.selectedRows.map((item) => item.id)
                                                        let isChanged = newSelectedIds.some((id) => !selectedState.includes(id))
                                                        if (!isChanged) isChanged = selectedState.some((id) => !newSelectedIds.includes(id))
                                                        if (isChanged && !isEditDataLoad) field.onChange(newSelectedIds)
                                                    }}
                                                    selectableRowSelected={(row) => {
                                                        const selectedState = field.value || []
                                                        if (isEditDataLoad) setIsEditDataLoad(false)
                                                        return selectedState.includes(row.id)
                                                    }}
		                                            selectableRowDisabled={row => row.is_used}
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
                            <Button className='me-1' color='primary' type='submit' disabled={submitLoading}>
                                {submitLoading && <Spinner size='sm' className='me-1' />}
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
