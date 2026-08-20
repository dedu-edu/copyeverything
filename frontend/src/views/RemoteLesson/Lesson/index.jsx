import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { useEffect, useState } from 'react'
import { ChevronsLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { CiUser } from 'react-icons/ci'
import { PiCertificate, PiExam } from 'react-icons/pi'
import { useLocation, useParams } from 'react-router-dom'
import { Badge, Card, CardBody, CardHeader, CardTitle, Col, Input, Label, Row } from 'reactstrap'
import GroupStudentBlock from '../components/GroupStudentBlock'
import StudentListBlock from '../components/StudentListBlock'
import OnlineInfoBlock from '../components/OnlineInfoBlock'
import useApiCustom from '../hooks/useApiCustom'
import OnlineSubInfoDetailsBlock from '../components/OnlineSubInfoDetailsBlock'
import ScopeUserBlock from '../components/ScopeUserBlock'
import UserListBlock from '../components/StudentListBlock'
import moment from 'moment'


const SCOPE_STUDENT = 1
const SCOPE_USERS = 2

function Lesson() {
    // #region to paginate students in datatable
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total_count, setTotalCount] = useState(1);

    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    }
    // #endregion

    // #region to search students using text input in datatable
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        if (searchValue.length === 0) {
            refreshUsers()
        }
    }, [searchValue])
    // #endregion

    const { id } = useParams()
    const remoteApi = useApi().remote

    // #region to get Elearn basic data
    const location = useLocation()
    let elearnData = null
    let isLoadingElearn = false

    if (location.state) elearnData = location.state
    else {
        const getElearn = () => remoteApi.getOne(id)

        const { data: elearnDatas, isLoading: isLoadingElearnLocal } = useApiCustom({
            apiFunction: getElearn
        })

        elearnData = { selectedELearn: elearnDatas }
        isLoadingElearn = isLoadingElearnLocal
    }

    const { selectedELearn } = elearnData
    const { title, students, start_date, end_date, is_end_exam, is_certificate } = selectedELearn || {}
    // #endregion

    // #region API usage
    const [scope, setScope] = useState(SCOPE_STUDENT)

    function refreshUsers() {
        if (scope === SCOPE_STUDENT) setRefreshStudents(current => !current)
        if (scope === SCOPE_USERS) setRefreshUsersTrigger(current => !current)
    }

    // #region to get Elearn's students data
    const [refreshStudents, setRefreshStudents] = useState(false)

    const getStudents = () => remoteApi.students.get({
        limit: rowsPerPage,
        page: currentPage,
        search: searchValue,
        elearnId: id,
        sort: 'id',
    })

    const { data: studentsDatasOriginal, isLoading: isLoadingStudents } = useApiCustom({
        apiFunction: scope === SCOPE_STUDENT ? getStudents : null,
        deps: [refreshStudents, currentPage, rowsPerPage, scope]
    })

    useEffect(() => {
        setTotalCount(studentsDatasOriginal?.count)
    }, [studentsDatasOriginal])
    // #endregion

    // #region to get Elearn's users data
    const [refreshUsersTrigger, setRefreshUsersTrigger] = useState(false)

    const getUsers = () => remoteApi.users.get({
        limit: rowsPerPage,
        page: currentPage,
        search: searchValue,
        elearnId: id,
        sort: 'id',
    })

    const { data: usersDatasOriginal, isLoading: isLoadingUsers } = useApiCustom({
        apiFunction: scope === SCOPE_USERS ? getUsers : null,
        deps: [refreshUsersTrigger, currentPage, rowsPerPage, scope]
    })

    useEffect(() => {
        setTotalCount(usersDatasOriginal?.count)
    }, [usersDatasOriginal])
    // #endregion

    const usersDatas = scope === SCOPE_STUDENT ? studentsDatasOriginal?.results : usersDatasOriginal?.results

    // #region to get OnlineInfo data
    const [refreshOnlineInfo, setRefreshOnlineInfo] = useState(false)

    const getOnlineInfo = () => remoteApi.onlineInfo.get({
        elearnId: id,
        sort: 'id',
    })

    const { data: onlineInfoDatas, isLoading: isLoadingOnlineInfo } = useApiCustom({
        apiFunction: getOnlineInfo,
        deps: [refreshOnlineInfo]
    })
    // #endregion

    // #region to get OnlineSubInfo data
    const [refreshOnlineSubInfo, setRefreshOnlineSubInfo] = useState(false)

    const getOnlineSubInfo = () => remoteApi.onlineSubInfo.get({
        elearnId: id,
        sort: 'id'
    })

    const { data: onlineSubInfoDatas, isLoading: isLoadingOnlineSubInfo } = useApiCustom({
        apiFunction: getOnlineSubInfo,
        deps: [refreshOnlineSubInfo]
    })
    // #endregion
    // #endregion API usage

    const { isLoading: isLoadingGeneral, Loader, fetchData } = useLoader({});
    const isLoading = isLoadingGeneral || isLoadingStudents || isLoadingOnlineInfo || isLoadingOnlineSubInfo || isLoadingElearn || isLoadingUsers

    const { t } = useTranslation();

    // #region to act on OnlineSubInfo select
    const [selectedOnlineSubInfo, setSelectedOnlineSubInfo] = useState()

    function handleSelectOnlineSubInfo(onlineSubInfoData, onlineInfoTitle) {
        setSelectedOnlineSubInfo({ onlineSubInfoData: onlineSubInfoData, onlineInfoTitle: onlineInfoTitle })
    }
    // #endregion

    return (
        <>
            {isLoading && Loader}
            <a href='/remote_lesson' className='mb-1 fw-bold text-decoration-underline'><ChevronsLeft size={18} strokeWidth={2.5} /> {t('Буцах')}</a>
            <Row className='mt-2'>
                <Col>
                    <Card className='bg-white w-100'>
                        <CardBody>
                            <CardTitle tag="h4">{t("Сургалтын мэдээлэл")}</CardTitle>
                            <div>
                                <h2 className=''>{title}</h2>
                            </div>
                            <div>
                                <div className='d-flex justify-content-between'>
                                    <div>
                                        <div>
                                            <span>Эхлэх хугацаа: {start_date && moment(start_date).format('YYYY-MM-DD')}</span>
                                        </div>
                                        <div>
                                            <span>Дуусах хугацаа: {end_date && moment(end_date).format('YYYY-MM-DD')}</span>
                                        </div>
                                    </div>
                                    <p className="d-flex align-items-center justify-content-center fw-medium gap-1 mb-0">
                                        <Badge color='primary' pill title='Оюутны тоо' className='d-flex align-items-center gap-25' style={{ height: "24px" }}>
                                            <CiUser style={{ width: "12px", height: "12px" }} /> {students?.length || 0}
                                        </Badge>
                                        {is_end_exam && <Badge color={`light-success`} pill title={'Төгсөлтийн шалгалттай'} className='d-flex align-items-center gap-25'>
                                            <PiExam style={{ width: "24px", height: "24px" }} />
                                        </Badge>}
                                        {is_certificate && <Badge color={`light-danger`} pill title={'Сертификаттай'} className='d-flex align-items-center gap-25'>
                                            <PiCertificate style={{ width: "24px", height: "24px" }} />
                                        </Badge>}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col>
                    <Card xs={4} className="bg-white">
                        <CardHeader className="rounded border">
                            <CardTitle tag="h4">{t("Суралцагч нэмэх")}</CardTitle>
                        </CardHeader>
                        <CardBody className='mt-1'>
                            <Input
                                type="radio"
                                id='scope1'
                                name='scope'
                                onChange={(e) => setScope(SCOPE_STUDENT)}
                                value={SCOPE_STUDENT}
                                checked={scope === SCOPE_STUDENT}
                                className='me-1'
                            />
                            <Label htmlFor='scope1' className='me-2'>
                                {t('Оюутан')}
                            </Label>
                            <Input
                                type="radio"
                                id='scope2'
                                name='scope'
                                onChange={(e) => setScope(SCOPE_USERS)}
                                value={SCOPE_USERS}
                                checked={scope === SCOPE_USERS}
                                className='me-1'
                            />
                            <Label htmlFor='scope2'>
                                {t('Багш, Ажилтан')}
                            </Label>
                        </CardBody>
                        {
                            scope === SCOPE_STUDENT &&
                            <GroupStudentBlock
                                elearnId={id}
                                remoteApi={remoteApi}
                                t={t}
                                refreshData={() => refreshUsers()}
                            />
                        }
                        {
                            scope === SCOPE_USERS &&
                            <ScopeUserBlock
                                elearnId={id}
                                remoteApi={remoteApi}
                                refreshData={() => refreshUsers()}
                            />
                        }
                    </Card>
                </Col>
            </Row>
            {
                scope === SCOPE_STUDENT &&
                    <StudentListBlock
                        t={t}
                        datas={usersDatas}
                        getDatas={() => refreshUsers()}
                        setSearchValue={setSearchValue}
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        total_count={total_count}
                        handlePagination={handlePagination}
                        fetchData={fetchData}
                        remoteApi={remoteApi}
                        elearnId={id}
                    />
            }
            {
                scope === SCOPE_USERS &&
                    <UserListBlock
                        datas={usersDatas}
                        getDatas={() => refreshUsers()}
                        setSearchValue={setSearchValue}
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        total_count={total_count}
                        handlePagination={handlePagination}
                        fetchData={fetchData}
                        remoteApi={remoteApi}
                        elearnId={id}
                    />
            }
            <Row>
                <Col md={4}>
                    <OnlineInfoBlock
                        t={t}
                        datas={onlineInfoDatas}
                        getDatas={() => setRefreshOnlineInfo((current) => !current)}
                        onlineSubInfoDatas={onlineSubInfoDatas}
                        getOnlineSubInfoDatas={() => setRefreshOnlineSubInfo((current) => !current)}
                        elearnId={id}
                        handleSelectOnlineSubInfo={handleSelectOnlineSubInfo}
                        fetchData={fetchData}
                        remoteApi={remoteApi}
                    />
                </Col>
                <Col md={8}>
                    <OnlineSubInfoDetailsBlock
                        t={t}
                        selectedOnlineSubInfo={selectedOnlineSubInfo}
                    />
                </Col>
            </Row>
        </>
    )
}

export default Lesson
