import { Button, Col, Input, Row } from "reactstrap"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import Irts from "./Irts"
import Score from "./Score"


export default function TeacherJournal() {
	const { t } = useTranslation()

	const [selectedJournal, setSelectedJournal] = useState()
	const [jumpTo, setJumpTo] = useState()

	const bookRef = useRef()

	let toRender = (
		<>
			<Col>
				<div onClick={() => setSelectedJournal('irts')}>
					<Irts hideNotice={true} />
				</div>
			</Col>
			<Col>
				<div onClick={() => setSelectedJournal('score')}>
					<Score />
				</div>
			</Col>
		</>
	)

	function jumpToPage() {
		if (!bookRef.current || !jumpTo) return

		const pagesCount = bookRef.current.pageFlip().getPageCount()

		if (jumpTo > pagesCount) bookRef.current.pageFlip().flip(pagesCount - 1, 'bottom')
		else if (jumpTo < 1) bookRef.current.pageFlip().flip(0, 'bottom')
		else bookRef.current.pageFlip().flip(jumpTo - 1, 'bottom')
	}

	const startOver = (
		<Col xs={12}>
			<Row className="mb-3">
				<Col xs='auto'>
					<Button onClick={() => setSelectedJournal(null)} color="secondary">
						{t('Буцах')}
					</Button>
				</Col>
				<Col xs='auto'>
					<Input type="number" placeholder="Хуудасны дугаарыг бичнэ үү" onChange={(e) => setJumpTo(e.target.value)} style={{ width: '210px' }} />
				</Col>
				<Col xs='auto'>
					<Button onClick={() => jumpToPage()} color="primary">
						{t('Очих')}
					</Button>
				</Col>
			</Row>
		</Col>
	)

	if (selectedJournal === 'irts') toRender = (
		<>
			{startOver}
			<Col xs={12}>
				<Irts ref={bookRef} />
			</Col>
		</>
	)

	if (selectedJournal === 'score') toRender = (
		<>
			{startOver}
			<Col xs={12}>
				<Score />
			</Col>
		</>
	)

	return (
		<Row className="py-3">
			{toRender}
		</Row>
	)
}