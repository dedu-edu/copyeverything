// ** React Imports
import { Fragment, lazy } from "react"

import UserRoutes from "./User"
import SettingsRoutes from "./Settings"
import StudyPlan from "./Study/StudyPlan"
import LessonStandartRoutes from "./Study/lessonStandart"
import ProfessionDefinitionRoutes from "./Study/ProfessionDefinition"
import StudentRoutes from "./Student"
import ReferenceRoutes from "./Reference"
import TimetableRoutes from "./TimeTable"
import PaymentSettingsRoutes from "./StudyPayment"
import Score from "./Score"
import PrintRoutes from "./Print"
import StipendRoutes from "./Stipend"
import DashboardRoutes from "./Dashboard"
import CalendarRoutes from "./Calendar"
import Dormitory from "./Dormitory"
import RequestRoutes from "./Request"
import OrderRoutes from "./Order"
import ServiceRoutes from "./Service"
import Estimation from "./Estimation"
import SurveyRoutes from "./Survey"
import RoleRoutes from "./Role"
import ScienceRoutes from "./Science"
import StatisticRoutes from "./Statistic"
import Test from "./Test"
import ElseltRoutes from "./Elselt"
import PsychologicalTestingRoutes from "./PsychologicalTesting"
import OnlineLessonRoutes from "./OnlineLesson";
import StudentBrowserRoutes from "./StudentBrowser";
import FeedbackRoutes from "./Feedback";
import TeacherRoutes from "./Teacher";
import DigitalJournalRoutes from "./DigitalJournal";
import FaqRoutes from "./Faq";

import BlankLayout from "@layouts/BlankLayout"
import VerticalLayout from "@src/layouts/VerticalLayout"
import HorizontalLayout from "@src/layouts/HorizontalLayout"
import LayoutWrapper from "@src/@core/layouts/components/layout-wrapper"

import PublicRoute from "@components/routes/PublicRoute"

import { isObjEmpty } from "@utils"
import RemoteRoutes from "./RemoteLesson"
import ScoreConfirmRoutes from "./ScoreConfirm"

const getLayout = {
  blank: <BlankLayout />,
  vertical: <VerticalLayout />,
  horizontal: <HorizontalLayout />
}

const DefaultRoute = "/login"

const Routes = [
  ...DashboardRoutes,
  ...CalendarRoutes,
  ...UserRoutes,
  ...SettingsRoutes,
  ...StudyPlan,
  ...LessonStandartRoutes,
  ...ProfessionDefinitionRoutes,
  ...StudentRoutes,
  ...ReferenceRoutes,
  ...TimetableRoutes,
  ...Estimation,
  ...PaymentSettingsRoutes,
  ...Score,
  ...StatisticRoutes,
  ...PrintRoutes,
  ...StipendRoutes,
  ...Dormitory,
  ...RequestRoutes,
  ...OrderRoutes,
  ...ServiceRoutes,
  ...SurveyRoutes,
  ...RoleRoutes,
  ...ScienceRoutes,
  ...Test,
  ...ElseltRoutes,
  ...PsychologicalTestingRoutes,
  ...OnlineLessonRoutes,
  ...StudentBrowserRoutes,
  ...RemoteRoutes,
	...FeedbackRoutes,
	...ScoreConfirmRoutes,
	...TeacherRoutes,
	...DigitalJournalRoutes,
	//...FaqRoutes,
];

const getRouteMeta = (route) => {
  if (isObjEmpty(route.element.props)) {
    if (route.meta) {
      return { routeMeta: route.meta }
    } else {
      return {}
    }
  }
}

const MergeLayoutRoutes = (layout, defaultLayout) => {
  const LayoutRoutes = []

  if (Routes) {
    Routes.filter((route) => {
      let isBlank = false
      if (
        (route.meta && route.meta.layout && route.meta.layout === layout) ||
        ((route.meta === undefined || route.meta.layout === undefined) &&
          defaultLayout === layout)
      ) {
        const RouteTag = PublicRoute

        if (route.meta) {
          route.meta.layout === "blank" ? (isBlank = true) : (isBlank = false)
        }
        if (route.element) {
          const Wrapper =
            isObjEmpty(route.element.props) && isBlank === false
              ?
                LayoutWrapper
              : Fragment

          route.element = (
            <Wrapper {...(isBlank === false ? getRouteMeta(route) : {})}>
              <RouteTag route={route}>{route.element}</RouteTag>
            </Wrapper>
          )
        }

        LayoutRoutes.push(route)
      }
      return LayoutRoutes
    })
  }
  return LayoutRoutes
}

const getRoutes = (layout) => {
  const defaultLayout = layout || "vertical"
  const layouts = ["vertical", "horizontal", "blank"]

  const AllRoutes = []

  layouts.forEach((layoutItem) => {
    const LayoutRoutes = MergeLayoutRoutes(layoutItem, defaultLayout)

    AllRoutes.push({
      path: "/",
      element: getLayout[layoutItem] || getLayout[defaultLayout],
      children: LayoutRoutes
    })
  })
  return AllRoutes
}

export { DefaultRoute, Routes, getRoutes }
