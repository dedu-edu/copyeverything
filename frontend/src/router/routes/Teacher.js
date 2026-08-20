import { lazy } from "react";

const TeacherJournal = lazy(() =>import("@src/views/TeacherJournal"))

const TeacherRoutes = [
	{
        path: 'teacher/journal',
        element: <TeacherJournal />
    }
]

export default TeacherRoutes
