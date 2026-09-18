import { FileText } from 'react-feather'
import { Card, CardBody, Row, Col } from 'reactstrap'

export const OnlineLessonSummary = ({ data }) => {
    return (
        <Card className='h-100'>
            <CardBody>
                <div className='d-flex align-items-center mb-2'>
                    <FileText size={18} className='me-1' />
                    <h5 className='mb-0 fw-bolder'>Цахим хичээл (багшийн систем)</h5>
                </div>
                <Row>
                    <Col xs={6} className='mb-2'>
                        <div className='text-muted' style={{ fontSize: 13 }}>Нийт байршуулсан хичээл</div>
                        <h3 className='fw-bolder mb-0'>{data?.total_online_lessons ?? 0}</h3>
                    </Col>
                    <Col xs={6} className='mb-2'>
                        <div className='text-muted' style={{ fontSize: 13 }}>Нийт байршуулсан материал</div>
                        <h3 className='fw-bolder mb-0'>{data?.total_week_materials ?? 0}</h3>
                    </Col>
                    <Col xs={6}>
                        <div className='text-muted' style={{ fontSize: 13 }}>Нийт оруулсан даалгавар</div>
                        <h3 className='fw-bolder mb-0'>{data?.total_homeworks ?? 0}</h3>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}

export default OnlineLessonSummary
