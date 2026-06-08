import { google } from 'googleapis';

// Check api works //
const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})
const sheets = google.sheets({ version: 'v4', auth })

async function retrieveSheet(targetSheet) {
    const spreadsheetId = '1WzclcVNswsUBsei3RX32kyICjnyHj3dMMO6ggsp8F14'
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `'${targetSheet}'!A:Z`,
    })

    const sheetData = response.data.values;
    if (!sheetData || sheetData.length === 0) {
        console.log("No data found in spreadsheet.")
        return
    }
    
    const headers = sheetData[0]
    const mappedSheet = sheetData.slice(1).map((row, index) => {
        let rowData = {}
        headers.forEach((header, colIndex) => {
            rowData[header] = row[colIndex]
        });

        // For writing back to sheet later
        rowData._googleSheetRowNumber = index + 2
        return rowData
    })

    return mappedSheet
}

export {
    retrieveSheet,
    sheets
}