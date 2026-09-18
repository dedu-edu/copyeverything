import { Table } from "reactstrap"

export function EveryWeekReport({ datas }) {
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
                    <th>Нийт суралцагч</th>
                    <th>Өвчтэй /3 хоног/</th>
                    <th>Чөлөөтэй /5 хоног/</th>
                    <th>Тасалсан /6 цаг/</th>
                </tr>
            </thead>
            <tbody>
                {
                    datas?.map((data, idx) => {
                        return(
                            <tr key={idx+1}>
                                <td>{idx+1}</td>
                                <td>{data?.name}</td>
                                <td>{data?.student_count}</td>
                                <td>{data?.sick_students?.join(", ")}</td>
                                <td>{data?.chuluu_students?.join(", ")}</td>
                                <td>{data?.tas_students?.join(", ")}</td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </Table>
    )
}