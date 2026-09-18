import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Badge, Table } from 'reactstrap'
import useApi from '@hooks/useApi'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getYearsFromJoinYear(joinYear) {
    if (!joinYear) return []
    const startYear = parseInt(joinYear.split('-')[0])
    const now = new Date()
    const currentYear = now.getFullYear()
    const endYear = now.getMonth() + 1 >= 9 ? currentYear : currentYear - 1
    const years = []
    for (let y = startYear; y <= endYear; y++) years.push(`${y}-${y + 1}`)
    return years
}

function extractUniqueSeasons(registrations) {
    const seen = new Set()
    return registrations.reduce((acc, r) => {
        const id = r.session_info?.lesson_season
        const name = r.session_info?.lesson_season_name
        if (id && !seen.has(id)) {
            seen.add(id)
            acc.push({ id, name })
        }
        return acc
    }, [])
}

function buildRows(categories, subCategories, visibleItemIds = null) {
    const rows = []
    categories.forEach(cat => {
        const children = cat.children || []
        const categoryRows = []
        if (children.length > 0) {
            children.forEach(child => {
                const childRows = subCategories
                    .filter(s => s.physicaltestcategory === child.id)
                    .filter(s => !visibleItemIds || visibleItemIds.has(s.id))
                    .sort((a, b) => a.order - b.order)
                    .map(sub => ({ type: 'row', sub }))
                if (childRows.length) {
                    categoryRows.push({ type: 'subheader', cat: child }, ...childRows)
                }
            })
        } else {
            subCategories
                .filter(s => s.physicaltestcategory === cat.id)
                .filter(s => !visibleItemIds || visibleItemIds.has(s.id))
                .sort((a, b) => a.order - b.order)
                .forEach(sub => categoryRows.push({ type: 'row', sub }))
        }
        if (categoryRows.length) {
            rows.push({ type: 'section', cat }, ...categoryRows)
        }
    })
    return rows
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
    sectionTd: {
        padding: '10px 20px',
        fontWeight: 800,
        fontSize: 12.5,
        color: '#1e3a5f',
        backgroundColor: '#dde4f0',
        letterSpacing: 0.3,
        border: 'none',
    },
    subheaderTd: {
        padding: '8px 20px 8px 30px',
        color: '#64748b',
        fontWeight: 600,
        fontSize: 12,
        fontStyle: 'italic',
        backgroundColor: '#f0f3fb',
        border: 'none',
        textAlign: 'center',
    },
    nameTd: { padding: '11px 20px 11px 36px', color: '#334155', border: 'none' },
    valueTd: { padding: '11px 20px', textAlign: 'center', border: 'none' },
    theadTh: {
        padding: '10px 20px',
        color: '#64748b',
        fontWeight: 600,
        fontSize: 12,
        border: 'none',
        borderBottom: '1px solid #e2e8f0',
    },
    yearTabsWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        padding: '12px 16px',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#f8fafc',
    },
    seasonTabsWrap: {
        display: 'flex',
        gap: 6,
        padding: '10px 16px',
        borderBottom: '1px solid #f1f5f9',
    },
    sessionInfoWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        padding: '10px 16px',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#f0f9ff',
    },
    noRegWrap: {
        textAlign: 'center',
        padding: '14px 20px',
        borderTop: '1px solid #f1f5f9',
        backgroundColor: '#fffbeb',
    },
    valueChip: {
        fontWeight: 700,
        color: '#2563eb',
        fontSize: 14,
        backgroundColor: '#eff6ff',
        padding: '3px 12px',
        borderRadius: 20,
        display: 'inline-block',
    },
    absentBadge: (isAbsent) => ({
        marginLeft: 'auto',
        fontSize: 12,
        fontWeight: 700,
        padding: '2px 10px',
        borderRadius: 20,
        backgroundColor: isAbsent ? '#fee2e2' : '#dcfce7',
        color: isAbsent ? '#dc2626' : '#16a34a',
    }),
    tab: (isActive, activeColor) => ({
        cursor: 'pointer',
        border: 'none',
        borderRadius: 8,
        transition: 'all .15s',
        backgroundColor: isActive ? activeColor : '#fff',
        color: isActive ? '#fff' : '#64748b',
        boxShadow: isActive ? `0 2px 8px ${activeColor}4d` : '0 0 0 1px #e2e8f0',
    }),
}

