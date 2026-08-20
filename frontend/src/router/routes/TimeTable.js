import { lazy } from "react";

const Building = lazy(() => import("@views/TimeTable/Building"))
const Room = lazy(() => import("@views/TimeTable/Room"))
const AddV2 = lazy(() => import("@views/TimeTable/Register/AddV2"))
const LessonsSchedule = lazy(() => import("@views/TimeTable/LessonsSchedule"))
const ExamTimeTable = lazy(() => import("@views/TimeTable/ExamTimeTable"))
const ExamReport = lazy (() => import("@views/TimeTable/ExamTimeTable/ExamReport"))
const ExamRepeat = lazy (() => import("@views/TimeTable/ExamRepeat"))
const ExamSupplementary = lazy (() => import("@views/TimeTable/ExamSupplementary"))
const EditPage = lazy (() => import("@views/TimeTable/ExamTimeTable/EditPage"))

const TimetableRoutes = [
    {
        path: 'timetable/building/',
        element: <Building />
    },
    {
        path: 'timetable/room/',
        element: <Room />
    },
    {
        path: 'timetable/register/',
        element: <AddV2 />,
        // meta: {
        //     layout: 'blank',
        // }
    },
    {
        path: 'timetable/lessons_schedule/',
        element: <LessonsSchedule />,
        meta: {
            publicRoute: true,
            layout: "blank"
        }
    },
    {
        path: 'timetable/exam-register/',
        element: <ExamTimeTable />
    },
    {
        path: 'timetable/exam-register/edit/:id',
        element: <EditPage />
    },
    {
        path: 'timetable/exam-re/',
        element: <ExamRepeat />
    },
    {
        path: 'timetable/exam-supplementary/',
        element: <ExamSupplementary />
    },
    {
        path: 'timetable/examreport/:id',
        element: <ExamReport />,
        meta: {
            layout: 'blank',
        }
    },
]

export default TimetableRoutes
