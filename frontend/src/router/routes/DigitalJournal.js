import { lazy } from 'react'

const DigitalJournal = lazy(() => import('@src/views/DigitalJournal'))

const DigitalJournalRoutes = [
    {
        path: 'digital-journal/',
        element: <DigitalJournal />
    }
]

export default DigitalJournalRoutes
