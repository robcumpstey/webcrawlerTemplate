import {
    krakenSearchBox
} from './paths.mjs'


async function openMPxN(page, currentMPAN) {
    // --- Search MPAN + check for multiple account sites ---
    await page.locator(krakenSearchBox).fill(currentMPxN)
    await page.locator(krakenSearchBox).press('Enter');

    // --- If multiple portfolio property loads, navigate to MPAN landing page ---
    const enrolButton = page.getByRole('link', { name: 'Enrol New Customer' })
    const enrolVisible = await enrolButton.isVisible()
    
    if (enrolVisible) {
        console.log("multi property view activated")
        const accountLink = page.getByRole('link', { name: /^A-[A-Z0-9]+$/ })
        await accountLink.nth(0).click()
    }


}


async function yourNextStep(page) {
    const yourButton = page.locator('location');
    await yourButton.click()
}


// If your process uses a popup use this function to capture the popup
// Ask GPT or Gemini how to intergrate this into the flow of your other steps
async function awaitPopup(page, buttonTriggeringPopup) {
    const [yourPopup] = await Promise.all([
        page.waitForEvent('popup'),
        buttonTriggeringPopup.click()
    ]);
    await yourPopup.waitForLoadState();

    return yourPopup
}


// If your crawler wants to check whether or not a box is populated, use this function
// This is also used as a wrapper function if you want to populate the box in question from a sheet
async function registrationCheck(disconnectPopup, currentMPAN, xlsFile, regIDDB) {
    const checkBox = yourPage.locator('#id_registration_id')
    const boxContent = await checkBox.inputValue()
    await operationalDelay(yourPage)

    if (inputForBox == "") {
            const lookupValue = inputDB[currentMPxN] || '';
            console.log(`${currentMPxN} lookup equates to > ${lookupValue}`)

            if (lookupValue == "") {
                throw new Error(`No Reg :: The registration ID for ${currentMPAN} is not populated`)
            } else {
                await checkBox.fill(lookupValue)
            }
        }
    
    console.log('Completion message')
    SUCCESS(currentMPxN, xlsFile)
}

// --- This will create a database object from your chosen tab, to later be used for lookups ---
async function createInputLookup() {
    // --- Load user spreadsheet giving MPANs to crawl ---
        let targetSheet = 'Your Tab Here'
        const targetTab = await retrieveSheet(targetSheet)
    
        const lookupDB = {};
        for (const row of targetTab) {
            lookupDB[row.MPxN] = row.Field
        }

        return lookupDB
    }


// All of your steps must be exported to run.mjs from here
export {
    openMPxN,
    yourNextStep,
    awaitPopup,
    registrationCheck,
    createInputLookup
}