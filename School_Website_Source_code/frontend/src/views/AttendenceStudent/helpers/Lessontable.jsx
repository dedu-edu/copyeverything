
import React from 'react';
import { ChevronDown, ChevronRight } from 'react-feather';
import { Table } from 'reactstrap';
import { STATE_KEYS, STATE_CONFIG } from './Constants';
import { calcSummary } from './Utils';
import AttendanceDetail from './Attendencedetail';

export default function LessonTable({
    sKey,
    lessons,
    attendanceData,
    expandedLessons,
    selectedWeek,
    onToggleLesson,
}) {
    return (
        <div style={{ padding: '8px' }}>
            <Table bordered size="sm" style={{ marginBottom: 0, backgroundColor: 'white' }}>
                <thead style={{ backgroundColor: '#bbdefb' }}>
                    <tr>
                        <th style={{ minWidth: '48px' }}>#</th>
                        <th style={{ minWidth: '200px' }}>Хичээлийн нэр</th>
                        <th style={{ minWidth: '160px' }}>Багш</th>
                        <th style={{ minWidth: '120px' }}>Улирал</th>
                        {STATE_KEYS.map((key) => (
                            <th
                                key={key}
                                className="text-center"
                                style={{ minWidth: '60px', color: STATE_CONFIG[key].color }}
                            >
                                {key.toUpperCase()}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {lessons.map((lesson, lIdx) => {
                        const lKey = `${sKey}-${lesson.lesson_id}_${lesson.teacher_id}`;
                        const lOpen = expandedLessons[lKey];
                        const sessions = attendanceData[lKey] ?? [];
                        const hasData = lKey in attendanceData;
                        const summary = hasData ? calcSummary(sessions, selectedWeek) : null;

                        return (
                            <React.Fragment key={lKey}>
                                <tr
                                    style={{ cursor: sessions.length > 0 ? 'pointer' : 'default' }}
                                    onClick={() => sessions.length > 0 && onToggleLesson(lKey)}
                                >
                                    <td>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            }}
                                        >
                                            {sessions.length > 0 ? (
                                                lOpen ? (
                                                    <ChevronDown size={14} />
                                                ) : (
                                                    <ChevronRight size={14} />
                                                )
                                            ) : (
                                                <span
                                                    style={{ display: 'inline-block', width: 14 }}
                                                />
                                            )}
                                            {lIdx + 1}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{lesson.lesson_name}</td>
                                    <td>{lesson.teacher_name}</td>
                                    <td>{lesson.season_name}</td>
                                    {STATE_KEYS.map((key) => (
                                        <td
                                            key={key}
                                            className="text-center"
                                            style={{
                                                color: STATE_CONFIG[key].color,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {!hasData ? '…' : summary[key]}
                                        </td>
                                    ))}
                                </tr>

                                {lOpen && sessions.length > 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            style={{ padding: 0, backgroundColor: '#fff3e0' }}
                                        >
                                            <AttendanceDetail
                                                sessions={sessions}
                                                selectedWeek={selectedWeek}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
}
