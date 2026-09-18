import { Users } from 'react-feather'
import { Card, CardBody, Row, Col } from 'reactstrap'

const getColorScheme = (name) => {
    if (!name) return { bg: '#f1f1f1', text: '#666' }

    if (name.includes('Суралцаж буй')) return { bg: '#e3f7e9', text: '#28a745' }
    if (name.includes('Чөлөөтэй')) return { bg: '#fdf1da', text: '#c98a1a' }
    if (name.includes('Сургалтаас хасагдсан')) return { bg: '#fbe4e6', text: '#e0435a' }
    if (name.includes('Төгссөн')) return { bg: '#f1f1f1', text: '#666' }

    return { bg: '#f1f1f1', text: '#666' }
}

export const StudentStateSummary = ({ data }) => {
    const datas = data?.datas || []

    return (
        <Card style={{ height: '100%' }}>
            <CardBody>
                <div className='d-flex align-items-center mb-2'>
                    <Users size={18} className='me-1' />
                    <h5 className='mb-0 fw-bolder'>Оюутны төлөвийн байдал</h5>
                </div>

                <Row className='g-1'>
                    {datas.map((item) => {
                        const { bg, text } = getColorScheme(item.name)
                        return (
                            <Col xs={6} key={item.id}>
                                <div
                                    style={{
                                        backgroundColor: bg,
                                        borderRadius: 8,
                                        padding: '12px 14px',
                                    }}
                                >
                                    <div style={{ color: text, fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                                        {item.name}
                                    </div>
                                    <div style={{ color: text, fontWeight: 700, fontSize: 22 }}>
                                        {item.count}
                                    </div>
                                </div>
                            </Col>
                        )
                    })}
                </Row>
            </CardBody>
        </Card>
    )
}

export default StudentStateSummary
