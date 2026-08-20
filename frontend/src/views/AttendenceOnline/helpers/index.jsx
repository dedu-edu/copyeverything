import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { get_week } from '@src/utility/Utils'

const center = { horizontal: 'center', vertical: 'center', wrapText: true }
const leftAlign = { horizontal: 'left', vertical: 'center', wrapText: true }

const border = {
    top:    { style: 'thin', color: { rgb: 'BDBDBD' } },
    bottom: { style: 'thin', color: { rgb: 'BDBDBD' } },
    left:   { style: 'thin', color: { rgb: 'BDBDBD' } },
    right:  { style: 'thin', color: { rgb: 'BDBDBD' } },
}

// Гарчиг
const titleStyle = {
    font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '0D47A1' } },
    alignment: center,
}

// Хуудас дугаар
const subStyle = {
    font: { bold: false, sz: 10, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1565C0' } },
    alignment: center,
}

// Толгой
const headerStyle = {
    font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1976D2' } },
    alignment: center,
    border,
}

// Үүсгэсэн мөр (ногоон)
const createdStyle = (col) => ({
    font: { sz: 10, color: { rgb: '1B5E20' }, bold: col === 7 },
    fill: { fgColor: { rgb: 'E8F5E9' } },
    alignment: col === 1 ? leftAlign : center,
    border,
})

// Үүсгээгүй мөр (улаан)
const notCreatedStyle = (col) => ({
    font: { sz: 10, color: { rgb: 'B71C1C' }, bold: col === 8 },
    fill: { fgColor: { rgb: 'FFEBEE' } },
    alignment: col === 1 ? leftAlign : center,
    border,
})

// Биелэлт % - тусгай
const percentStyleCreated = {
    font: { bold: true, sz: 10, color: { rgb: '1B5E20' } },
    fill: { fgColor: { rgb: 'C8E6C9' } },
    alignment: center,
    border,
}
const percentStyleNotCreated = {
    font: { bold: true, sz: 10, color: { rgb: 'B71C1C' } },
    fill: { fgColor: { rgb: 'FFCDD2' } },
    alignment: center,
    border,
}

export const exportToExcel = (lessons, mainPage, active_week) => {
    const wb = XLSX.utils.book_new()
    const wsData = []

    const weekName = get_week()?.find(w => w?.id === active_week)?.name || active_week || ''

    // Мөр 1: гарчиг
    wsData.push([`Цахим сургалтын ирцийн тайлан — ${weekName}`])
    // Мөр 2: хуудас
    wsData.push([`${mainPage}-р хуудас`])
    // Мөр 3: хоосон
    wsData.push([])
    // Мөр 4: толгой
    wsData.push([
        '№', 'Багш', 'Улирал',
        '7 хоногт орох цаг', 'Хичээллэх 7 хоног', 'Нийт оролтын тоо',
        'Үүсгэсэн', 'Үүсгээгүй', 'Биелэлт %'
    ])

    lessons?.forEach((item, index) => {
        const total = item.total_week_time || 0
        const created = total - (item.not_created_count || 0)
        const percent = total > 0 ? Math.round((created / total) * 100) : 0
        wsData.push([
            (mainPage - 1) * 40 + index + 1,
            item.teacher_name || '',
            item.season_name || '',
            item.week_time || 0,
            item.learn_week || 0,
            item.total_week_time || 0,
            item.irts_qr_count || 0,
            item.not_created_count || 0,
            `${percent}%`,
        ])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Багана өргөн
    ws['!cols'] = [
        { wch: 5 },  // №
        { wch: 26 }, // Багш
        { wch: 10 }, // Улирал
        { wch: 20 }, // 7 хоногт орох цаг
        { wch: 18 }, // Хичээллэх 7 хоног
        { wch: 18 }, // Нийт оролтын тоо
        { wch: 12 }, // Үүсгэсэн
        { wch: 12 }, // Үүсгээгүй
        { wch: 12 }, // Биелэлт %
    ]

    // Merge
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    ]

    // Мөрийн өндөр
    ws['!rows'] = [
        { hpt: 30 }, // гарчиг
        { hpt: 18 }, // хуудас
        { hpt: 6  }, // хоосон
        { hpt: 24 }, // толгой
        ...Array(lessons?.length || 0).fill({ hpt: 20 }),
    ]

    const cols = ['A','B','C','D','E','F','G','H','I']

    // Гарчиг
    if (ws['A1']) ws['A1'].s = titleStyle
    if (ws['A2']) ws['A2'].s = subStyle

    // Толгой мөр
    cols.forEach(col => {
        const cell = ws[`${col}4`]
        if (cell) cell.s = headerStyle
    })

    // Өгөгдлийн мөрүүд
    lessons?.forEach((item, index) => {
        const rowNum = index + 5
        const isCreated = (item.not_created_count || 0) === 0

        cols.forEach((col, colIdx) => {
            const cell = ws[`${col}${rowNum}`]
            if (!cell) return

            // Биелэлт % (I багана, colIdx 8)
            if (colIdx === 8) {
                cell.s = isCreated ? percentStyleCreated : percentStyleNotCreated
            } else {
                cell.s = isCreated ? createdStyle(colIdx) : notCreatedStyle(colIdx)
            }
        })
    })

    XLSX.utils.book_append_sheet(wb, ws, 'Тайлан')
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(
        new Blob([buffer], { type: 'application/octet-stream' }),
        `Цахим_ирц_${weekName}_${mainPage}-р хуудас.xlsx`
    )
}