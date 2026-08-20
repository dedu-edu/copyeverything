import { lazy } from "react";

const FaqGroup = lazy(() => import("@views/Faq/FaqGroup"))
const FaqRegister = lazy(() => import("@views/Faq/FaqRegister"))

const FaqRoutes = [
    {
        path: 'faq/group/',
        element: <FaqGroup />
    },
    {
        path: 'faq/register/',
        element: <FaqRegister />
    },
]

export default FaqRoutes
