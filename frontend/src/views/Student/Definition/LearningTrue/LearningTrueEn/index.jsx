
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next";
import { Row } from 'reactstrap'

import useLoader from '@hooks/useLoader';
import PrintError from "@src/components/PrintError";
import { transliterate } from "@src/utility/Utils";

import './style.css'

function getSessionJson(key, fallbackValue = null) {
    try {
        const value = sessionStorage.getItem(key)
        return value ? JSON.parse(value) : fallbackValue
    } catch (error) {
        return fallbackValue
    }
}

export default function LearningTrueEn()
{
    const logo = require("@src/assets/images/logo/dxis_logo.png").default

    const searchParams = new URLSearchParams(window.location.search)
    const storageKey = searchParams.get('key')
    const datas = storageKey ? getSessionJson(storageKey) : getSessionJson("student_data")
    const listArr = (storageKey
        ? getSessionJson(`${storageKey}_signature`, [])
        : getSessionJson("signature_data", [])) || []

    // const studentId = datas["id"]
    const { t } = useTranslation()
    const { i18n } = useTranslation()
    const today = new Date()

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

       // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

      const getOrdinal = (number) => {
        const suffixes = ["th", "st", "nd", "rd"];
        const v = number % 100;
        return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
      };

      // Function to transliterate Cyrillic to Latin
      const transliterateCyrillicToLatin = (text) => {
        return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
      };

    useEffect(
        () =>
        {
            i18n.changeLanguage("en")
            window.onafterprint = function()
            {
                // window.close()
                // sessionStorage.removeItem("student_data")
                // sessionStorage.removeItem("signature_data")
            }
        },
        []
    )

    function imageLoaded()
    {
        if (Object.keys(datas).length != 0)
        {
            // setTimeout(() => window.print(), 1000)
        }
    }

    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    if(datas) {
        return (
            <>
        <div className='ps-5 pe-4 d-flex flex-column justify-content-center align-items-center fontchange'>
                {
                    Object.keys(datas).length > 0
                    ?
                    <>
                        {isLoading && Loader}
                        <div className='d-flex flex-column justify-content-center align-items-center w-100 mt-3' style={{ fontSize: '14px' }} >
                            <img className="fallback-logo" width={100} height={100} src={logo} alt="logo" onLoad={imageLoaded} />
                            <div className="d-flex flex-column text-center fw-bolder">
                                {/* <span className='mt-1'>
                                    {datas?.school_data?.name?.toUpperCase()}
                                </span> */}
                                {/* <span style={{ marginTop: '6px' }}>{datas?.school_data?.name_eng.toUpperCase()}</span> */}
                                <span style={{ marginTop: '6px' }} className="text-uppercase">
                                    {/* {datas?.school_data?.name_eng?.toUpperCase()} */}
                                    University of internal affairs, mongolia
                                </span>
                            </div>
                        </div>
                        <Row className="pb-2 ps-1 pe-3 pt-1" style={{ fontSize: '14px' }} >
                            <div className="text-center mt-1">
                                {datas?.school?.address ? datas?.school?.address : 'Баянзүрх дүүрэг, VIII хороо Хилчний гудамж, ш/х - 210332, Улаанбаатар хот'}
                                <div>{datas?.school_data?.social && `E-mail: ${datas?.school_data?.social}`}</div>
                            </div>
                            <div className="text-center fst-italic">
                                _______________________________№_______________________________
                            </div>
                            <div className="text-center mt-50 fw-bolder fs-4 mb-50">
                                Date: { today.toLocaleDateString()}
                            </div>
                            <div className="text-center mt-1 fw-bolder fs-3">
                                CERTIFICATE OF STUDENT STATUS
                            </div>

                            <div className="text-center mt-2">
                            {
                                datas?.status_code == 1
                                ?
                                <span>
                                    This is to confirm that, <span>{transliterateCyrillicToLatin(datas?.first_name?.toUpperCase())} {transliterateCyrillicToLatin(datas?.last_name?.toUpperCase())}</span> /{transliterate(datas?.register_num?.slice(0, -8))}{datas?.register_num.slice(-8)}/ is a {getOrdinal(datas?.group_level)} year student of {datas?.profession_eng_name} program for the academic year of {datas?.group_join_year}.
                                </span>

                                :
                                    datas?.status_code == 5
                                    ?
                                    `${datas?.code}: ${transliterateCyrillicToLatin(datas?.first_name)} ${transliterateCyrillicToLatin(datas?.last_name)} has successfully completed the ${datas?.degree_name} program at MSU. Their studies, specializing in ${datas?.group_name}, were conducted from ${datas?.group_join_year?.substring(0, 4)} to ${datas?.graduation_work ? datas?.graduation_work?.diplom_num?.substring(datas?.graduation_work?.diplom_num?.length - 4 ) : '2024'}. They have been verified to have completed their degree, obtaining diploma number ${datas?.graduation_work?.diplom_num}.`

                                    :
                                    `This document certifies that ${transliterateCyrillicToLatin(datas?.first_name)} ${transliterateCyrillicToLatin(datas?.last_name)}, identified by the code /${datas?.code} /, is ${t(datas?.status_name_eng?.toLowerCase())}. This certification is issued in accordance with university records and policies.`

                            }
                            </div>

                            {/* <div className="text-center mt-3 text-uppercase">
                                {
                                    listArr.map((val, idx) =>
                                    {
                                        return (
                                            <p key={idx} >
                                                {val?.position_name_eng}: ........................................... /{val?.last_name_eng?.substring(0, 1)}.{val?.first_name_eng}/
                                            </p>
                                        )
                                    })
                                }
                            </div> */}
                            <div className="mt-2 d-flex justify-content-center">
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
                    <p>Sorry, no information found</p>
                }
            </div>
            </>
        )
    } else {
        return(
            <PrintError/>
        )
    }
}
