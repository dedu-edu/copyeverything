
import React, { useEffect, useState } from "react"
import { useLocation } from 'react-router-dom';
import { Row } from 'reactstrap'

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import { transliterate } from "@src/utility/Utils";

// ** Styles
import './style.scss'

export default function Sum()
{
    const location = useLocation()
    const data = location.state.data
    const listArr = location.state.signatureData

    // State
    const [ datas, setDatas ] = useState({})

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    // Api
    const studentApi = useApi().student

    function getAllData()
    {
        if (data)
        {
            Promise.all([
                fetchData(studentApi.definition.getSum(data)),
            ]).then((values) => {
                setDatas(values[0]?.data)
            })
        }
    }

    function imageLoaded()
    {
        if (Object.keys(datas).length != 0)
        {
            // setTimeout(() => window.print(), 1000)
        }
    }

    useEffect(
        () =>
        {
            getAllData();
        },
        []
    )

    useEffect(
        () =>
        {
            window.onafterprint = function()
            {
                // window.history.go(-1);
            }
        },
        []
    )

    const cyrillicToLatinMap = {
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'Ye', 'Ё': 'Yo', 'Ж': 'J',
        'З': 'Z', 'И': 'I', 'Й': 'I', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
        'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
        'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'I', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
        'Я': 'Ya', 'Ө' : 'U', "Ү" : "U",
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'ye', 'ё': 'yo', 'ж': 'j',
        'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya', 'ө' : 'u', "ү" : "u",
    };

    // Function to transliterate Cyrillic to Latin
    const transliterateCyrillicToLatin = (text) => {
        return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
    };

    const logo = require("@src/assets/images/logo/dxis_logo.png").default

    return (
        <>
            <div className='fontchange ps-1' >
            {
                data && datas?.score
                ?
                <>
                    {isLoading && Loader}
                    <div className='d-flex flex-column justify-content-center align-items-center w-100 mt-3' style={{ fontSize: '14px' }} >
                        <img className="fallback-logo" width={100} height={100} src={logo} alt="logo" onLoad={imageLoaded} />
                        <div className="d-flex flex-column text-center fw-bolder">
                            <span className='mt-1 text-uppercase'>
                                Дотоод хэргийн их сургууль
                            </span>
                            <span style={{ marginTop: '6px' }} className="text-uppercase">
                                University of internal affairs, mongolia
                            </span>
                        </div>
                    </div>
                    <Row className="pb-2 ps-3 pe-2 pt-1" style={{ fontSize: '14px' }} >
                    <div style={{ borderBottom: '1px solid gray' }} />
                        <div className="text-center mt-1">
                            {datas?.school?.address ? datas?.school?.address : 'Баянзүрх дүүрэг, VIII хороо Хилчний гудамж, ш/х - 210332, Улаанбаатар хот'}
                            {datas?.school?.home_phone && `Факс: ${datas?.school?.home_phone}`}
                            <div>{datas?.school?.email && `E-mail: ${datas?.school?.email}`}</div>
                        </div>
                        <div className="text-center fst-italic">
                            _______________________________№_______________________________
                        </div>

                        <div className="text-center mt-3 fw-bolder fs-3">
                            DEFINITION
                        </div>

                        <div className="mt-50 d-flex justify-content-center">
                            <div className="text-center" style={{ maxWidth: 720 }}>
                                {
                                    data.all_year
                                    ?
                                        <span>
                                            <span>{transliterateCyrillicToLatin(datas?.student?.first_name?.toUpperCase())} {transliterateCyrillicToLatin(datas?.student?.last_name?.toUpperCase())}</span> /{transliterate(datas?.student?.register_num?.slice(0, -8))}{datas?.student?.register_num.slice(-8)}/ is studying in the program
                                            <br/>
                                            <span>
                                                with an average grade of {datas?.score?.gpa}.
                                            </span>
                                        </span>
                                    :
                                        <span>
                                            <span className="text-uppercase fw-bolder">
                                                {datas?.student?.first_name}
                                            </span> <span className="text-uppercase fw-bolder">{datas?.student?.last_name} /{datas?.student?.register_num}/</span>  is studying in the {datas?.student?.group?.profession?.name_eng} program
                                            <br/>
                                            with an average grade of {datas?.score?.gpa}
                                            <span>
                                                {
                                                    datas?.season_name ? ` in the ${datas?.season_name_eng }` : ''
                                                }
                                            </span> semester of the {data?.year_value} academic year.
                                        </span>
                                }
                            </div>
                        </div>

                        <div className="mt-3 d-flex justify-content-center">
                            {
                                listArr.map((val, idx) =>
                                {
                                    return (
                                        <div key={idx} className="d-flex flex-column me-2 mt-50">
                                            <p key={idx} className="text-uppercase text-end">
                                                <span style={{textWrap: 'wrap'}} className=" text-uppercase"></span>{val?.position_name_eng}
                                            </p>
                                            <span className="text-end">.............................../{val?.last_name_eng?.substring(0, 1)}.{val?.first_name_eng}/</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </Row>
                </>
                :
                <p>Sorry. No data</p>
            }
            </div>
        </>
    )
}
