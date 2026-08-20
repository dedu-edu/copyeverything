import { lazy } from "react";

const SubSchool = lazy(() => import("@views/Reference/SubSchool"))
const Departments = lazy(() => import("@views/Reference/Departments"))
const Teachers = lazy(() => import("@views/Reference/Teacher"))
const INFO = lazy(() => import("@views/Reference/Teacher/INFO"))
const Employee = lazy(() => import("@src/views/Reference/Employee"))

const ReferenceRoutes = [
    {
        path: 'reference/school/',
        element: <SubSchool />
    },
    {
        path: 'reference/departments/',
        element: <Departments />
    },
    {
        path: 'reference/teachers/',
        element: <Teachers />
    },
    {
        path: 'reference/teachers/:teacher_id/info/',
        element: <INFO />
    },
    {
        path: 'reference/employee/',
        element: <Employee />
    },
]

export default ReferenceRoutes
