import { Calendar } from 'react-feather'
import { Card, CardBody, Row, Col } from 'reactstrap'

export const AttendanceSummary = ({ data }) => {
    const {
        average_percent = 0,
        weeks_count = 0,
        datas = [],
        below_threshold_count = 0,
        teacher_percent = 0
    } = data || {}

    return (
        <Card className='h-100'>
            <CardBody>
                <div className='d-flex align-items-center mb-1'>
                    <Calendar size={18} className='me-1' />
                    <h5 className='mb-0 fw-bolder'>Ирцийн ерөнхий мэдээлэл</h5>
                </div>

                <div className='d-flex align-items-baseline mb-2'>
                    <h1 className='fw-bolder mb-0 me-1'>{average_percent}%</h1>
                    <span className='text-muted'>дундаж ирц (сар)</span>
                </div>

                <Row className='align-items-center justify-content-between mb-1'>
                    <Col className='text-muted' style={{ fontSize: 13 }}>
                        70%-с доош ирцтэй анги
                    </Col>
                    <Col xs='auto'>
                        <strong className={below_threshold_count > 0 ? 'text-danger' : undefined}>
                            {below_threshold_count} анги
                        </strong>
                    </Col>
                </Row>

                <Row className='align-items-center'>
                    <Col className='text-muted' style={{ fontSize: 13 }}>
                        Багшийн ирц бүртгэсэн хувь
                    </Col>
                    <Col xs='auto'>
                        <span className='fw-bolder'>{teacher_percent}%</span>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}

export default AttendanceSummary
