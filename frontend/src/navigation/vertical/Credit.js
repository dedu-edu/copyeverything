import { Circle, Watch } from 'react-feather'

export default [
    {
        id: 'credit',
        title: 'Цагийн тооцоо',
        icon: <Watch size={20} />,
        navLink: "/credit",
        navChildren: [
            {
                id: 'credit1',
                title: 'Багц цагийн ногдол',
                icon: <Circle size={8} />,
                navLink: "credit/settings"
            },
            {
                id: 'credit2',
                title: 'Үр дүн',
                icon: <Circle size={8} />,
                navLink: "credit/a_estimation"
            },
            {
                id: 'credit3',
                title: 'Багш',
                icon: <Circle size={1} />,
                navLink: "credit/teacher_list"
            },
            // {
            //     id: 'credit5',
            //     title: 'А, Б, В, Г хүсэлтүүд',
            //     icon: <Circle size={1} />,
            //     navLink: "credit/estimation_req"
            // },
        ]
    }
]