
import Settings from './Settings'
import Score from './Score'
import Study from './Study'
// import Report from './Report'
import Student from './Student'
import Request from './Request'
import TimeTable from './TimeTable'
import StudyPayment from './StudyPayment'
import Reference from './Reference'
import Print from './Print'
import Stipend from './Stipend'
import Dashboard from './Dashboard'
import Calendar from './Calendar'
// import Dormitory from './Dormitory'
// import Order from './Order'
// import Service from './Service'
import Credit from './Credit'
import Survey from './Survey'
// import TeacherEvaluation from './TeacherEvaluation'
import Role from './Role'
// import Science from './Science'
import Statistic from './Statistic'
import Test from './Test'
import Elselt from './Elselt'
import PsychologicalTesting from './PsychologicalTesting'

import OnlineLesson from "./OnlineLesson";
import StudentBrowsers from "./StudentBrowser";
import RemoteRoutes from './RemoteLesson'
import Feedback from './Feedback'
import DigitalJournal from './DigitalJournal'
import Faq from './Faq'
import ScoreConfirm from './ScoreConfirm'

export default [
  ...Dashboard,
  ...Calendar,
  ...Elselt,
  ...PsychologicalTesting,
  ...Reference,
  ...Study,
  ...OnlineLesson,
  ...RemoteRoutes,
  ...Student,
  ...Credit,
  ...TimeTable,
  ...DigitalJournal,
  ...Score,
  ...Statistic,
  ...StudyPayment,
  ...Stipend,
  // ...Dormitory,
  ...Survey,
  // ...TeacherEvaluation,
  ...Request,
	...Feedback,
	...Faq,
  // ...Order,
  // ...Service,
  ...Print,
  // ...Report,
  ...Test,
  ...Settings,
  ...Role,
  // ...Science
  ...StudentBrowsers,
  ...ScoreConfirm
];
