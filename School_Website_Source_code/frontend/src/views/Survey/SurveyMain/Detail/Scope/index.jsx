import React,{ useEffect, useRef, useState } from "react";
import { Badge, Tooltip, Row, UncontrolledTooltip } from "reactstrap";
import { AlertCircle } from "react-feather";
import '../detail.css'
import './scroll.css'
import {Avatar} from "@mui/material"

import StateCustomPagination from "./components/StateCustomPagination";
import useLoader from "@src/utility/hooks/useLoader";
import useApi from "@src/utility/hooks/useApi";


const SCOPE_KIND_ORG = 1
const SCOPE_KIND_SUBORG = 2
const SCOPE_KIND_SALBAR = 3
const SCOPE_KIND_POS = 4
const SCOPE_KIND_EMPLOYEE = 5
const SCOPE_KIND_USER = 6
const SCOPE_KIND_ALL = 7
const SCOPE_KIND_OYUTAN = 8
const SCOPE_KIND_PROFESSION = 9
const SCOPE_KIND_KURS = 10
const SCOPE_KIND_GROUP = 11

function Scope({ data }) {

    const toggle = (index) => {
        const newTooltipOpen = [...tooltipOpen];
        newTooltipOpen[index] = !newTooltipOpen[index];
        setTooltipOpen(newTooltipOpen);
    };

    // #region to paginate students list
    const [oyutans, setOyutans] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const limitOptions = [10, 25, 50, 75, 100, 'Бүгд']
    const [recordsLimit, setRecordsLimit] = useState(limitOptions[1])
    const surveyApi = useApi().survey
    const { Loader, isLoading, fetchData } = useLoader({});

    async function getNextPage() {
        const getApi = data.scope_kind?.id === SCOPE_KIND_OYUTAN ? surveyApi.detail.getStudents : surveyApi.detail.getTeachers

        const { success, data: apiResult } = await fetchData(getApi({
            limit: recordsLimit,
            page: currentPage
        }, data.id));

        if (success) {
            setOyutans(apiResult.results || [])
            setTotalCount(apiResult.count ?? 0)
        }
    }

    useEffect(() => { getNextPage() }, [])
    // #endregion

    const [tooltipOpen, setTooltipOpen] = useState(new Array(oyutans.length).fill(false));

    // if (!data || !data.length) {
    //     return (
    //         <Fragment>
    //             <Card className="cusheight d-flex justify-content-center align-items-center">
    //                 <Spinner
    //                     color="dark"
    //                     size=""
    //                 >
    //                         Түр хүлээнэ үү...
    //                 </Spinner>
    //             </Card>
    //         </Fragment>
    //     )
    // }
    function TeacherBadge() {
        return <Badge color="light-success" pill>Багш</Badge>;
    }

    function StudentBadge() {
        return <Badge color="light-info" pill>Оюутан</Badge>;
    }

    function AllBadge() {
        return <Badge color="light-warning" pill>Бүгд</Badge>
    }

    {/* Оюутангүй судалгаа гэж байхгүй ч ингээд байж байвал зүгээр байх */}
    if(data?.scope_kind?.id === SCOPE_KIND_ALL)
        {return(
            <div className="d-flex flex-column align-items-center border w-75 rounded-4">
                <div className="pt-2 mb-2"><b>Хамрах хүрээ</b>
                    <AllBadge />
                </div>
            </div>
        )}
            else if(oyutans?.length < 1){
                return (
                    <div className="d-flex justify-content-center">
                        <Badge color="light-danger" className="p-1 rounded-5 text-wrap"> <AlertCircle/> Хамрах хүрээнд сонгогдсон хүн байхгүй байна</Badge>
                    </div>
                )
            }

    return(
        // <div className="d-flex align-items-center border w-75 rounded-4 customscroll" style={{ maxHeight: '800px', overflow: 'scroll' }}>

        <div className="d-flex flex-column align-items-center border w-75 rounded-4 scopescroll">
            <div className="pt-2 mb-2"><b>Хамрах хүрээ</b>
                {data.scope_kind?.id === SCOPE_KIND_OYUTAN && (
                    <StudentBadge />
                )}
                {data.scope_kind?.id === SCOPE_KIND_EMPLOYEE && (
                    <TeacherBadge />
                )}
            </div>
            {isLoading && Loader}
            <StateCustomPagination
                refreshDatas={getNextPage}
                current_page={currentPage}
                setParentStatePage={setCurrentPage}
                totalCount={totalCount || 0}
                limitOptions={limitOptions}
                rows_per_page={recordsLimit}
                setParentStateLimit={setRecordsLimit}
            />
            <div className="d-flex flex-wrap align-items-center  customscroll">
                {oyutans.map((data, idx) => (
                        <div className="m-1 border-bottom rounded-5 shadow-sm p-1 cancelcursor d-flex align-items-center z-0" key={idx} id={`TooltipExample-${idx}`} href="#">

                            <UncontrolledTooltip
                                placement="top"
                                target={`TooltipExample-${idx}`}
                                style={{ padding: '10px', paddingLeft: '30px', paddingRight: '30px' }}

                            >
                                <Row>
                                    {data.last_name} {data.first_name}
                                </Row>
                                <Row>
                                    {data.code}
                                </Row>
                            </UncontrolledTooltip>
                            {data.image === null ? (
                            <>
                                <Avatar >{data?.last_name?.slice(0, 1) + data?.first_name?.slice(0, 1)}</Avatar>
                            </>
                            ) : (
                            <Avatar alt={data?.last_name?.slice(0, 1) + data?.first_name?.slice(0, 1)} src={data.image} />
                        )}

                    </div>
                ))}
            </div>
        </div>
    )
}

export default Scope
