import { Calendar } from 'react-feather'
import { get_week } from '@src/utility/Utils'
import {
    Card,
    CardBody,
    Progress,
    Input,
    Row,
    Col
} from 'reactstrap'

const AttendanceTimeline = ({ selectedWeek, onWeekChange, schoolAttendance = {} }) => {
    const weekOptions = get_week()

    const selectedOption =
        weekOptions.find(option => option.id === Number(selectedWeek)) || null

    const {
        selected_week_average_percent = 0,
        below_threshold_school_count = 0,
        schools = []
    } = schoolAttendance || {}

    return (
        <Card className="h-100">
            <CardBody>
                <Row className="align-items-center justify-content-between mb-2">
                    <Col xs="auto">
                        <div className="d-flex align-items-center">
                            <Calendar size={18} className="me-1" />
                            <h5 className="mb-0 fw-bolder">
                                Ирцийн мэдээлэл /долоо хоногоор/
                            </h5>
                        </div>
                    </Col>

                    <Col style={{ maxWidth: 200 }}>
                        <Input
                            id="attendance-week-select"
                            type="select"
                            bsSize="sm"
                            value={selectedOption ? selectedOption.id : ''}
                            onChange={(e) => onWeekChange?.(Number(e.target.value))}
                            disabled={weekOptions.length === 0}
                        >
                            {weekOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </Input>
                    </Col>
                </Row>

                <div className="mb-1">
                    <small className="text-muted d-block">
                        Сонгосон долоо хоногийн дундаж ирц
                    </small>

                    <h2 className="fw-bolder mb-0">
                        {selected_week_average_percent}%
                    </h2>
                </div>

                {schools.length === 0 ? (
                    <small className="text-muted">
                        Сургуулиудын ирцийн мэдээлэл олдсонгүй
                    </small>
                ) : (
                    schools.map(school => (
                        <Row
                            key={school.id || school.name}
                            className="align-items-center mb-1"
                        >
                            <Col xs={3}>
                                <small className="d-block" style={{ maxHeight: '5em', lineHeight: '1' }}>
                                    {school.name}
                                </small>
                            </Col>

                            <Col>
                                <Progress
                                    value={school.percent}
                                    color={school.percent < 70 ? 'warning' : 'primary'}
                                />
                            </Col>

                            <Col className="text-end ps-0" style={{ flex: '0 0 60px', minWidth: 60 }}>
                                <strong>{school.percent}%</strong>
                            </Col>
                        </Row>
                    ))
                )}

                <hr />

                <Row className="align-items-center">
                    <Col>
                        <div className="text-muted">
                            70%-с доош ирцтэй сургууль
                        </div>
                    </Col>

                    <Col xs="auto">
                        <strong>{below_threshold_school_count} сургууль</strong>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}

export default AttendanceTimeline