// Component

const PhysicalTestModal = ({ isOpen, handleModal, student }) => {
    const api = useApi().student.physicalTest

    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [registrations, setRegistrations] = useState([])
    const [resultsByReg, setResultsByReg] = useState({})
    const [years, setYears] = useState([])
    const [seasons, setSeasons] = useState([])
    const [activeYear, setActiveYear] = useState(null)
    const [activeSeason, setActiveSeason] = useState(null)
    const [metaLoading, setMetaLoading] = useState(false)
    const [tabLoading, setTabLoading] = useState(false)
    const [normativeDocuments, setNormativeDocuments] = useState([])

    useEffect(() => {
        if (!isOpen || !student?.id) return
        loadMeta()
    }, [isOpen, student?.id])

    useEffect(() => {
        if (!activeYear) {
            setSeasons([])
            setActiveSeason(null)
            return
        }

        const availableSeasons = extractUniqueSeasons(
            registrations.filter(r => r.session_info?.lesson_year === activeYear)
        )
        setSeasons(availableSeasons)
        setActiveSeason(current => (
            availableSeasons.find(season => season.id === current?.id) ??
            availableSeasons[availableSeasons.length - 1] ??
            null
        ))
    }, [activeYear, registrations])

    useEffect(() => {
        if (!activeYear || !activeSeason) return
        const reg = registrations.find(
            r => r.session_info?.lesson_year === activeYear &&
                r.session_info?.lesson_season === activeSeason.id
        )
        if (!reg || resultsByReg[reg.id] !== undefined) return
        loadResults(reg.id)
    }, [activeYear, activeSeason, registrations])

    const loadMeta = async () => {
        setMetaLoading(true)
        try {
            const [catRes, subRes, documentRes] = await Promise.all([
                api.category.get(true),
                api.subCategory.get('', true),
                api.normativeDocument.get(true),
            ])
            setCategories(catRes?.data?.results ?? catRes?.data ?? [])
            setSubCategories(subRes?.data?.results ?? subRes?.data ?? [])
            setNormativeDocuments(
                (documentRes?.data?.results ?? documentRes?.data ?? [])
                    .filter(document => Boolean(document.source_file))
            )

            let regs = []
            try {
                const regRes = await api.register.get('', student.id, '', '')
                regs = regRes?.data?.results ?? regRes?.data ?? []
            } catch (err) {
                console.error('register fetch failed:', err)
            }

            setRegistrations(regs)

            const baseYears = getYearsFromJoinYear(student?.group?.join_year)
            const regYears = regs.map(r => r.session_info?.lesson_year).filter(Boolean)
            const merged = Array.from(new Set([...baseYears, ...regYears])).sort()
            setYears(merged)

            if (merged.length > 0) {
                setActiveYear(merged[merged.length - 1])
            }
        } catch (e) {
            console.error('loadMeta:', e)
        } finally {
            setMetaLoading(false)
        }
    }

    const loadResults = async (regId) => {
        setTabLoading(true)
        try {
            const res = await api.result.get(regId, '')
            const list = res?.data?.results ?? res?.data ?? []
            setResultsByReg(prev => ({ ...prev, [regId]: list }))
        } catch (e) {
            console.error('loadResults:', e)
        } finally {
            setTabLoading(false)
        }
    }

    // Derived state

    const activeReg = registrations.find(
        r => r.session_info?.lesson_year === activeYear &&
            r.session_info?.lesson_season === activeSeason?.id
    ) ?? null

    const activeResults = activeReg ? (resultsByReg[activeReg.id] ?? null) : []
    const hasResults = (activeResults ?? []).some(result =>
        result?.value !== null && result?.value !== undefined ||
        result?.text_value !== null && result?.text_value !== undefined && result?.text_value !== ''
    )

    const resultMap = {}
        ; (activeResults ?? []).forEach(r => { resultMap[r.item] = r })
    const gradedResults = (activeResults ?? []).filter(result =>
        result?.normative_score !== null && result?.normative_score !== undefined && result?.letter_grade
    )
    const averageScore = gradedResults.length
        ? gradedResults.reduce((sum, result) => sum + Number(result.normative_score), 0) / gradedResults.length
        : null
    const averageLetterGrade = gradedResults.find(result => result?.average_letter_grade)?.average_letter_grade ?? null

    const selectedItemIds = new Set((activeReg?.selections ?? []).map(s => s.item))
    Object.keys(resultMap).forEach(id => selectedItemIds.add(Number(id)))
    const rows = buildRows(
        categories,
        subCategories,
        selectedItemIds.size > 0 ? selectedItemIds : null,
    )

    // Render

    const renderCellValue = (row) => {
        const result = resultMap[row.sub.id]
        const val = result?.text_value ?? result?.value
        const hasVal = val !== undefined && val !== null && val !== ''

        if (!activeReg) return <span style={{ color: '#cbd5e1' }}>—</span>
        if (activeReg.is_absent) return <span style={{ fontSize: 11, color: '#dc2626' }}>--</span>
        if (hasVal) return (
            <span style={styles.valueChip}>
                {result?.text_value
                    ? val
                    : parseFloat(val).toLocaleString('mn-MN')}
                {!result?.text_value && (
                    <small style={{ fontWeight: 500, marginLeft: 6 }}>
                        {result?.unit_name ?? row.sub.unit_name ?? ''}
                    </small>
                )}
            </span>
        )
        return <span style={{ color: '#cbd5e1', fontSize: 16 }}>—</span>
    }

    const renderRow = (row, i) => {
        if (row.type === 'section') return (
            <tr key={`sec-${i}`}>
                <td colSpan={3} style={styles.sectionTd}>{row.cat.name}</td>
            </tr>
        )
        if (row.type === 'subheader') return (
            <tr key={`sub-${i}`}>
                <td colSpan={3} style={styles.subheaderTd}>{row.cat.name}</td>
            </tr>
        )
        return (
            <tr key={`row-${i}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={styles.nameTd}>{row.sub.name}</td>
                <td style={styles.valueTd}>{renderCellValue(row)}</td>
                <td style={styles.valueTd}>
                    {resultMap[row.sub.id]?.letter_grade
                        ? <Badge color="primary" pill>
                            {resultMap[row.sub.id].normative_score}{resultMap[row.sub.id].letter_grade}
                        </Badge>
                        : <span style={{ color: '#cbd5e1' }}>—</span>}
                </td>
            </tr>
        )
    }

    return (
        <Modal isOpen={isOpen} toggle={handleModal} size="lg" scrollable centered>
            <ModalHeader toggle={handleModal}>
                <span style={{ fontWeight: 600 }}>Бие бялдрын шалгалт</span>
                {student && (
                    <span className="ms-2 text-muted" style={{ fontSize: 14, fontWeight: 400 }}>
                        — {student.last_name} {student.first_name}
                    </span>
                )}
                {student?.code && (
                    <Badge color="secondary" pill className="ms-2" style={{ fontSize: 11 }}>
                        {student.code}
                    </Badge>
                )}
            </ModalHeader>

            <ModalBody className="p-0">
                {metaLoading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <Spinner color="primary" className="me-2" />
                        <span>Уншиж байна...</span>
                    </div>
                ) : (
                    <>
                        {/* Year tabs */}
                        {years.length > 0 && (
                            <div style={styles.yearTabsWrap}>
                                {years.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setActiveYear(y)}
                                        style={{ ...styles.tab(activeYear === y, '#2563eb'), fontSize: 12.5, padding: '4px 12px', fontWeight: activeYear === y ? 700 : 400 }}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Season tabs */}
                        {seasons.length > 0 && (
                            <div style={styles.seasonTabsWrap}>
                                {seasons.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSeason(s)}
                                        style={{ ...styles.tab(activeSeason?.id === s.id, '#16a34a'), fontSize: 12, padding: '3px 12px', fontWeight: activeSeason?.id === s.id ? 700 : 400 }}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Session info */}
                        {activeReg && (
                            <div style={styles.sessionInfoWrap}>
                                <span style={{ fontSize: 12.5, color: '#0369a1' }}>
                                    📅 {activeReg.session_info?.start_datetime?.replace('T', ' ')?.slice(0, 16)}
                                    {' — '}
                                    {activeReg.session_info?.end_datetime?.replace('T', ' ')?.slice(0, 16)}
                                </span>
                                <span style={styles.absentBadge(activeReg.is_absent || activeReg.is_cancelled)}>
                                    {activeReg.is_cancelled
                                        ? 'Цуцалсан'
                                        : activeReg.is_absent
                                            ? 'Тасалсан'
                                            : hasResults
                                                ? 'Дүн орсон'
                                                : 'Бүртгэгдсэн'}
                                </span>
                                {activeReg.session_info?.school_name && (
                                    <span style={{ fontSize: 12.5, color: '#475569' }}>
                                        🏫 {activeReg.session_info.school_name}
                                    </span>
                                )}
                                {activeReg.session_info?.levels?.length > 0 && (
                                    <span style={{ fontSize: 12.5, color: '#475569' }}>
                                        Дамжаа: {activeReg.session_info.levels.join(', ')}
                                    </span>
                                )}
                            </div>
                        )}

                        {normativeDocuments.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 px-2 py-1" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                {normativeDocuments.map(document => (
                                    <a
                                        key={document.id}
                                        href={document.source_file}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        Норматив харах{document.version ? ` (${document.version})` : ''}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Result table */}
                        <div style={{ overflowX: 'auto' }}>
                            {tabLoading && activeResults === null ? (
                                <div className="text-center py-4">
                                    <Spinner size="sm" color="primary" />
                                    <span className="ms-2 text-muted" style={{ fontSize: 13 }}>Уншиж байна...</span>
                                </div>
                            ) : (
                                <Table className="mb-0 align-middle" style={{ fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8fafc' }}>
                                            <th style={{ ...styles.theadTh, width: '55%' }}>Шалгалтын төрөл</th>
                                            <th style={{ ...styles.theadTh, textAlign: 'center' }}>Үр дүн</th>
                                            <th style={{ ...styles.theadTh, textAlign: 'center' }}>Үнэлгээ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-4 text-muted">
                                                    Ангилал байхгүй байна
                                                </td>
                                            </tr>
                                        ) : rows.map(renderRow)}
                                    </tbody>
                                    {averageScore !== null && (
                                        <tfoot>
                                            <tr style={{ backgroundColor: '#eff6ff', borderTop: '2px solid #bfdbfe' }}>
                                                <td colSpan={2} style={{ ...styles.valueTd, textAlign: 'right', fontWeight: 700 }}>
                                                    Үнэлгээтэй {gradedResults.length} шалгалтын дундаж
                                                </td>
                                                <td style={{ ...styles.valueTd, fontWeight: 700, color: '#2563eb' }}>
                                                    {averageScore.toFixed(2)}{averageLetterGrade || ''}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </Table>
                            )}

                            {!activeReg && activeYear && activeSeason && !metaLoading && (
                                <div style={styles.noRegWrap}>
                                    <span style={{ fontSize: 13, color: '#92400e' }}>
                                        Энэ улиралд шалгалтын бүртгэл байхгүй
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" outline onClick={handleModal}>Хаах</Button>
            </ModalFooter>
        </Modal>
    )
}

export default PhysicalTestModal
