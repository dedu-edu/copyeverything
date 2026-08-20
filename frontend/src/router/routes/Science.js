import { lazy } from "react";
// const Bsettings = lazy(() => import("@views/Science/Settings"))

// const Uguulel = lazy(() => import("@views/Science/Uguulel"))
// const Quotation = lazy(() => import("@views/Science/quotation"))
// const Project = lazy(() => import("@views/Science/Project"))
// const Patent = lazy(() => import("@views/Science/Patent"))
// const Student = lazy(() => import("@views/Science/Student"))

// const Buteel = lazy(() => import("@views/Science/Buteel"))

// const ScienceNotes = lazy(() => import("@views/Science/Notes"))
// const Estimate = lazy(() => import("@views/Science/Estimate"))
// const Report = lazy(() => import("@views/Science/Report"))


const Bsettings = lazy(() => import("@views/Sciences/Settings"))
const List = lazy(() => import("@views/Sciences/List"))
const ListDetail = lazy(() => import("@views/Sciences/List/Detail"))
const Report = lazy(() => import("@views/Sciences/Report"))
const Control = lazy(() => import("@views/Sciences/Control"))
const ScienceRoutes = [
    {
        path: 'research/b-indicators/',
        element: <Bsettings />,
    },
    {
        path: 'research/b-estimate/',
        element: <List />
    },
    {
        path: 'research/b-estimate/:id/',
        element: <ListDetail />
    },
    {
        path: 'science/report',
        element: <Report />
    },
    {
        path: 'research/b-control/',
        element: <Control />
    },
    // {
    //     path: 'science/bsettings',
    //     element: <Bsettings />,

    // },
    // {
    //     path: 'science/quotation',
    //     element: <Quotation />,
    // },
    // {
    //     path: 'science/uguulel',
    //     element: <Uguulel />
    // },
    // {
    //     path: 'science/notes',
    //     element: <ScienceNotes />
    // },
    // {
    //     path: 'science/buteel',
    //     element: <Buteel/> ,
    // },
    // {
    //     path: 'science/project',
    //     element: <Project />
    // },
    // {
    //     path: 'science/patent',
    //     element: <Patent />
    // },
    // {
    //     path: 'science/student',
    //     element: <Student />
    // },
    // {
    //     path: 'science/b-estimate',
    //     element: <Estimate />
    // },
    // {
    //     path: 'science/report',
    //     element: <Report />
    // },
]

export default ScienceRoutes
