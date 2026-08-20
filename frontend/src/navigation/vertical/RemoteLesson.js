import React from "react";

import { Circle } from 'react-feather'
import { IoIosDesktop } from "react-icons/io";
import { AiOutlineSchedule } from "react-icons/ai";

const RemoteRoutes = [
    {
        id: "remotelesson",
        title: "Зайн сургалт",
        icon: <IoIosDesktop />,
        navLink: "/remote_lesson",
    },
    {
        id: 'attendence',
        title: 'Ирц бүртгэл',
        icon: <AiOutlineSchedule size={8} />,
        navLink: '/attendence',
        navChildren: [
            {
                id: 'attendence1',
                title: 'Жагсаалт',
                icon: <Circle size={8} />,
                navLink: 'attendence/list/',
            },
            {
                id: 'attendence2',
                title: 'Суралцагчийн ирцийн мэдээ',
                icon: <Circle size={8} />,
                navLink: 'attendence/report/',
            },
            {
                id: "attendence3",
                title: 'Оюутнаар',
                icon: <Circle size={8} />,
                navLink: 'attendence/student',
            },
            {
                id: "attendence4",
                title: 'Цахим сургалтын ирц',
                icon: <Circle size={8} />,
                navLink: 'attendence/online',
            }
        ]
    },
];

export default RemoteRoutes;
