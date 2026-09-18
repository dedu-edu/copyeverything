import { Circle, HelpCircle } from "react-feather"

export default [
    {
        id: "faq",
        title: "Нийтлэг асуулт хариулт",
        icon: <HelpCircle size={20} />,
        navLink: "/faq",
        navChildren: [
            {
                id: 'faq1',
                title: 'Асуултын бүлэг',
                icon: <Circle size={8} />,
                navLink: "faq/group"
            },
            {
                id: 'faq2',
                title: 'Бүртгэл',
                icon: <Circle size={8} />,
                navLink: "faq/register"
            },
        ]
    },
]
