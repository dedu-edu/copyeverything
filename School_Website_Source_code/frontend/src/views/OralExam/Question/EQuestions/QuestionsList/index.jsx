import classnames from 'classnames'
import React, { Fragment, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronsLeft, Download, PenTool, UploadCloud } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Label,
    Row,
    Spinner
} from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { useSkin } from '@src/utility/hooks/useSkin'
import { getPagination } from '@utils'
import { get_levelseasons, ReactSelectStyles } from '@utils'

import AddQuestion from './AddQuestion'
import EditModal from './EditModal'
import FileModal from './FileModal'
import { getColumns } from './helpers'

const QuestionsList = ({ filterId, teacher_id, lessonId, setStep }) => {
    const { t } = useTranslation()
    const { skin } = useSkin()

    const { isLoading, fetchData } = useLoader({})

    const [datas, setDatas] = useState([])
    const [questionDetail, setQuestionDetail] = useState({})

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState('')
    const [total_count, setTotalCount] = useState(1)

    const [modal, setModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [fileModal, setFileModal] = useState(false)
    const [stype] = useState('')
    const [level, setLevel] = useState('')

    const [dropdownOpen, setDropdownOpen] = useState(false)

    // Нэмэх функц
    const handleModal = () => {
        setModal(!modal)
    }

    const handleEditModal = () => {
        setEditModal(!editModal)
    }

    const handleFileModal = () => {
        setFileModal(!fileModal)
    }

    const toggle = () => setDropdownOpen((prevState) => !prevState)

    // API
    const questionAPI = useApi().challenge.question
    const oralExamQuestionApi = useApi().challenge.oralExam.question

    async function getDatas() {
        const { success, data } = await fetchData(
            oralExamQuestionApi.get(currentPage, rowsPerPage, searchValue, filterId, teacher_id, stype, level, lessonId)
        )
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    async function handleDelete(id) {
        const { success } = await fetchData(questionAPI.delete(id))
        if (success) {
            getDatas()
        }
    }

    // ** Function to handle filter
    const handleFilter = (e) => {
        const value = e.target.value.trimStart()
        setSearchValue(value)
    }

    function handleQuestionEdit(data) {
        setQuestionDetail(data)
        setEditModal(true)
    }

    function staticExcelHandler() {
        var excelUrl = '/assets/asuult_zagwar_aman.xlsx'

        const link = document.createElement('a')
        link.href = excelUrl

        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)
    }

    useEffect(() => {
        getDatas()
    }, [currentPage, rowsPerPage, filterId, level, stype])

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1)
    }

    useEffect(() => {
        if (searchValue.length == 0) {
            getDatas()
        } else {
            const timeoutId = setTimeout(() => {
                getDatas()
            }, 600)

            return () => clearTimeout(timeoutId)
        }
    }, [searchValue])

    return (
        <Fragment>
            {isLoading && (
                <div className='suspense-loader'>
                    <Spinner />
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            )}
            <Card className='m-0'>
                <CardHeader className='py-1'>
                    <div
                        className='cursor-pointer'
                        role='a'
                        onClick={() => setStep(2)}
                        color='primary'
                    >
                        <ChevronsLeft />
                        {t('Буцах')}
                    </div>
                    <CardTitle tag={'h5'}>{t('Асуултын жагсаалт')}</CardTitle>
                    <div className='d-flex gap-2'>
                        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                            <DropdownToggle color={skin === 'light' ? 'dark' : 'light'} className='' caret outline>
                                <PenTool size={15} />
                                <span className='align-middle ms-50'>{t('Загвар')}</span>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem header className='text-wrap'>
                                    {t('Эксэл файлаар асуулт оруулах хэсэг')}
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem className='w-100' onClick={() => staticExcelHandler()}>
                                    <Download size={15} />
                                    <span className='align-middle ms-50'>{t('Татах')}</span>
                                </DropdownItem>
                                <DropdownItem className='w-100' onClick={() => handleFileModal()}>
                                    <UploadCloud size={15} />
                                    <span className='align-middle ms-50'>{t('Оруулах')}</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Button
                            color='primary'
                            size='sm'
                            onClick={() => {
                                setModal(true)
                            }}
                        >
                            {t('Нэмэх')}
                        </Button>
                    </div>
                </CardHeader>
                <CardBody className='p-0 px-1'>
                    <Row className={'mb-1 justify-content-between'}>
                        <Col md={3}>
                            <Label>{t('Асуултын түвшин')}</Label>
                            <Select
                                classNamePrefix='select'
                                className={classnames('react-select')}
                                options={get_levelseasons()}
                                placeholder={`-- ${t('Сонгоно уу')} --`}
                                noOptionsMessage={() => t('Хоосон байна') + '.'}
                                onChange={(val) => {
                                    setLevel(val?.id || '')
                                }}
                                isClearable
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                        </Col>
                        <Col md={3}>
                            <Label className='form-label'>
                                {t('Хайлт')}
                            </Label>
                            <Input
                                type='text'
                                bsSize='sm'
                                id='search-input'
                                value={searchValue}
                                onChange={handleFilter}
                                placeholder={t('Хайх үг....')}
                            />
                        </Col>
                    </Row>
                    <div className='react-dataTable react-dataTable-selectable-rows'>
                        <DataTable
                            noHeader
                            pagination
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
                            columns={getColumns(currentPage, rowsPerPage, total_count, handleDelete, handleQuestionEdit, teacher_id)}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
                    </div>
                </CardBody>
                {modal && <AddQuestion open={modal} handleModal={handleModal} getDatas={getDatas} title={filterId} />}
                {editModal && <EditModal open={editModal} handleModal={handleEditModal} questionDetail={questionDetail} getDatas={getDatas} />}
                {fileModal && <FileModal isOpen={fileModal} handleModal={handleFileModal} refreshData={getDatas} title={filterId} />}
            </Card>
        </Fragment>
    )
}

export default QuestionsList
