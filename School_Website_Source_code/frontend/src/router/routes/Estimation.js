import { lazy } from "react";

const Settings = lazy(() => import("@views/CreditEstimation/Settings"))
const AEstimation = lazy(() => import("@src/views/CreditEstimation/AEstimation/index"))
const TeacherList = lazy(() => import("@src/views/CreditEstimation/TeacherList"))
const Profile = lazy(() => import("@src/views/CreditEstimation/Profile/index"))
const EstimationRequests = lazy(() => import("@src/views/CreditEstimation/EstimationRequests/index"))

const CreditRoutes = [
    {
        path: 'credit/settings/',
        element: <Settings />
    },
    {
        path: 'credit/a_estimation/',
        element: <AEstimation />
    },
    {
        path: 'credit/teacher_list/',
        element: <TeacherList />,
    },
    {
        path: 'credit/profile/:id',
        element: <Profile />,
    },
    {
        path: 'credit/estimation_req/',
        element: <EstimationRequests />,
    },
]

export default CreditRoutes
