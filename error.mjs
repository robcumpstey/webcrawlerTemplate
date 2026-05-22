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

    const targetRow = data.find(row => row.MPxN == currentMPxN);

    if (targetRow) {
        targetRow.Worked = 'DONE'
        console.log(`Successfully marked ${currentMPxN} as DONE.`);
    } else {
        console.log(`Success not logged, could not find MPAN ${currentMPxN} in the sheet.`);
        return;
    }

    const updatedWorksheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = updatedWorksheet;

    const outBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(xlsFile, outBuffer);
}


async function FAILURE(currentMPxN, xlsFile, message) {
    const fileBuffer = fs.readFileSync(xlsFile);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const targetRow = data.find(row => row.MPxN == currentMPxN);
    console.log(`Printing message >`, message)

    // Add message to sheet, if one is included, default without is 'Error'
    if (targetRow) {
        if (message === 'Your message') {
            targetRow.Error = 'No Reg';
            console.log(`Marked ${currentMPxN} as No Reg.`);
        }
        else if (message === 'xxx') {
            // Successive error messages go here
        }
        else {
            // Successive error messages go here
        }
        
    } else {
        console.log(`Failure not logged, could not find MPxN ${currentMPxN} in the sheet.`);
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