import React, { useContext, useEffect, useMemo, useState } from 'react';

import {
    Badge,
    Card,
    CardHeader,
    CardTitle,
    Col,
    Input,
    Label,
    Row,
    UncontrolledTooltip,
    Button,
    CardBody,
    Alert
} from 'reactstrap';

import { Edit, Plus, ChevronsLeft, Eye } from 'react-feather';
import { useTranslation } from 'react-i18next';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination } from '@src/utility/Utils';
import AuthContext from '@context/AuthContext'

import './style.css';
import Modal from './Modal';
import useModal from '@hooks/useModal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const Detail = () => {
	const { user } = useContext(AuthContext)

    const { t } = useTranslation()
    const { showWarning } = useModal()

    const location = useLocation()
    const userDetail = location.state?.data
    const is_department = location.state?.is_department // Тэнхимийн эрхлэгч эсэх

    const { id } = useParams()

    // states
    const [name_options, setNameOptions] = useState([])
    const [fileModal, setFileModal] = useState(false)
    const [seeModal, setSeeModal] = useState(false)
    const [files, setFiles] = useState([])

    const [name_current_page, setNameCurrentPage] = useState(1)
    const [name_rows_per_page, setNameRowsPerPage] = useState(50)
    const [name_total_count, setNameTotalCount] = useState(1)
    const [rowData, setRowData] = useState({})
    const [totalCount, setTotalCount] = useState(userDetail?.total_count)

    const configApi = useApi().science.settings
    const { isLoading, fetchData, Loader } = useLoader({})
    const default_page = [5, 10, 15, 50, 75, 100]

    const navigate = useNavigate()

    // for custom table
    let prevGroup = null;

    // #region name
    function handleNamePerPage(e) {
        setNameRowsPerPage(e.target.value)
    }

    const handleNamePagination = (page) => {
        setNameCurrentPage(page.selected + 1);
    };

    // const handleFileModal = (row) => {
    //     setId(row?.id)
    //     setRowData(row)
    //     setFileModal(!fileModal)
    // }

    const handleSeeModal = (data, rowData) => {
        setFiles(data)
        setRowData(rowData)
        setSeeModal(!seeModal)
        if (seeModal) {
            getNameOptions()
        }
    }

    const getNameOptions = async () => {
        if (id){
            const { success, data } = await fetchData(configApi.get(name_rows_per_page, name_current_page, id))
            if (success) {
                const { cdata, total_count } = data
                setNameOptions(cdata?.results)
                setNameTotalCount(cdata?.count)
                setTotalCount(total_count)
            }
        }
    }
    // #endregion
    useEffect(() => {
        getNameOptions()
    }, [name_current_page, name_rows_per_page])

    // for custom table
    const getGroupCounts = (data) => {
        const counts = {};

        data.forEach((item) => {
            counts[item.category.id] = (counts[item.category.id] || 0) + 1;
        });

        return counts;
    }

    return (
        <>
            {isLoading && Loader}
            <Card>
                <div role="button" style={{fontSize: "15px"}} onClick={() => navigate('/research/b-estimate')}>
                    <ChevronsLeft/>{t('Буцах')}
                </div>
                <div className='d-flex justify-content-start p-1'>
                    <div className=''>
                        <div>
                            <span>Овог, нэр: <span className='fw-bolder'>{userDetail?.last_name} {userDetail?.first_name}</span></span>
                        </div>
                        <div>
                            <span>Сургууль: <span className='fw-bolder'>{userDetail?.school_name}</span></span>
                        </div>
                        <div>
                            <span>Тэнхим: <span className='fw-bolder'>{userDetail?.salbar_name}</span></span>
                        </div>
                        <div>
                            <span>Албан тушаал: <span className='fw-bolder'>{userDetail?.org_position}</span></span>
                        </div>
                    </div>
                    <div style={{marginLeft: '500px'}}>
                        <div>
                            <span>Биелүүлэх оноо: <span className='fw-bolder'>{userDetail?.norm}</span></span>
                        </div>
                        <div>
                            <span>Хуримтлагдсан оноо: <span className='fw-bolder'>{userDetail?.science_score}</span></span>
                        </div>
                        <div>
                            <span>Өөрийн үнэлгээний оноо: <span className='fw-bolder'>{userDetail?.not_total_count}</span></span>
                        </div>
                        <div>
                            <span>Батлагдсан оноо: <span className='fw-bolder'>{totalCount}</span></span>
                        </div>
                        <div>
                            <span>Нийт оноо: <span className='fw-bolder'>{totalCount + userDetail?.science_score}</span></span>
                        </div>
                    </div>
                </div>
                <Row className='mt-50'>
                    <Col style={{ overflow: 'auto' }}>
                        <Row>
                            <Col>
                                <table className='react-dataTable customTable'>
                                    <thead className='rdt_TableHead'>
                                        <tr align="center" className='rdt_TableHeadRow'>
                                            <th className='rdt_TableCol' rowSpan="2" width='50px'>{t('№')}</th>
                                            <th className='rdt_TableCol' rowSpan="2" width='300px'>{t('Үзүүлэлт')}</th>
                                            <th className='rdt_TableCol' rowSpan="2" width='20px'></th>
                                            <th className='rdt_TableCol' rowSpan="2" width='200px'>{t('Дэд үзүүлэлт')}</th>
                                            <th className='rdt_TableCol' rowSpan="2" width='100px'>{t('Оноо')}</th>
                                            <th className='rdt_TableCol' rowSpan="2" width='50px'>{t('Тоо')}</th>
                                            <th className='rdt_TableCol' rowSpan="2" width='80px'>{t('Нийт оноо')}</th>
                                            <th className='rdt_TableCol' rowSpan="2" width='50px'>Файл харах</th>
                                            <th className='rdt_TableCol' colSpan="6" width='400px'>{t('Шинжлэх ухаан, тенологийн газрын баталгаажуулалт')}</th>
                                        </tr>
                                        <tr align="center" className='rdt_TableHeadRow'>
                                            <th className='rdt_TableCol' width='20px' align="center">{t('Тооцсон тоо')}</th>
                                            <th className='rdt_TableCol' width='20px' align="center">{t('Тооцсон оноо')}</th>
                                            <th className='rdt_TableCol' width='50px' align="center">{t('Төлөв')}</th>
                                            <th className='rdt_TableCol' width='310px' align="center">{t('Тайлбар')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className='rdt_TableBody'>
                                        {name_options.reduce((acc, item) => {
                                            if (acc.lastGroup !== item.category?.id) {
                                                acc.groupIndex++;
                                            }

                                            item.groupIndex = acc.groupIndex;
                                            acc.result.push(item);
                                            acc.lastGroup = item?.category?.id;

                                            return acc;
                                        }, { result: [], groupIndex: 0, lastGroup: null }).result.map((row, index) => {
                                            const isFirstInGroup = row.category.id !== prevGroup;
                                            prevGroup = row?.category.id;

                                            return (
                                                <tr key={row.id} className='rdt_TableRow'>
                                                    {isFirstInGroup ? (
                                                        <>
                                                            <td
                                                                rowSpan={getGroupCounts(name_options)[row.category.id]}
                                                                valign='middle'
                                                                align='center'
                                                            >
                                                                {row.category?.order_no}
                                                            </td>
                                                            <td
                                                                rowSpan={getGroupCounts(name_options)[row.category.id]}
                                                                valign='middle'
                                                                align='center'
                                                            >
                                                                {row?.category?.name}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <></>
                                                    )}
                                                    <td align='center'>{row?.order_no}</td>
                                                    <td>{row?.name}</td>
                                                    <td align='center'>{row?.score}</td>
                                                    <td align='center'>
                                                        {row?.count?.file_count}
                                                    </td>
                                                    <td align='center'>
                                                        {row?.count?.file_count * row?.score}
                                                    </td>
                                                    <td align='center'>
                                                        <a
                                                            role='button'
                                                            className='ms-1'
                                                            onClick={() => handleSeeModal(row?.files, row)}
                                                            id={`complaintListDatatableViewName${row?.id}`}
                                                        >
                                                            <Badge color="light-success" pill><Eye width={"15px"} /></Badge>
                                                        </a>
                                                        <UncontrolledTooltip placement='top' target={`complaintListDatatableViewName${row.id}`} >{t('Харах')}</UncontrolledTooltip>
                                                    </td>
                                                    <td align='center'>
                                                        {row?.science_count?.success_count}
                                                    </td>
                                                    <td align='center'>
                                                        {row?.score * row?.science_count?.success_count}
                                                    </td>
                                                    <td align='center' >
                                                        {
                                                            row?.science_count?.is_check
                                                            ?
                                                            <Badge color='success'>Шалгасан</Badge>
                                                            :
                                                            (row?.science_count?.success_count > 0 || row?.science_count?.reject_count > 0)
                                                            ?
                                                            <Badge color='warning'>Дутуу</Badge>
                                                            :
                                                            <Badge color='warning'>Шалгаагүй</Badge>
                                                        }
                                                    </td>
                                                    <td align='left'>
                                                        {
                                                            row?.science_desc?.map((c, didx) =>
                                                                <p key={didx}>
                                                                    {c}
                                                                </p>
                                                            )
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Row className='mt-1'>
                                    <Col sm='auto'>
                                        <Input
                                            type='select'
                                            bsSize='sm'
                                            style={{ height: "30px", width: "70px" }}
                                            value={name_rows_per_page}
                                            onChange={e => handleNamePerPage(e)}
                                        >
                                            {
                                                default_page.map((page, idx) => (
                                                    <option
                                                        key={idx}
                                                        value={page}
                                                    >
                                                        {page}
                                                    </option>
                                                ))}
                                        </Input>
                                    </Col>
                                    <Col>
                                        <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                {getPagination(handleNamePagination, name_current_page, name_rows_per_page, name_total_count)()}
                            </Col>
                        </Row>
                    </Col>
                    {
                        seeModal && <Modal isOpen={seeModal} handleModal={handleSeeModal} files={files} refresh={getNameOptions} is_department={is_department} user={user} rowData={rowData}/>
                    }
                </Row>
            </Card>
        </>
    )
}

export default Detail;
