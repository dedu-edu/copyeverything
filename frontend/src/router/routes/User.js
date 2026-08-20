import { lazy } from "react";

const User = lazy(() => import("@views/User"))
const UserDetail = lazy(() => import("@views/User/Detail"))
const ChangePassword = lazy(() => import("@views/User/Detail/ChangePassword"))

const UserRoutes = [
    {
        path: '/user',
        element: <User />
    },
    {
        path: 'user/:userID/',
        element: <UserDetail />
    },
    {
        path: '/change-password',
        element: <ChangePassword />
    },
]

export default UserRoutes
