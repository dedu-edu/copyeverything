import { element } from "prop-types";
import { lazy } from "react";

const Remote = lazy(() => import("@views/RemoteLesson"))
const Lesson = lazy(() => import("@views/RemoteLesson/Lesson"))
const AttendenceList = lazy(() => import("@views/AttendenceList"))
const AttendenceReport = lazy(() => import("@views/AttendenceReport"))
const StudentList = lazy(() => import("@views/AttendenceStudent"))
const AttendenceOnline = lazy(() => import("@views/AttendenceOnline"))
const RemoteRoutes = [
    {
        path: 'remote_lesson',
        element: <Remote />
    },
    {
        path: 'remote_lesson/:id',
        element: <Lesson />
    },
    {
        path: 'attendence/list/',
        element: <AttendenceList />
    },
    {
        path: 'attendence/report/',
        element: <AttendenceReport />
    },
    {
        path:'attendence/student',
        element:<StudentList/>
    },
    {
        path:'attendence/online',
        element:<AttendenceOnline/>
    }
]

export default RemoteRoutes
