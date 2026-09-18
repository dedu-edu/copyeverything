import { Table } from "reactstrap"

export function EveryDayReport({ datas }) {
    return(
        <Table bordered hover size='sm'>
            <thead style={{
                backgroundColor: '#f8f9fa',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <tr>
                    <th>№</th>
                    <th>Дамжаа</th>
                    <th style={{ width: "30%" }}>Мэргэжил</th>
                    <th style={{ width: "5%" }}>Курс</th>
                    <th>Нийт суралцагч</th>
                    <th>Ирсэн</th>
                    <th>Өвчтэй</th>
                    <th>Чөлөөтэй</th>
                    <th>Тасалсан</th>
                </tr>
            </thead>
            <tbody>
                {
                    datas?.map((data, idx) => {
                        return(
                            <tr key={idx+1}>
                                <td>{idx+1}</td>
                                <td>{data?.name}</td>
                                <td>{data?.profession_name}</td>
                                <td>{data?.level}</td>
                                <td>{data?.active_student}</td>
                                <td>{data?.irsen_count}</td>
                                <td>{data?.sick_count}</td>
                                <td>{data?.chuluu_count}</td>
                                <td>{data?.tas_count}</td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </Table>
    )
}