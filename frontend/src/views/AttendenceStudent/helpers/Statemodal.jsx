
import React, { useState, useEffect, useRef } from 'react';
import { X, User, ArrowUp, ArrowDown } from 'react-feather';
import { Table, Input } from 'reactstrap';
import { STATE_CONFIG, MODAL_LIMIT } from './Constants';

export default function StateModal({ stateKey, onClose, irtsInfoApi, selectedWeek }) {
    const config = STATE_CONFIG[stateKey];

    const [search, setSearch] = useState('');
    const [sortAsc, setSortAsc] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const isFirstSearch = useRef(true);

    // ── Дата татах
    const loadData = async (searchVal = '', pageNum = 1, append = false) => {
        if (!append) setLoading(true);
        else setLoadingMore(true);
        try {
            const res = await irtsInfoApi.getStudentByState(
                stateKey,
                pageNum,
                MODAL_LIMIT,
                selectedWeek,
                searchVal,
            );
            if (!res.success || !res.data) return;
            const d = res.data;
            const results = d.results ?? (Array.isArray(d) ? d : []);
            setData((prev) => (append ? [...prev, ...results] : results));
            setTotalCount(d.total ?? results.length);
            setTotalPages(d.totalPages ?? 1);
            setPage(pageNum);
        } catch (_) {
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // ── stateKey / selectedWeek солиход дахин татах
    useEffect(() => {
        isFirstSearch.current = true;
        setSearch('');
        setData([]);
        loadData('', 1, false);
    }, [stateKey, irtsInfoApi, selectedWeek]);

    // ── Хайлт — backend debounce
    useEffect(() => {
        if (isFirstSearch.current) {
            isFirstSearch.current = false;
            return;
        }
        const t = setTimeout(() => {
            setData([]);
            loadData(search, 1, false);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const loadMore = () => loadData(search, page + 1, true);

    const sorted = [...data].sort((a, b) => (sortAsc ? a.count - b.count : b.count - a.count));

    const remainingCount = Math.min(MODAL_LIMIT, totalCount - data.length);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '680px',
                    maxHeight: '82vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Гарчиг */}
                <div
                    style={{
                        padding: '16px 20px',
                        backgroundColor: config.cardBg,
                        borderBottom: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: config.color }}>
                            {config.label} оюутнууд
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                            Нийт: <strong>{totalCount}</strong> оюутан
                            {data.length < totalCount && (
                                <span style={{ color: '#aaa' }}> ({data.length} татагдсан)</span>
                            )}
                            {selectedWeek && (
                                <span
                                    style={{
                                        marginLeft: '8px',
                                        color: config.color,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {' '}
                                    — {selectedWeek}-р 7 хоног
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '50%',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        aria-label="Хаах"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Хайлт */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <Input
                        type="text"
                        placeholder="Нэр, код, анги хайх..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        bsSize="sm"
                        style={{ maxWidth: '320px' }}
                    />
                </div>

                {/* Жагсаалт */}
                <div style={{ overflow: 'auto', flex: 1 }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <div className="spinner-border" role="status" />
                        </div>
                    ) : sorted.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                            Мэдээлэл олдсонгүй
                        </div>
                    ) : (
                        <>
                            <Table
                                bordered
                                hover
                                size="sm"
                                style={{ marginBottom: 0, fontSize: '13px' }}
                            >
                                <thead
                                    style={{
                                        backgroundColor: config.cardBg,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 5,
                                    }}
                                >
                                    <tr>
                                        <th style={{ width: '44px' }}>#</th>
                                        <th style={{ minWidth: '60px' }}>Код</th>
                                        <th style={{ minWidth: '180px' }}>Оюутны нэр</th>
                                        <th style={{ minWidth: '120px' }}>Анги</th>
                                        <th
                                            className="text-center"
                                            style={{
                                                minWidth: '90px',
                                                cursor: 'pointer',
                                                color: config.color,
                                                fontWeight: 'bold',
                                                userSelect: 'none',
                                            }}
                                            onClick={() => setSortAsc((p) => !p)}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                }}
                                            >
                                                {config.label} тоо
                                                {sortAsc ? (
                                                    <ArrowUp size={14} color={config.color} />
                                                ) : (
                                                    <ArrowDown size={14} color={config.color} />
                                                )}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '10px',
                                                    color: '#aaa',
                                                    fontWeight: 'normal',
                                                    marginTop: '2px',
                                                }}
                                            >
                                                {sortAsc ? 'бага → их' : 'их → бага'}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map((s, idx) => (
                                        <tr key={s.student_id}>
                                            <td>{idx + 1}</td>
                                            <td style={{ color: '#666' }}>{s.code}</td>
                                            <td>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                    }}
                                                >
                                                    <User size={13} color="#aaa" />
                                                    {s.name}
                                                </div>
                                            </td>
                                            <td>{s.group_name}</td>
                                            <td className="text-center">
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        backgroundColor: config.cardBg,
                                                        color: config.color,
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                        minWidth: '32px',
                                                        padding: '2px 10px',
                                                        borderRadius: '12px',
                                                        border: `1px solid ${config.color}44`,
                                                    }}
                                                >
                                                    {s.count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {data.length < totalCount && (
                                <div
                                    style={{
                                        padding: '12px',
                                        textAlign: 'center',
                                        borderTop: '1px solid #f0f0f0',
                                    }}
                                >
                                    {loadingMore ? (
                                        <div
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                        />
                                    ) : (
                                        <button
                                            onClick={loadMore}
                                            style={{
                                                fontSize: '13px',
                                                color: config.color,
                                                border: `1px solid ${config.color}44`,
                                                background: config.cardBg,
                                                cursor: 'pointer',
                                                padding: '6px 16px',
                                                borderRadius: '6px',
                                                fontWeight: '500',
                                            }}
                                        >
                                            Дараагийн {remainingCount}-г харах
                                            <span
                                                style={{
                                                    color: '#aaa',
                                                    fontWeight: 'normal',
                                                    marginLeft: '6px',
                                                }}
                                            >
                                                ({data.length}/{totalCount})
                                            </span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
