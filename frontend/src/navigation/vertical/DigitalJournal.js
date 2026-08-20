import { Circle } from 'react-feather'
import { FaBookOpen } from 'react-icons/fa'

export default [
    {
        id: 'digital-journal',
        title: 'Цахим журнал',
        icon: <FaBookOpen size={20} />,
        navChildren: [
            {
                id: 'digital-journal1',
                title: 'Цахим журнал',
                icon: <Circle size={8} />,
                navLink: '/digital-journal/'
            },
            {
                id: "teacher-journal",
                title: "Архив",
                icon: <Circle size={8} />,
                navLink: "/teacher/journal",
            },
        ]
    }
]
