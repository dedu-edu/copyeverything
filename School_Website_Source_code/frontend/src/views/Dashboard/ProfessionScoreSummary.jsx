import { FileText } from 'react-feather'
import { Card, CardBody, Table, Input, Row, Col } from 'reactstrap'

const getColorClass = (percent) => (percent < 70 ? 'text-danger' : 'text-success')

export const ProfessionScoreSummary = ({ data, degrees, selectedDegree, onDegreeChange }) => {
    const datas = data?.datas || []

    return (
        <Card>
            <CardBody>
                <Row className='justify-content-between align-items-center mb-1'>
                    <Col className='d-flex align-items-center'>
                        <FileText size={18} className='me-1' />
                        <h5 className='mb-0 fw-bolder'>Дүнгийн мэдээлэл — хөтөлбөрөөр</h5>
                    </Col>
                    {degrees && (
                        <Col style={{ maxWidth: 220 }}>
                            <Input
                                type='select'
                                bsSize='sm'
                                value={selectedDegree}
                                onChange={(e) => onDegreeChange(e.target.value)}
                            >
                                <option value="">Бүх зэрэг</option>
                                {degrees.map((deg, idx) => (
                                    <option key={idx} value={deg.id}>{deg.degree_name}</option>
                                ))}
                            </Input>
                        </Col>
                    )}
                </Row>

                <div className='overflow-auto' style={{ maxHeight: '400px' }}>
                    <Table borderless size='sm' className='mb-0'>
                        <thead className='bg-white'>
                            <tr>
                                <th className='text-muted fw-normal'>Хөтөлбөр</th>
                                <th className='text-muted text-end fw-normal'>Дундаж дүн</th>
                                <th className='text-muted text-end fw-normal'>Амжилт</th>
                                <th className='text-muted text-end fw-normal'>Чанар</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datas.map((item) => (
                                <tr key={item.id} className='border-bottom border-opacity-25'>
                                    <td>{item.name}</td>
                                    <td className='text-end'>{item.avg_score}</td>
                                    <td className={`text-end fw-bolder ${getColorClass(item.success_percent)}`}>
                                        {item.success_percent}%
                                    </td>
                                    <td className={`text-end fw-bolder ${getColorClass(item.quality_percent)}`}>
                                        {item.quality_percent}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </CardBody>
        </Card>
    )
}

export default ProfessionScoreSummary
