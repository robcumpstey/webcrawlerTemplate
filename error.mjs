// SUCCESS() and FDAILURE() functions are stored here
// These are imported and run as part of run.mjs

import * as xlsx from 'xlsx';
import fs from 'fs';


async function SUCCESS(currentMPAN, xlsFile) {
    const fileBuffer = fs.readFileSync(xlsFile);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const targetRow = data.find(row => row.MPAN == currentMPAN);

    if (targetRow) {
        targetRow.Worked = 'DONE'
        console.log(`Successfully marked ${currentMPAN} as DONE.`);
    } else {
        console.log(`Success not logged, could not find MPAN ${currentMPAN} in the sheet.`);
        return; // Exit early if it wasn't found
    }

    const updatedWorksheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = updatedWorksheet;

    const outBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(xlsFile, outBuffer);
}


async function FAILURE(currentMPAN, xlsFile, Error) {
    const fileBuffer = fs.readFileSync(xlsFile);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const targetRow = data.find(row => row.MPAN == currentMPAN);

    if (targetRow) {
        targetRow.Error = 'Error';
        console.log(`Marked ${currentMPAN} as ERROR.`);
    } else {
        console.log(`Failure not logged, could not find MPAN ${currentMPAN} in the sheet.`);
        return;
    }

    const updatedWorksheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = updatedWorksheet;

    const outBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(xlsFile, outBuffer);
}


export {
    SUCCESS,
    FAILURE
}