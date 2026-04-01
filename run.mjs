import { chromium } from 'playwright';
import * as xlsx from 'xlsx';
import fs from 'fs';

import {
    krakenSearchBox,
    propsMeterpoints,
    krakenSpanner,
    //updateRegistration,
    isDomesticOption,
    submitRegistration
} from './paths.js'

import {
    SUCCESS,
    FAILURE
} from './error.mjs'


// DO NOT TOUCH - This function opens the initial browser window on initial login
// As discussed in the readme this will require you to login manually
// >>
(async () => {
    const userDataDir = './playwright-profile';
    const context = await chromium.launchPersistentContext(userDataDir, { 
        headless: false 
    });

    console.log("Log in manually to kraken via the open window using your usual credentials >> ")
    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    await page.goto("https://kraken.octopus.energy/");
    await runProcess(page)
})();


// As per readme instructions, please link to your spreadsheet here
// The spreadsheets name must match xlsFile, and it must have 'mpan', 'worked', 'error' columns
// >>
async function runProcess(page) {
    // --- Load user spreadsheet giving MPANs to crawl ---
    const xlsFile = "./DPI Bulk Sheet.xlsx";
    const fileBuffer = fs.readFileSync(xlsFile);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    // --- Convert to JSON array ---
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log(`Successfully loaded ${rows.length} rows from the spreadsheet.`);

    // --- Iterate through array of MPANs, skipping any w/ worked or error tags ---
    for (const row of rows) {
        if (row.Worked || row.Error) {
            continue;
        } else if (row.MPAN_CORE) {
            let currentMPAN = row.mpan.toString();
            console.log(currentMPAN)
            await yourProcess(page, currentMPAN, xlsFile);
        }
    }
}


// UP TO HERE, WRAP THIS IN A FUNCTION >>
async function yourProcess(page, currentMPAN, xlsFile) {
    try {
        // This step will be the same for any task searching MPANs in kraken
        await openMPAN(page, currentMPAN)
        // Program steps as individual functions in steps.mjs 
        // Then import those functions to this file and call them here!
        // Add the rest of your steps as described above here >

        // Leave this as it will update your sheet upon happy pathway completion
        await SUCCESS(currentMPAN, xlsFile)
    } catch (Error) {
        console.log(Error)
        await FAILURE(currentMPAN, xlsFile)
    }
    return
}