import { chromium } from 'playwright';
import * as xlsx from 'xlsx';
import fs from 'fs';

import {
    SUCCESS,
    FAILURE
} from './error.mjs'

import {
    openMPxN,
    yourNextStep,
    awaitPopup,
    registrationCheck,
    createInputLookup
} from './steps.mjs'

import {
    retrieveSheet,
    sheets
} from './api.mjs'


// This runs automatically and opens a window for you to login manually to kraken
(async () => {
    const userDataDir = './playwright-profile';
    const context = await chromium.launchPersistentContext(userDataDir, { 
        headless: false, 
        viewport: null,
        args: ['--window-size=1000, 800']
    });

    console.log("Log in manually to kraken via the open window using your usual credentials >> ")
    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    await page.goto("https://kraken.octopus.energy/");
    
    // Timer so first MPxN isn't forced into queue while kraken still opening
    await waitForTimeout(30000)
    await runProcess(page)
})();


// As per readme instructions, please link to your spreadsheet here
// Remember that the target gsheet must be shared to the email below >>
// 'python-api@active-sheets.iam.gserviceaccount.com'
async function runProcess(page) {
    // --- Load user spreadsheet giving MPANs to crawl ---
    let targetSheet = 'For Crawler'
    const outputSheet = 'Sheet link code here';
    
    const rows = await retrieveSheet(targetSheet)
    console.log(`Successfully loaded ${rows.length} rows from the spreadsheet.`);

    // --- If you're crawler makes use of a lookup for inputs, create the DB here ---
    const inputDB = await Lookup()

    // --- Iterate through array of MPxNs, skipping any w/ worked or error tags ---
    for (const row of rows) {
        if (row.Worked || row.Error) {
            continue;
        } else if (row.MPxN) {
            let currentMPxN = row.MPxN.toString();
            console.log(currentMPxN)
            await yourProcess(page, currentMPxN, xlsFile, inputDB);
        }
    }
}


async function yourProcess(page, currentMPxN, xlsFile, inputDB) {
    let yourPopup = null;
    
    try {
        await Promise.race([
                (async () => {
                    // Run steps, call the steps for your process imported from steps.mjs here >>
                    await openMPxN(page, currentMPxN)
                    
                    // *** If your process needs to capture a popup, call the function here ***
                    yourPopup = await openYourPopup(page)
                    
                    // *** If your process needs to input information, call the function here ***
                    await populateBox(yourPage, currentMPxN)
                })(),

                // *** This can be used to set a custom timeout, say after 20 or 30 seconds if the crawler is stuck ***
                new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('CustomTimeout: Process took longer than 30 seconds')), 20000)
                    )
            ])
        } catch (error) {
            // Stop loop if browser is closed manually or accidentally, *** dont remove ***
            if (error.message && error.message.includes('Target page, context or browser has been closed')) {
                console.error("CRITICAL: Browser or page was closed. Terminating the script completely.");
                process.exit(1);
            }
            
            // --- For other exceptions, encode message and add to spreadsheet via FAILURE() ---
            let message = null
            console.log("Full traceback:\n", error.stack)
            
            // *** Setup catches + error reporting for possible errors or traps in process ***
            if (error.message && error.message.includes('xxx')){
                message = 'Your message here'
            }
            await FAILURE(currentMPxN, xlsFile, message)
            
        } finally {
            // *** If using a popup you need to keep this code as it will close auxiliary windows after each loop ***
            if (yourPopup) {
            try {
                if (typeof yourPopup.isClosed === 'function' && !yourPopup.isClosed()) {
                    await yourPopup.close();
                } else if (!yourPopup.isClosed) {
                    await yourPopup.close();
                }
            } catch (closeError) {
                console.log(`Warning: Failed to gracefully close popup for ${currentMPxN}: ${closeError.message}`);
            }
        }
    }
}