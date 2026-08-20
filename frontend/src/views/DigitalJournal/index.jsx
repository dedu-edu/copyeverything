import { Fragment, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { Badge, Card, CardHeader, CardTitle, Col, Input, Label, Row, Table } from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import SchoolContext from '@src/utility/context/SchoolContext'
import { ReactSelectStyles } from '@utils'

import ParModal from './ParModal'
import styles from './styles.module.css'

// #region local utils
const range = (start, end) => {
    const elements = []
    for (let index = start; index <= end; index++) {
        elements.push(index)
    }
    return elements
}
// #endregion

// additional exports
export const irtsStates = [
    { id: 1, name: 'Ирсэн', color: 'primary' },
    { id: 2, name: 'Тас', color: 'danger' },
    { id: 3, name: 'Чөлөөтэй', color: 'warning' },
    { id: 4, name: 'Өвчтэй', color: 'info' }
]

export default function DigitalJournal() {
    // Simple variables
    const weeks = range(1, 20);

    // #region Other hooks
    // Context
    const { school_id } = useContext(SchoolContext)

    // Translate
    const { t } = useTranslation()

    // Main data list
    const [datas, setDatas] = useState([])

    // Selected options
    const [selected, setSelected] = useState()

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false })
    const { isLoading: isLoadingDepartment, fetchData: fetchDepartment } = useLoader({ isFullScreen: false })
    const { isLoading: isLoadingTeacher, fetchData: fetchTeacher } = useLoader({ isFullScreen: false })
    const { isLoading: isLoadingLesson, fetchData: fetchLesson } = useLoader({ isFullScreen: false })
    const { isLoading: isLoadingGroup, fetchData: fetchGroup } = useLoader({ isFullScreen: false })

    // Select option
    const [departmentOption, setDepartmentOption] = useState([])
    const [teacherOption, setTeacherOption] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [groupOption, setGroupOption] = useState([])

    // Par modal
    const [parModal, setParModal] = useState(null)

    // API
    const digitalJournalApi = useApi().digitalJournal
    const departmentApi = useApi().digitalJournal.department
    const teacherApi = useApi().digitalJournal.teacher
    const lessonApi = useApi().digitalJournal.lesson
    const groupApi = useApi().digitalJournal.group
    // #endregion

    // #region API calls
    /* Тэнхим дата авах функц */
    async function getDepartmentOption() {
        const { success, data } = await fetchDepartment(departmentApi.get(selected?.hasIrts))
        if (success) setDepartmentOption(data)
    }

    // Багшийн жагсаалт
    async function getTeacherOption() {
        const { success, data } = await fetchTeacher(teacherApi.get(selected?.hasIrts, selected?.department))
        if (success) setTeacherOption(data)
    }

    // // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchLesson(lessonApi.get(selected?.hasIrts, selected?.department, selected?.teacher))
        if (success) setLessonOption(data)
    }

    // // Анги бүлгийн жагсаалт
    async function getGroupOption() {
        const { success, data } = await fetchGroup(groupApi.get(selected?.hasIrts, selected?.department, selected?.teacher, selected?.lesson))
        if (success) setGroupOption(data)
    }

    /* Жагсаалтын дата авах функц */
    async function getDatas() {
        if (!selected?.lesson || !selected?.group) return
        const { success, data } = await fetchData(digitalJournalApi.get(selected?.lesson, selected?.group))
        if (success) setDatas(data)
    }
    // #endregion

    // #region useEffects
    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            getDatas()
        }, 600)

        return () => clearTimeout(timeoutId)
    }, [selected])

    // to get first options
    useEffect(() => {
        getDepartmentOption()
        getTeacherOption()
        getLessonOption()
        getGroupOption()
    }, [selected?.hasIrts, school_id])

    // to get further department options
    useEffect(() => {
        if (selected) {
            getTeacherOption()
            getLessonOption()
            getGroupOption()
        }
    }, [selected?.department])

    // to get further teacher options
    useEffect(() => {
        if (selected) {
            getLessonOption()
            getGroupOption()
        }
    }, [selected?.teacher])

    // to get further lesson options
    useEffect(() => {
        if (selected) {
            getGroupOption()
        }
    }, [selected?.lesson])
    // #endregion

    return (
        <Fragment>
            {isLoading && Loader}
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom m-auto'>
                    <CardTitle tag='h4'>{t('Цахим журнал')}</CardTitle>
                </CardHeader>
                <Row className='justify-content-start mx-0 mt-1'>
                    <Col md={3} sm={12}>
                        <Label>{t('Тэнхим')}</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            styles={ReactSelectStyles}
                            isLoading={isLoadingDepartment}
                            options={departmentOption || []}
                            placeholder={`-- ${t('Сонгоно уу')} --`}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setSelected((current) => {
                                    return {
                                        ...current,
                                        department: val?.cid ?? '',
                                        teacher: '',
                                        lesson: '',
                                        group: ''
                                    }
                                })
                            }}
                            getOptionValue={(option) => option.cid}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} sm={12}>
                        <Label>{t('Багш')}</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            styles={ReactSelectStyles}
                            isLoading={isLoadingTeacher}
                            options={teacherOption || []}
                            placeholder={`-- ${t('Сонгоно уу')} --`}
                            noOptionsMessage={() => t('Хоосон байна')}
                            value={selected?.teacher ? teacherOption.find((c) => c.cid === selected?.teacher) : ''}
                            onChange={(val) => {
                                setSelected((current) => {
                                    return {
                                        ...current,
                                        teacher: val?.cid ?? '',
                                        lesson: '',
                                        group: ''
                                    }
                                })
                            }}
                            getOptionValue={(option) => option.cid}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} sm={12}>
                        <Label>{t('Хичээл')}</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            styles={ReactSelectStyles}
                            isLoading={isLoadingLesson}
                            options={lessonOption || []}
                            placeholder={`-- ${t('Сонгоно уу')} --`}
                            noOptionsMessage={() => t('Хоосон байна')}
                            value={selected?.lesson ? lessonOption.find((c) => c.cid === selected?.lesson) : ''}
                            onChange={(val) => {
                                setSelected((current) => {
                                    return {
                                        ...current,
                                        lesson: val?.cid ?? '',
                                        group: ''
                                    }
                                })
                            }}
                            getOptionValue={(option) => option.cid}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} sm={12}>
                        <Label>{t('Анги')}</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            styles={ReactSelectStyles}
                            isLoading={isLoadingGroup}
                            options={groupOption || []}
                            placeholder={`-- ${t('Сонгоно уу')} --`}
                            noOptionsMessage={() => t('Хоосон байна')}
                            value={selected?.group ? groupOption.find((c) => c.cid === selected?.group) : ''}
                            onChange={(val) => {
                                setSelected((current) => {
                                    return {
                                        ...current,
                                        group: val?.cid ?? ''
                                    }
                                })
                            }}
                            getOptionValue={(option) => option.cid}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <div className='ms-2 mt-1'>
                    <Input
                        type='checkbox'
                        className='me-1'
                        id='hasIrts'
                        name={'hasIrts'}
                        checked={selected?.hasIrts ?? ''}
                        onChange={() => setSelected({ ...selected, hasIrts: !selected?.hasIrts })}
                    />
                    <Label className='form-check-label' for={'hasIrts'}>
                        {t('Ирц тэмдэглэгээтэй')}
                    </Label>
                </div>
                <div className='ms-auto mt-2'>
                    {irtsStates.map(({ name, color }, idx) => {
                        return (
                            <Badge key={idx} color={color} className='me-1 mt-25'>
                                {name}
                            </Badge>
                        )
                    })}
                </div>
                <Table bordered responsive className={`mt-1 ${styles.digitalJournalTable}`}>
                    <thead>
                        <tr>
                            <th rowSpan={2}>№</th>
                            <th rowSpan={2}>{t('Оюутан')}</th>
                            <th colSpan={weeks.length}>{t('Долоо хоног')}</th>
                        </tr>
                        <tr>
                            {weeks.map((weeksV, weeksI) => {
                                return <th key={weeksI}>{weeksV}</th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {datas.map((datasV, datasI) => {
                            return (
                                <tr key={datasI}>
                                    <th>{datasI + 1}</th>
                                    <td className='text-start'>
                                        <div style={{ fontWeight: 900 }}>
                                            {datasV.last_name.charAt(0).toUpperCase()}. {datasV.first_name}
                                        </div>
                                        <div>{datasV.code}</div>
                                    </td>
                                    {weeks.map((weeksV, weeksI) => {
                                        const irts = datasV.weeks[weeksV] ?? {}
                                        let className = ''
                                        const isIrts = Object.keys(irts).length > 0
                                        if (isIrts) className = 'cursor-pointer ' + styles.hoverBg

                                        return (
                                            <td
                                                key={weeksI}
                                                onClick={() =>
                                                    isIrts
                                                        ? setParModal({ studentId: datasV.student_id, lessonId: selected?.lesson, week: weeksV })
                                                        : null
                                                }
                                                className={className}
                                            >
                                                {irtsStates.map((irtsStatesV, irtsStatesI) => {
                                                    return irts[irtsStatesV.id] ? (
                                                        <Badge key={irtsStatesI} color={irtsStatesV.color} className='m-25'>
                                                            {irts[irtsStatesV.id]}
                                                        </Badge>
                                                    ) : null
                                                })}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </Card>
            {parModal && (
                <ParModal
                    open={parModal !== null}
                    cellData={parModal}
                    handleModal={() => {
                        setParModal(null)
                    }}
                />
            )}
        </Fragment>
    )
}
