import { lazy } from "react";

const LessonMaterial = lazy(() => import("@views/OnlineLesson/LessonMaterial"));
const LessonMaterialDetail = lazy(() => import("@views/OnlineLesson/LessonMaterial/DetailPage"));
const Announcement = lazy(() => import("@src/views/OnlineLesson/OnlineWeek/Announcement"));

const OnlineLessonPage = lazy(() =>import("@src/views/OnlineLesson/OnlineWeek/index"));
const MainPage = lazy(() => import("@views/OnlineLesson/index"));

const OnlineLessonRoutes = [
      {
        path: "/material",
        element: <LessonMaterial />,
      },
      {
        path: "online_lesson/material/detail/:index",
        element: <LessonMaterialDetail />,
      },
      {
        path: "online_lesson/",
        element: <MainPage />,
      },
      {
        path: "online_lesson/:index/material/",
        element: <LessonMaterial />,
      },
      {
        path: "online_lesson/:index/",
        element: <OnlineLessonPage />,
      },
      {
        path: "online_lesson/:index/notf",
        element: <Announcement />,
      },
]


export default OnlineLessonRoutes;
