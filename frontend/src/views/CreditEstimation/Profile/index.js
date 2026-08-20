import useApi from '@hooks/useApi';
import classnames from 'classnames';
import { Fragment, useEffect, useState,lazy,Suspense } from 'react';
import { useParams } from 'react-router-dom';
import {Card, CardBody, Col, Nav, NavItem, NavLink, Row, TabContent,TabPane, CardHeader,Table } from 'reactstrap';
import {Spinner} from 'reactstrap';
import { ChevronsLeft } from 'react-feather'
import { useNavigate } from 'react-router-dom'

const ACredit = lazy(() => import('./AEstimationID'))
const BTeacherFileList = lazy(() => import('./BEstimationID/BTeacherFileList'))
const WTeacherFileList = lazy(() => import('./WEstimationID/WTeacherFileList'))
const GTeacherFileList = lazy(() => import('./GEstimationID/GTeacherFileList'))

const Profile = () => {
    const { id } = useParams();
    if (!id) return 0
    const [teacher, setTeacher] = useState([]);
    const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || '1')
    const [total_a_score, setAScore] = useState()

    const [brefresh,setBrefresh] = useState(false)
    const [wrefresh,setWrefresh] = useState(false)
    const [grefresh,setGrefresh] = useState(false)
	const navigate = useNavigate()

    const toggle = tab => {
        if (activeTab !== tab) {
        setActiveTab(tab)
        localStorage.setItem('activeTab', tab)
        }
    }

    const BApi = useApi(true).b_time;

     const getTeacher = async () => {
        if (!id) return;
        const { success, data } = await BApi.list.getOne(id);
        if (success) setTeacher(data);
    };

    useEffect(() => {
        getTeacher();
    }, [id, brefresh]);
    return (
        <Fragment>
        <Card className='b-color'>
            <CardBody>
                <Row className="m-0 flex-col">
                    <Col md  className="m-0 p-0 soft-border">
                        <div className="header-gradient">
                            Багшийн мэдээлэл
                        </div>
                        <div className='p-1 fw-bold'>
                            <Table className="table table-sm table-bordered">
                                <tbody>
                                <tr>
                                    <td>Багш:</td>
                                    <td>{teacher?.full_name}, {teacher?.email}</td>
                                </tr>
                                <tr>
                                    <td>Сургууль:</td>
                                    <td>{teacher?.school_name}</td>
                                </tr>
                                <tr>
                                    <td>Тэнхим:</td>
                                    <td>{teacher?.salbar_name}</td>
                                </tr>
                                <tr>
                                    <td>Албан тушаал:</td>
                                    <td>{teacher?.org_position}</td>
                                </tr>
                                <tr>
                                    <td>Ногдол тооцох:</td>
                                    <td>{teacher?.norm?.desc}</td>
                                </tr>
                                <tr>
                                    <td>Багшийн албан тушаал зэрэглэл:</td>
                                    <td>{teacher.teacher_rank_type}</td>
                                </tr>
                                </tbody>
                            </Table>
                        </div>
                        </Col>
                        <Col md  className="p-0 soft-border">
                            <div className="header-gradient">
                                Цагийн тооцоо
                            </div>
                            <div className='p-1'>
                                <div>
                                    <span>Тооцох норм (нийт): </span>
                                    <span>
                                        {teacher?.norm?.total}
                                    </span>
                                </div>

                                <div>
                                    <span>Нийт батлагдсан багц цаг: </span>
                                    <span>
                                        {(
                                        (teacher?.total_b_approve_score || 0) +
                                        (teacher?.total_w_approve_score || 0) +
                                        (teacher?.total_g_approve_score || 0)
                                        + (teacher?.total_a_approve_score || 0)
                                        ).toFixed(1)}
                                    </span>
                                    </div>

                                    <div>
                                    <span>
                                        {(
                                        (teacher?.norm?.A_time || 0) +
                                        (teacher?.norm?.B_time || 0) +
                                        (teacher?.norm?.W_time || 0) +
                                        (teacher?.norm?.G_time || 0)
                                        )
                                        ===
                                        (
                                        (teacher?.total_b_approve_score || 0) +
                                        (teacher?.total_w_approve_score || 0) +
                                        (teacher?.total_g_approve_score || 0)
                                        )
                                        ?
                                        " Батлагдсан цаг нийцэж байна"
                                        :
                                        " Батлагдсан цаг нийт нормтой таарахгүй"
                                        }
                                    </span>
                                </div>
                            </div>
                        <Table className="table table-sm table-bordered p-1 fw-bold text-center">
                            <thead className="table-light">
                                <tr>
                                <th>Багц цагууд</th>
                                <th>Норм</th>
                                <th>Гүйцэтгэсэн кредит</th>
                                <th>Зөрүү кредит</th>
                                <th>Батлагдсан</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>A цаг</td>
                                    <td>{teacher?.norm?.A_time || 0}</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td className="text-success">{total_a_score}</td>
                                </tr>
                                <tr>
                                    <td>Б цаг</td>
                                    <td>{teacher?.norm?.B_time || 0}</td>
                                    <td>{teacher?.total_b_score || 0}</td>
                                    <td>{teacher?.total_b_minus_score || 0}</td>
                                    <td className="text-success">{teacher?.total_b_approve_score || 0}</td>
                                </tr>

                                <tr>
                                    <td>В цаг</td>
                                    <td>{teacher?.norm?.W_time || 0}</td>
                                    <td>{teacher?.total_w_score || 0}</td>
                                    <td>{teacher?.total_w_minus_score || 0}</td>
                                    <td className="text-success">{teacher?.total_w_approve_score || 0}</td>
                                </tr>

                                <tr>
                                    <td>Г цаг</td>
                                    <td>{teacher?.norm?.G_time || 0}</td>
                                    <td>{teacher?.total_g_score || 0}</td>
                                    <td>{teacher?.total_g_minus_score || 0}</td>
                                    <td className="text-success">{teacher?.total_g_approve_score || 0}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            {/* </CardBody>
            <CardBody > */}
                <div className="cursor-pointer mt-50" onClick={() => navigate(`/credit/a_estimation`)}>
                    <ChevronsLeft /> Буцах
                </div>
            <Nav tabs className='m-0 mb-1'>
                <NavItem>
                    <NavLink className={classnames({ active: activeTab === '4' })} onClick={() => toggle('4')}>
                        А цаг
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink className={classnames({ active: activeTab === '1' })} onClick={() => toggle('1')}>
                        Б цаг
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink className={classnames({ active: activeTab === '2' })} onClick={() => toggle('2')}>
                        В цаг
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink className={classnames({ active: activeTab === '3' })} onClick={() => toggle('3')}>
                        Г цаг
                    </NavLink>
                </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    {teacher && (
                        <Suspense fallback={<Spinner color="primary" />}>
                            <BTeacherFileList teacher={teacher} setBrefresh={setBrefresh} brefresh={brefresh}/>
                        </Suspense>
                    )}
                </TabPane>

                <TabPane tabId="2">
                    {teacher && (
                        <Suspense fallback={<Spinner color="primary" />}>
                            <WTeacherFileList teacher={teacher} setWrefresh={setWrefresh} wrefresh={wrefresh}/>
                        </Suspense>
                    )}
                </TabPane>

                <TabPane tabId="3">
                    {teacher && (
                        <Suspense fallback={<Spinner color="primary" />}>
                            <GTeacherFileList teacher={teacher} setGrefresh={setGrefresh} grefresh={grefresh}/>
                        </Suspense>
                    )}
                </TabPane>

                <TabPane tabId="4">
                    {teacher && (
                        <Suspense fallback={<Spinner color="primary" />}>
                            <ACredit id={id} setGrefresh={setGrefresh} grefresh={grefresh} setAScore={setAScore}/>
                        </Suspense>
                    )}
                </TabPane>
            </TabContent>
            </CardBody>
        </Card>
        </Fragment>
    );
};

export default Profile;
