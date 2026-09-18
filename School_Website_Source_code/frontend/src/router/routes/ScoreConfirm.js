import { lazy } from "react";

const ScoreConfirm = lazy(() => import("@views/ScoreConfirm"))

const ScoreConfirmRoutes = [
    {
        path: 'score-confirm/',
        element: <ScoreConfirm />
    },

]
export default ScoreConfirmRoutes
