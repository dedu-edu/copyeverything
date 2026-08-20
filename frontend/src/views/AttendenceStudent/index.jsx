
import React, { useState, useEffect, useRef, useCallback,useContext } from 'react';
import { ChevronDown, ChevronRight, User } from 'react-feather';
import { Table, Input } from 'reactstrap';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import {
    PAGE_SIZE,
    STATE_KEYS,
    STATE_CONFIG,
    WEEK_OPTIONS,
    EMPTY_COUNTS,
} from './helpers/Constants';
import Pagination from './helpers/Pagination';
import StateModal from './helpers/Statemodal';
import LessonTable from './helpers/Lessontable';
import ActiveYearContext from '@src/utility/context/ActiveYearContext';

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [globalSummary, setGlobalSummary] = useState({ ...EMPTY_COUNTS });
    const [studentSummary, setStudentSummary] = useState({});
    const [expandedStudents, setExpandedStudents] = useState({});
    const [expandedLessons, setExpandedLessons] = useState({});
    const [lessonsData, setLessonsData] = useState({});
    const [attendanceData, setAttendanceData] = useState({});
    const [lessonLoaders, setLessonLoaders] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [selectedWeek, setSelectedWeek] = useState('');
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [modalState, setModalState] = useState(null);
    const didFetch = useRef(false);
    const isSearchFirstRender = useRef(true);
    const isWeekFirstRender = useRef(true);
    const isGroupFirstRender = useRef(true);
    const { school = '', active_week: systemActiveWeek } = useContext(ActiveYearContext);
    const irtsInfoApi = useApi().timetable.irtsInfo;
    const { fetchData, Loader, isLoading } = useLoader({ isFullScreen: false });

    // ── Анхны дата ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        let cancelled = false;
        (async () => {
            try {
                const [studentsRes, summaryRes, allSummaryRes] = await Promise.all([
                    fetchData(irtsInfoApi.getStudents('', 1, PAGE_SIZE,school)),
                    irtsInfoApi.getStudentSummary('',school),
                    irtsInfoApi.getStudentAllSummary('',school),
                ]);
                if (cancelled) return;
                if (studentsRes.success && studentsRes.data) applyStudentsData(studentsRes.data, 1);
                if (summaryRes.success && summaryRes.data) setGlobalSummary(summaryRes.data);
                if (allSummaryRes.success && allSummaryRes.data)
                    setStudentSummary(allSummaryRes.data);
            } finally {
                if (!cancelled) setInitialLoadDone(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // ── Debounce хайлтууд ────────────────────────────────────────────────────────
    useEffect(() => {
        if (isSearchFirstRender.current) {
            isSearchFirstRender.current = false;
            return;
        }
        const t = setTimeout(() => loadStudents(1, searchTerm, groupSearchTerm), 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    useEffect(() => {
        if (isGroupFirstRender.current) {
            isGroupFirstRender.current = false;
            return;
        }
        const t = setTimeout(() => loadStudents(1, searchTerm, groupSearchTerm), 400);
        return () => clearTimeout(t);
    }, [groupSearchTerm]);

    // ── 7 хоног солиход summary шинэчлэх ────────────────────────────────────────
    useEffect(() => {
        if (isWeekFirstRender.current) {
            isWeekFirstRender.current = false;
            return;
        }
        let cancelled = false;
        const t = setTimeout(async () => {
            const [summaryRes, allSummaryRes] = await Promise.all([
                irtsInfoApi.getStudentSummary(selectedWeek,school),
                irtsInfoApi.getStudentAllSummary(selectedWeek,school),
            ]);
            if (cancelled) return;
            if (summaryRes.success && summaryRes.data) setGlobalSummary(summaryRes.data);
            if (allSummaryRes.success && allSummaryRes.data) setStudentSummary(allSummaryRes.data);
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [selectedWeek]);

    // ── Функцүүд ─────────────────────────────────────────────────────────────────
    const applyStudentsData = (data, page) => {
        if (data?.results !== undefined) {
            setStudents(Array.isArray(data.results) ? data.results : []);
            setTotalCount(data.total ?? 0);
            setTotalPages(data.totalPages ?? 1);
            setCurrentPage(data.page ?? page);
        } else {
            const arr = Array.isArray(data) ? data : [];
            setStudents(arr);
            setTotalCount(arr.length);
            setTotalPages(Math.ceil(arr.length / PAGE_SIZE) || 1);
            setCurrentPage(page);
        }
    };

    const loadStudents = async (page, search = '', groupSearch = '') => {
        try {
            const { success, data } = await fetchData(
                irtsInfoApi.getStudents(search, page, PAGE_SIZE, groupSearch,school),
            );
            if (success && data) {
                applyStudentsData(data, page);
                setExpandedStudents({});
            }
        } catch (_) {}
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        loadStudents(page, searchTerm, groupSearchTerm);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleStudent = useCallback(
        async (student) => {
            const key = String(student.student_id);
            const isOpen = expandedStudents[key];
            setExpandedStudents((prev) => ({ ...prev, [key]: !isOpen }));
            if (isOpen || lessonsData[key] || lessonLoaders[key]) return;

            setLessonLoaders((prev) => ({ ...prev, [key]: true }));
            try {
                const res = await irtsInfoApi.getStudentDetail(student.student_id);
                if (!res.success || !res.data) return;
                const { lessons, attendance } = res.data;
                if (lessons) setLessonsData((prev) => ({ ...prev, [key]: lessons }));
                if (attendance) {
                    const updates = Object.fromEntries(
                        Object.entries(attendance).map(([k, v]) => [`${key}-${k}`, v]),
                    );
                    setAttendanceData((prev) => ({ ...prev, ...updates }));
                }
            } catch (_) {
            } finally {
                setLessonLoaders((prev) => ({ ...prev, [key]: false }));
            }
        },
        [expandedStudents, lessonsData, lessonLoaders, irtsInfoApi],
    );

    const toggleLesson = useCallback((lKey) => {
        setExpandedLessons((prev) => ({ ...prev, [lKey]: !prev[lKey] }));
    }, []);

    // ── Render ───────────────────────────────────────────────────────────────────
    if (isLoading && !initialLoadDone)
        return <div style={{ padding: '40px', textAlign: 'center' }}>{Loader}</div>;

    return (
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px' }}>
            {modalState && (
                <StateModal
                    stateKey={modalState}
                    irtsInfoApi={irtsInfoApi}
                    onClose={() => setModalState(null)}
                    selectedWeek={selectedWeek}
                />
            )}

            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            >
                {/* Товч карт */}
                <div
                    style={{
                        display: 'flex',
                        gap: '14px',
                        padding: '16px 20px',
                        borderBottom: '1px solid #dee2e6',
                        flexWrap: 'wrap',
                    }}
                >
                    {STATE_KEYS.map((key) => {
                        const cfg = STATE_CONFIG[key];
                        return (
                            <div
                                key={key}
                                onClick={() => setModalState(key)}
                                style={{
                                    flex: '1',
                                    minWidth: '130px',
                                    backgroundColor: cfg.bg,
                                    borderRadius: '10px',
                                    padding: '14px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s, box-shadow 0.1s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.13)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: '26px',
                                            fontWeight: 'bold',
                                            color: '#222',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {globalSummary[key] ?? 0}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            color: '#777',
                                            marginTop: '4px',
                                        }}
                                    >
                                        {cfg.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            color: '#aaa',
                                            marginTop: '2px',
                                        }}
                                    >
                                        дарж харах ↗
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        backgroundColor: cfg.cardBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                    }}
                                >
                                    {cfg.icon}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Хайлт & шүүлтүүр */}
                <div
                    style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid #dee2e6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ minWidth: '200px', flex: 1 }}>
                        <Input
                            type="text"
                            placeholder="Оюутны нэр эсвэл код хайх..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            bsSize="sm"
                        />
                    </div>
                    <div style={{ minWidth: '160px', maxWidth: '220px' }}>
                        <Input
                            type="text"
                            placeholder="Ангиар хайх..."
                            value={groupSearchTerm}
                            onChange={(e) => setGroupSearchTerm(e.target.value)}
                            bsSize="sm"
                        />
                    </div>
                    <div style={{ minWidth: '150px', maxWidth: '190px' }}>
                        <Input
                            type="select"
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            bsSize="sm"
                        >
                            <option value="">Бүх 7 хоног</option>
                            {WEEK_OPTIONS.map((w) => (
                                <option key={w} value={w}>
                                    {w}-р 7 хоног
                                </option>
                            ))}
                        </Input>
                    </div>
                    <div
                        style={{
                            fontSize: '13px',
                            color: '#888',
                            whiteSpace: 'nowrap',
                            marginLeft: 'auto',
                        }}
                    >
                        Нийт <strong style={{ color: '#333' }}>{totalCount}</strong> оюутан
                        {totalPages > 1 && (
                            <span>
                                {' '}
                                — <strong style={{ color: '#4c8bf5' }}>{currentPage}</strong>/
                                {totalPages} хуудас
                            </span>
                        )}
                    </div>
                </div>

                {isLoading && (
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                        <div className="spinner-border spinner-border-sm" role="status" />
                        <span style={{ marginLeft: '8px', fontSize: '13px', color: '#666' }}>
                            Уншиж байна...
                        </span>
                    </div>
                )}

                {!isLoading && students.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        Оюутны мэдээлэл олдсонгүй
                    </div>
                )}

                {!isLoading && students.length > 0 && (
                    <>
                        <div style={{ overflow: 'auto' }}>
                            <Table bordered hover style={{ marginBottom: 0 }}>
                                <thead
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 10,
                                    }}
                                >
                                    <tr>
                                        <th style={{ minWidth: '60px' }}>#</th>
                                        <th style={{ minWidth: '60px' }}>Код</th>
                                        <th style={{ minWidth: '200px' }}>Оюутны нэр</th>
                                        <th style={{ minWidth: '140px' }}>Анги</th>
                                        <th style={{ minWidth: '180px' }}>Мэргэжил</th>
                                        <th className="text-center" style={{ minWidth: '60px' }}>
                                            Курс
                                        </th>
                                        {STATE_KEYS.map((key) => (
                                            <th
                                                key={key}
                                                className="text-center"
                                                style={{
                                                    minWidth: '55px',
                                                    color: STATE_CONFIG[key].color,
                                                    backgroundColor: STATE_CONFIG[key].bg,
                                                }}
                                            >
                                                {key.toUpperCase()}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, idx) => {
                                        const sKey = String(student.student_id);
                                        const isOpen = expandedStudents[sKey];
                                        const sLoading = lessonLoaders[sKey];
                                        const sCounts =
                                            studentSummary[student.student_id] ?? EMPTY_COUNTS;
                                        const rowNum = (currentPage - 1) * PAGE_SIZE + idx + 1;

                                        return (
                                            <React.Fragment key={sKey}>
                                                <tr
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => toggleStudent(student)}
                                                >
                                                    <td>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                            }}
                                                        >
                                                            {sLoading ? (
                                                                <div
                                                                    className="spinner-border spinner-border-sm"
                                                                    role="status"
                                                                />
                                                            ) : isOpen ? (
                                                                <ChevronDown size={16} />
                                                            ) : (
                                                                <ChevronRight size={16} />
                                                            )}
                                                            {rowNum}
                                                        </div>
                                                    </td>
                                                    <td style={{ color: '#555', fontSize: '13px' }}>
                                                        {student.code}
                                                    </td>
                                                    <td>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                            }}
                                                        >
                                                            <User size={14} color="#888" />
                                                            <span style={{ fontWeight: 500 }}>
                                                                {student.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>{student.group_name}</td>
                                                    <td>{student.profession_name}</td>
                                                    <td className="text-center">{student.level}</td>
                                                    {STATE_KEYS.map((key) => (
                                                        <td
                                                            key={key}
                                                            className="text-center"
                                                            style={{
                                                                backgroundColor:
                                                                    STATE_CONFIG[key].cellBg,
                                                                fontWeight: 'bold',
                                                                color: STATE_CONFIG[key].color,
                                                            }}
                                                        >
                                                            {sCounts[key] ?? 0}
                                                        </td>
                                                    ))}
                                                </tr>

                                                {isOpen && (
                                                    <tr>
                                                        <td
                                                            colSpan={10}
                                                            style={{
                                                                padding: 0,
                                                                backgroundColor: '#e3f2fd',
                                                            }}
                                                        >
                                                            {sLoading ? (
                                                                <div
                                                                    style={{
                                                                        padding: '20px',
                                                                        textAlign: 'center',
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="spinner-border"
                                                                        role="status"
                                                                    />
                                                                </div>
                                                            ) : lessonsData[sKey]?.length > 0 ? (
                                                                <LessonTable
                                                                    sKey={sKey}
                                                                    lessons={lessonsData[sKey]}
                                                                    attendanceData={attendanceData}
                                                                    expandedLessons={
                                                                        expandedLessons
                                                                    }
                                                                    selectedWeek={selectedWeek}
                                                                    onToggleLesson={toggleLesson}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="text-center text-muted"
                                                                    style={{ padding: '20px' }}
                                                                >
                                                                    Хичээлийн мэдээлэл олдсонгүй
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            onChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
