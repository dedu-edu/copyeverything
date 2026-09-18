import moment from 'moment';
import { utils, writeFile } from 'xlsx-js-style';

// #region excel styles
const border = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
}

const font = {
    name: "Arial",
    sz: 10
}

const defaultCell = {
    border: border,
    alignment: {
        horizontal: 'left',
        vertical: 'center',
        wrapText: true
    },
    font: font
};

const defaultCenteredCell = {
    ...defaultCell,
    alignment: {
        ...defaultCell.alignment,
        horizontal: 'center',
    },
};

const boldBgCenteredCell = {
    ...defaultCenteredCell,
    font: {
        ...defaultCenteredCell.font,
        bold: true,
    },
    fill: {
        patternType: "solid",
        fgColor: { rgb: "d5e4fb" },
        bgColor: { rgb: "FFFFFF" }
    },
};
// #endregion

function addHeaderWsRow(
    worksheetStyles,
    worksheetHeights,
    worksheetWidths,
    headersRow,
) {
    // defaults
    let wsRow = { hpx: 25 }

    let col = 0
    const worksheetStylesCol = []

    function addHeader(header, width) {
        // defaults
        let wsStyle = boldBgCenteredCell
        let wsCol = { wch: width ? width : 20 }

        headersRow.push(header)

        // to set cell's configs and increment
        worksheetWidths.push(wsCol)
        worksheetStylesCol.push(wsStyle)
        col++
    }

    addHeader('№', 5)
    addHeader('Гарчиг')
    addHeader('Багшийн код')
    addHeader('Овог')
    addHeader('Нэр')
    addHeader('Сургууль')
    addHeader('Төлөв')
    addHeader('Санал илгээсэн огноо')
    addHeader('Хавсаргасан файл')
    addHeader('Тайлбар', 50)

    worksheetHeights.push(wsRow)
    worksheetStyles.push(worksheetStylesCol)
}

function extractTextFromHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const text = doc.body.textContent || "";
    return text
}

function addBodyWsRows(
    worksheetStyles,
    worksheetHeights,
    rows,
    bodyRows,
) {
    for (let row = 0; row < rows.length; row++) {
        const rowData = rows[row]
        const bodyRow = []

        // defaults
        let wsRow = { hpx: 25 }

        let col = 0
        const worksheetStylesCol = []

        function addWsRowConfigs() {
            // defaults
            let wsStyle = defaultCenteredCell
            worksheetStylesCol.push(wsStyle)
            col++
        }

        // column 1
        bodyRow.push(row + 1)
        addWsRowConfigs()

        // column 2
        bodyRow.push(rowData.title)
        addWsRowConfigs()

        // column 3
        bodyRow.push(rowData.teacher_register_code)
        addWsRowConfigs()

        // column 4
        bodyRow.push(rowData.teacher.last_name)
        addWsRowConfigs()

        // column 5
        bodyRow.push(rowData.teacher.first_name)
        addWsRowConfigs()

        // column 6
        bodyRow.push(rowData.teacher.sub_org.name)
        addWsRowConfigs()

        // column 7
        bodyRow.push(rowData.type.name)
        addWsRowConfigs()

        // column 8
        bodyRow.push(moment(rowData.created_at).format('YYYY-MM-DD HH:mm:ss'))
        addWsRowConfigs()

        // column 9
        const col8 = rowData.file ? decodeURIComponent(rowData.file.toString().split("/").pop()) : ''
        bodyRow.push(col8)
        addWsRowConfigs()

        // column 10
        bodyRow.push(extractTextFromHtml(rowData.description))
        addWsRowConfigs()

        bodyRows.push(bodyRow)
        worksheetHeights.push(wsRow)
        worksheetStyles.push(worksheetStylesCol)
    }
}

export async function excelDownLoad(getDataParams = {}, hooks) {
    if (!Object.keys(getDataParams).length) return

    // hooks
    const { feedbackApi, fetchData } = hooks

    // api call
    const { success, data } = await fetchData(feedbackApi.get({ ...getDataParams, mode: 'excel' }))
    if (!success || !data?.results?.length) return

    // api response
    const rows = data.results;

    // #region preprocessing
    // to collect cells' data
    const wsData = []
    const headersRow = []
    const bodyRows = []

    // to collect cells' configs
    const worksheetHeights = []
    const worksheetWidths = []
    const worksheetStyles = []
    const worksheetMerges = []

    addHeaderWsRow(
        worksheetStyles,
        worksheetHeights,
        worksheetWidths,
        headersRow,
    )

    addBodyWsRows(
        worksheetStyles,
        worksheetHeights,
        rows,
        bodyRows,
    )

    wsData.push(headersRow)
    wsData.push(...bodyRows)
    // #endregion preprocessing

    // to set data and apply configs (configs except styles)
    const worksheet = utils.aoa_to_sheet(wsData);
    worksheet["!rows"] = worksheetHeights
    worksheet["!cols"] = worksheetWidths
    worksheet["!merges"] = worksheetMerges

    // boundaries
    const lastRow = wsData.length - 1;
    const lastCol = wsData[0].length - 1;

    // to fix empty cells and apply styles
    for (let row = 0; row <= lastRow; row++) {
        for (let col = 0; col <= lastCol; col++) {
            const cellRef = utils.encode_cell({ r: row, c: col });
            if (!worksheet[cellRef]) worksheet[cellRef] = {};
            worksheet[cellRef].s = worksheetStyles[row][col]
        }
    }

    // output
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Feedback");
    writeFile(workbook, `Feedback.xlsx`, { compression: true });
}
