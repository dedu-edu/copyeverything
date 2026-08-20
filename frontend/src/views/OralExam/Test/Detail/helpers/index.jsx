import { t } from 'i18next'
import React from 'react'
import { Eye } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap'

import { formatDate } from '@src/utility/Utils'

const AVG_SCORE = 2
const MAX_SCORE = 1

export function getColumns(currentPage, rowsPerPage, total_count, helpers_data, handleResultModal) {
    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: '№',
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: '30px',
            center: true
        },
        {
            name: <div className='text-center w-100'>{'Оюутны код'}</div>,
            selector: (row) => row?.code,
            minWidth: '100px',
            wrap: true
        },
        {
            name: <div className='text-center w-100'>{'Овог'}</div>,
            selector: (row) => row?.last_name,
            minWidth: '150px',
            wrap: true
        },
        {
            name: <div className='text-center w-100'>{'Нэр'}</div>,
            selector: (row) => row?.first_name,
            minWidth: '150px',
            wrap: true
        },
        {
            name: <div className='text-center w-100'>{'Анги'}</div>,
            selector: (row) => row?.group_name,
            minWidth: '150px',
            wrap: true
        },
        // {
        //     name: `${'Нийт оноо'}`,
        //     selector: (row) => row?.challenge[0]?.take_score,
        //     minWidth: '100px',
        //     wrap: true
        // },
        // {
        //     name: `${'Авч байгаа оноо'}`,
        //     selector: (row) => row?.challenge[0]?.still_score,
        //     minWidth: '100px',
        //     wrap: true
        // },
        {
            name: <div className='text-center w-100'>{'Авсан оноо'}</div>,
            selector: (row) => row?.challenge[0]?.score,
            minWidth: '100px',
            wrap: true
        },
        // {
        //     name: `${'Авсан оноо'}`,
        //     selector: (row) => {
        //         var student_score = 0
        //         if (row?.challenge?.length > 1 && helpers_data?.assess === AVG_SCORE) {
        //             student_score = (row?.challenge[0]?.score + row?.challenge[1]?.score) / row?.challenge?.length
        //         }

        //         if (helpers_data?.assess === MAX_SCORE) {
        //             student_score = row?.challenge[0]?.score
        //             if (row?.challenge?.length > 1) {
        //                 var max = row?.challenge[0]?.score
        //                 for (let i = 0; i < row?.challenge?.length; i++) {
        //                     if (max <= row?.challenge[i]?.score) {
        //                         max = row?.challenge[i]?.score
        //                     }
        //                 }
        //                 student_score = max
        //             }
        //         }
        //         return <div>{student_score}</div>
        //     },
        //     minWidth: '100px',
        //     wrap: true
        // },
        {
            name: <div className='text-center w-100'>{'Эхэлсэн хугацаа'}</div>,
            selector: (row) => (row?.challenge[0]?.start_time ? formatDate(row?.challenge[0]?.start_time, 'YYYY-MM-DD HH:mm:ss') : ''),
            minWidth: '100px',
            wrap: true
        },
        {
            name: <div className='text-center w-100'>{'Дуусгасан хугацаа'}</div>,
            selector: (row) => (row?.challenge[0]?.end_time ? formatDate(row?.challenge[0]?.end_time, 'YYYY-MM-DD HH:mm:ss') : ''),
            minWidth: '100px',
            wrap: true
        }
    ]
    // columns.push({
    //     name: `${t('Шалгалтын оролдлого')}`,
    //     selector: (row) => (
    //         <div className='text-center' style={{ width: 'auto' }}>
    //             {
    //                 <>
    //                     <a
    //                         role='button'
    //                         onClick={() => {
    //                             handleResultModal(row?.challenge[0])
    //                         }}
    //                         id={`complaintListDatatable${row?.challenge[0]?.id}`}
    //                         className='me-1'
    //                     >
    //                         <Badge color='light-info' pill>
    //                             <Eye width={'15px'} />
    //                         </Badge>
    //                     </a>
    //                     <UncontrolledTooltip placement='top' target={`complaintListDatatable${row?.challenge[0]?.id}`}>
    //                         Харах
    //                     </UncontrolledTooltip>
    //                 </>
    //             }
    //         </div>
    //     ),
    //     center: true,
    //     minWidth: '50px'
    // })
    return columns
}
