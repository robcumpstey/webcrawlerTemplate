import { chromium } from 'playwright';
import * as xlsx from 'xlsx';
import fs from 'fs';


import {
    SUCCESS,
    FAILURE
} from './error.mjs'


import {
    openMPAN
} from './steps.mjs'


// This runs automatically and opens a window for you to login manually to kraken
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
    const xlsFile = "./your_sheet.xlsx";
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
        } else if (row.MPAN) {
            let currentMPAN = row.MPAN.toString();
            console.log(currentMPAN)
            await backfillMPANs(page, currentMPAN, xlsFile);
        }
    }
}


async function yourProcess(page, currentMPAN, xlsFile) {
    // If your process makes use of any popups, you need to assign these as variables here
    // When calling the step which open your popups, reassign their returns to these variables
    let yourPopup = null;
    
    try {
        await Promise.race([
                (async () => {
                    // Run steps
                    await openMPAN(page, currentMPAN)
                    
                    // Pseudocode example of popup assignment
                    const yourPopup = await PopupStep(page)
                    
                    // Update sheet after completion
                    await SUCCESS(currentMPAN, xlsFile)
                })(),

                new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('CustomTimeout: Process took longer than 20 seconds')), 20000)
                    )
            ])
        } catch (error) {
            console.log(error);
            await FAILURE(currentMPAN, xlsFile)
        
            // Check if the error was for custom timeout
            if (Error.message && Error.message.includes('CustomTimeout')) {
                console.log(`Skipping MPAN ${currentMPAN} due to 10-second timeout.`);
            }
            
            // Stop loop if browser is closed manually or accidentally, *** dont remove ***
            if (Error.message && Error.message.includes('Target page, context or browser has been closed')) {
                console.error("CRITICAL: Browser or page was closed. Terminating the script completely.");
                process.exit(1);
            }
        } finally {
            // Close the restartButtonPage popup as it lingering on edge cases can cause crashes
            if (yourPopup) {
            try {
                if (typeof yourPopup.isClosed === 'function' && !yourPopup.isClosed()) {
                    await yourPopup.close();
                } else if (!yourPopup.isClosed) {
                    await yourPopup.close();
                }
            } catch (closeError) {
                console.log(`Warning: Failed to gracefully close popup for ${currentMPAN}: ${closeError.message}`);
            }
        }
    }
}