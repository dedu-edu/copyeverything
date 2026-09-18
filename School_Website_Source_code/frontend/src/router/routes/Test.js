import { lazy } from "react";

// admission challenge
const AdmissionQuestion = lazy(() => import("@views/AdmissionChallenge/Question"))
const AdmissionTest = lazy(() => import("@views/AdmissionChallenge/Test"))
const AdmissionAddStudent = lazy(() => import("@views/AdmissionChallenge/Test/AddStudent/"))
const AdmissionShowDetail = lazy(() => import("@views/AdmissionChallenge/Test/DetailShow"))

// progress challenge
const Test = lazy(() => import("@views/Test/"))
const ShowDetail = lazy(() => import("@views/Test/DetailShow"))
const EQuestions = lazy(() => import("@views/Test/EQuestions/"))
const Challenge = lazy(() => import("@views/Test/Test/"))
const AddStudent = lazy(() => import("@views/Test/Test/AddStudent/"))
const ExamSchedule = lazy(() => import("@views/Test/ExamSchedule"))
const Teacher = lazy(() => import("@views/Test/Teachers"))

// season challenge
const SeasonTest = lazy(() => import("@views/SeasonTest/Test/"))
const SeasonTestQuestion = lazy(() => import("@views/SeasonTest/Question/"))
const AddStudentSeason = lazy(() => import("@views/SeasonTest/Test/AddStudent/"))
const TestReport = lazy(() => import("@views/SeasonTest/Report/"))

// graduate challenge
const GraduateQuestion = lazy(() => import("@views/GraduateTest/Question/"))
const GraduateTest = lazy(() => import("@views/GraduateTest/Test/"))
const GraduateShowDetail = lazy(() => import("@views/GraduateTest/Test/DetailShow/"))
const AddStudentGraduate = lazy(() => import("@views/GraduateTest/Test/AddStudent/"))

// Хөндлөнгийн шалгалт
const AuditExamQuestion = lazy(() => import("@views/AuditExam/Question/"))
const AuditExamTest = lazy(() => import("@views/AuditExam/Test/"))
const AddStudentAudit = lazy(() => import("@views/AuditExam/Test/AddStudent/"))

// Аман шалгалт
const OralExamQuestion = lazy(() => import("@views/OralExam/Question/"))
const OralExamTest = lazy(() => import("@views/OralExam/Test/"))
const OralExamTestAddStudent = lazy(() => import("@views/OralExam/Test/AddStudent/"))
const OralExamTestDetail = lazy(() => import("@views/OralExam/Test/Detail/"))

const TestRoutes = [
    // #region admission challenge
    // "Asuultyn san" page
    {
        path: '/admission-challenge/question/',
        element: <AdmissionQuestion />
    },

    // "Online shalgalt" page
    {
        path: '/admission-challenge/test/',
        element: <AdmissionTest/>
    },
    {
        path: '/admission-challenge/test/addstudent/:challenge_id',
        element: <AdmissionAddStudent/>
    },
    {
        path: '/admission-challenge/detail/:detid',
        element: <AdmissionShowDetail />
    },
    // #endregion

    // #region progress challenge
    // "Asuultyn san" page
    {
        path: '/challenge/teacher/',
        element: <Teacher />
    },
    {
        path: '/challenge/equestion/',
        element: <EQuestions />
    },

    // "Online shalgalt" page
    {
        path: '/challenge/challenge/',
        element: <Test />
    },
    {
        path: '/challenge/detail/:detid',
        element: <ShowDetail />
    },
    {
        path: '/challenge/test/addstudent/:challenge_id/:lesson_id',
        element: <AddStudent/>
    },
    {
        path: '/challenge/test/',
        element: <Challenge/>
    },
    {
        path: 'challenge/exam_schedule/',
        element: <ExamSchedule/>
    },
    // #endregion

    // #region season challenge
    {
        path: '/challenge-question/',
        element: <SeasonTestQuestion/>
    },
    {
        path: '/challenge-season/',
        element: <SeasonTest/>
    },
    {
        path: '/challenge-report/',
        element: <TestReport/>
    },
    {
        path: '/challenge-season/addstudent/:challenge_id/:lesson_id',
        element: <AddStudentSeason/>
    },
    // #endregion

    // #region graduate challenge
    {
        path: '/graduate-question/',
        element: <GraduateQuestion/>
    },
    {
        path: 'challenge-graduate/',
        element: <GraduateTest/>
    },
    {
        path: '/challenge-graduate/detail/:detid',
        element: <GraduateShowDetail />
    },
    {
        path: '/challenge/graduate-test/addstudent/:challenge_id/',
        element: <AddStudentGraduate/>
    },
    // #endregion
    // #region audit challenge
    {
        path: '/audit-question/',
        element: <AuditExamQuestion/>
    },
    {
        path: 'challenge-audit/',
        element: <AuditExamTest/>
    },
    {
        path: '/challenge/audit/addstudent/:challenge_id/',
        element: <AddStudentAudit />
    },
    // #endregion

    // #region Аман шалгалт
    // "Asuultyn san" page
    {
        path: '/oral-exam/question/',
        element: <OralExamQuestion />
    },

    // "Online shalgalt" page
    {
        path: '/oral-exam/test/',
        element: <OralExamTest />
    },
    {
        path: '/oral-exam/test/add-student/:challenge_id/:lesson_id',
        element: <OralExamTestAddStudent />
    },
    {
        path: '/oral-exam/test/detail/:detid',
        element: <OralExamTestDetail />
    },
    // #endregion
]

export default TestRoutes;