// ** Icons Import
import { Circle } from 'react-feather'

import { MdPayment } from 'react-icons/md'

export default [
    {
        id: 'studypayment',
        title: 'Төлбөр',
        icon: <MdPayment size={20} />,
        navLink: "/studypayment",
        navChildren: [
            {
                id: 'studypayment0',
                title: 'Систем ашиглалтын төлбөр',
                icon: <Circle size={8} />,
                navLink: "studypayment/system/"
            },
            // {
            //     id: 'studypayment1',
            //     title: 'Төлбөрийн тохиргоо',
            //     icon: <Circle size={8} />,
            //     navLink: "studypayment/settings/"
            // },
            // {
            //     id: 'studypayment2',
            //     title: 'Төлбөрийн гүйлгээ',
            //     icon: <Circle size={8} />,
            //     navLink: "studypayment/transactions/"
            // },
            // {
            //     id: 'studypayment3',
            //     title: 'Төлбөрийн эхний үлдэгдэл',
            //     icon: <Circle size={8} />,
            //     navLink: "studypayment/start-balance/"
            // },
            // {
            //     id: 'studypayment5',
            //     title: 'Төлбөрийн хөнгөлөлт',
            //     icon: <Circle size={8} />,
            //     navLink: "studypayment/discount/"
            // },
            // {
            //     id: 'studypayment4',
            //     title: 'Төлбөрийн тооцоо',
            //     icon: <Circle size={8} />,
            //     navLink: "studypayment/bill/"
            // },
        ]
    }
]
