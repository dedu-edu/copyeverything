import React from 'react'
import { Card, CardBody, Col, Row, CardHeader, Button, CardTitle } from 'reactstrap'
import BreadCrumbs from '@components/breadcrumbs';
import { useLocation, useNavigate } from 'react-router-dom';
import DragProfession from './DragProfession';
import { formatDate } from '@utils'



export default function Profession() {
    const location = useLocation();
    const datas = location.state
    return (
        <Card>
            <Row className="mt-2 d-flex  flex-row align-items-center border-bottom m-1">
                <BreadCrumbs title={'Элсэлт'} data={[{ title: 'Элсэлтийн жагсаалт', link: '/elselt/register/' }, { title: 'Хөтөлбөрийн жагсаалт' }]} />
            </Row>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                <div className='fs-5'>
                    <span className='fw-bold'>{datas?.name}
                    <br/> <span>{formatDate(datas?.begin_date, 'YYYY-MM-DD HH:mm')} -  {formatDate(datas?.end_date, 'YYYY-MM-DD HH:mm')}</span></span>
                </div>
            </CardHeader>
            <CardBody>
                <DragProfession cdatas={datas}/>
            </CardBody>
        </Card>
    )
}
