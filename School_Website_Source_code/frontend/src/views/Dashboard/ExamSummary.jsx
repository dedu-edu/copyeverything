import { FileText } from 'react-feather'
import { Card, CardBody, Row, Col } from 'reactstrap'

export const ExamSummary = ({ data }) => {
    return (
        <Card className='h-100'>
            <CardBody>
                <div className='d-flex align-items-center mb-2'>
                    <FileText size={18} className='me-1' />
                    <h5 className='mb-0 fw-bolder'>Шалгалтын мэдээлэл</h5>
                </div>
                <Row>
                    <Col xs={6} className='mb-2'>
                        <div className='text-muted' style={{ fontSize: 13 }}>Зохион байгуулсан шалгалт</div>
                        <h3 className='fw-bolder mb-0'>{data?.organized_count ?? 0}</h3>
                    </Col>
                    <Col xs={6} className='mb-2'>
                        <div className='text-muted' style={{ fontSize: 13 }}>Оролцсон оюутан</div>
                        <h3 className='fw-bolder mb-0'>{data?.participant_count ?? 0}</h3>
                    </Col>
                    <Col xs={6}>
                        <div className='text-muted' style={{ fontSize: 13 }}>Дахин шалгалттай хичээл</div>
                        <h3 className='fw-bolder mb-0 text-warning'>{data?.retake_lesson_count ?? 0}</h3>
                    </Col>
                    <Col xs={6}>
                        <div className='text-muted' style={{ fontSize: 13 }}>Унасан оюутан</div>
                        <h3 className='fw-bolder mb-0 text-danger'>{data?.failed_count ?? 0}</h3>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}

export default ExamSummary
