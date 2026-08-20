// ** React Imports
import { Fragment, useState, useEffect } from 'react'
import {
    Card,
    CardBody,
    CardTitle,
    Row,
    Col
 } from 'reactstrap'
import classnames from 'classnames'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useRTL } from '@hooks/useRTL'

// ** Calendar App Component Imports
import Calendar from './Calendar'
import SidebarLeft from './SidebarLeft'
import AddEventSidebar from './Add'
import SwiperFade from './SwiperFade';
import AccessHistory from './AccessHistory'

import '@styles/react/apps/app-calendar.scss'

import { VOLUNTEER_ACTION_TYPE } from '@utility/consts'

const CalendarComponent = () => {

    const blankEvent = {
        title: '',
        start: '',
        end: '',
    }

    const { fetchData } = useLoader({})

    // ** states
    const [addSidebarOpen, setAddSidebarOpen] = useState(false)
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
    const [datas, setDatas] = useState([])
    const [edit_id, setEditId] = useState('')
    const [is_new, setNew] = useState(false)
    const [searchChecked, setSearchChecked] = useState([])
    const [dates, setDates] = useState(blankEvent)
    const [active_week, setActiveWeek] = useState(1)

    const [datas1, setDatas1] = useState([])

    // ** Hooks
    const [isRtl] = useRTL()

    // Api
    const calendarListApi = useApi().calendar
    const calendarNewsApi = useApi().calendarNews

    // ** AddEventSidebar Toggle Function
    const handleAddEventSidebar = () => {
        setAddSidebarOpen(!addSidebarOpen)
        if (addSidebarOpen) {
            setEditId('')
        }
    }

    // ** LeftSidebar Toggle Function
    const toggleSidebar = val => setLeftSidebarOpen(val)

    async function getDatas()
    {
        const { success, data } = await fetchData(calendarListApi.get(searchChecked))
        if(success) {
            setActiveWeek(data?.active_week)

            if (data.datas) {

                var calendarDatas = data.datas

                calendarDatas.forEach(data => {
                    if (data.action_type == VOLUNTEER_ACTION_TYPE) {
                        data['title'] = 'ОНА' + ' ' + data?.title
                        data['color'] = '#e9ff70'
                    } else {
                        data['textColor'] = 'white'
                    }
                });

                setDatas(calendarDatas)
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[searchChecked])


    // Хуанли дах мэдээлэллийн хэсэг

    async function getDatas2()
    {
        const { success, data } = await fetchData(calendarNewsApi.get())
        if(success)
        {
            setDatas1(data)
        }
    }

    useEffect(
        () =>
        {
            getDatas2()
        },
        []
    )


    return (
        <Fragment>
            <div className='app-calendar overflow-hidden border'>
                <Row className='g-0'>
                    <Col
                        id='app-calendar-sidebar'
                        className={classnames('col app-calendar-sidebar flex-grow-0 overflow-hidden d-flex flex-column', {
                            show: leftSidebarOpen
                        })}
                    >
                        <SidebarLeft
                            toggleSidebar={toggleSidebar}
                            handleAddEventSidebar={handleAddEventSidebar}
                            searchValue={setSearchChecked}
                            setNew={setNew}
                            active_week={active_week}
                        />
                    </Col>
                    <Col className='position-relative'>
                        <Calendar
                            isRtl={isRtl}
                            toggleSidebar={toggleSidebar}
                            handleAddEventSidebar={handleAddEventSidebar}
                            eventDatas={datas}
                            setEditId={setEditId}
                            setNew={setNew}
                            blankEvent={blankEvent}
                            getDates={setDates}
                        />
                    </Col>

                    <Col lg="3" sm="9" className="m-2">
                        <Card className="text-center">
                            <CardBody>
                                <CardTitle tag="h3">
                                    Сүүлд нэмэгдсэн мэдээ, мэдээлэл
                                </CardTitle>
                                {datas1.length > 0 ? (
                                    <SwiperFade datas={datas1} />
                                ) : (
                                    <h5>Мэдээлэл байхгүй байна!</h5>
                                )}
                            </CardBody>
                        </Card>
                        <AccessHistory />
                    </Col>

                    <div
                        className={classnames('body-content-overlay', {
                            show: leftSidebarOpen === true
                        })}
                        onClick={() => toggleSidebar(false)}
                    ></div>
                </Row>
            </div>

            <AddEventSidebar
                open={addSidebarOpen}
                handleAddEventSidebar={handleAddEventSidebar}
                refreshDatas={getDatas}
                editId={edit_id}
                is_new={is_new}
                dates={dates}
            />
        </Fragment>
    )
}

export default CalendarComponent
