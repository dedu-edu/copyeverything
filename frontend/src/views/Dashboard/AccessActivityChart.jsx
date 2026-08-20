import { useState } from 'react'
import { TrendingUp } from 'react-feather'
import { Card, CardBody } from 'reactstrap'

const formatDayLabel = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}.${d.getDate()}`
}

const formatFullDayLabel = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}-р сарын ${d.getDate()}`
}

export const AccessActivityChart = ({ data }) => {
    const datas = data?.datas || []
    const maxCount = data?.max_count || 1
    const [activeIndex, setActiveIndex] = useState(null)

    const activeItem = activeIndex !== null ? datas[activeIndex] : null

    return (
        <Card>
            <CardBody>
                <div className='d-flex align-items-center justify-content-between mb-1'>
                    <div className='d-flex align-items-center'>
                        <TrendingUp size={18} className='me-1' />
                        <h5 className='mb-0 fw-bolder'>Хандалтын идэвх</h5>
                    </div>
                    <div style={{ fontSize: 13 }}>
                        {activeItem ? (
                            <>
                                <span className="text-muted me-1">
                                    {formatFullDayLabel(activeItem.date)}:
                                </span>
                                <span className="fw-bolder">
                                    {activeItem.count} хандалт
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-muted me-1">
                                    Сүүлийн {data?.days_count || 30} хоног:
                                </span>
                                <span className="fw-bolder">
                                    {datas.reduce((acc, curr) => acc + curr.count, 0)} хандалт
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', height: 140, gap: 2 }}>
                    {datas.map((item, idx) => {
                        const heightPercent = maxCount ? (item.count / maxCount) * 100 : 0
                        const isActive = activeIndex === idx

                        return (
                            <div
                                key={idx}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onMouseLeave={() => setActiveIndex(null)}
                                onClick={() => setActiveIndex(isActive ? null : idx)}
                                style={{
                                    flex: 1,
                                    height: `${Math.max(heightPercent, 3)}%`,
                                    backgroundColor: isActive ? '#7cb0f0' : '#cfe2fb',
                                    borderRadius: '3px 3px 0 0',
                                    minWidth: 4,
                                    transition: 'height 0.2s, background-color 0.15s',
                                    cursor: 'pointer'
                                }}
                            />
                        )
                    })}
                </div>
                <div style={{ borderTop: '1px solid #eee', marginTop: 4 }} />

                <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                    {datas.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                flex: 1,
                                minWidth: 4,
                                textAlign: 'center',
                                fontSize: 9,
                                color: activeIndex === idx ? '#333' : '#999',
                                fontWeight: activeIndex === idx ? 700 : 400,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {formatDayLabel(item.date)}
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    )
}

export default AccessActivityChart
