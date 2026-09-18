import { lazy } from "react";

const Feedback = lazy(() => import("@views/Feedback"))

const FeedbackRoutes = [
    {
        path: 'feedback/',
        element: <Feedback />
    },

]
export default FeedbackRoutes
