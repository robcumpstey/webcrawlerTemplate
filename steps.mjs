import {
    krakenSearchBox
} from './paths.mjs'


async function openMPAN(page, currentMPAN) {
    // --- Search MPAN + check for multiple account sites ---
    await page.locator(krakenSearchBox).fill(currentMPAN)
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
async function awaitPopup(page) {
    const buttonTriggeringPopup = page.locator('location');
    
    const [yourPopup] = await Promise.all([
        page.waitForEvent('popup'),
        buttonTriggeringPopup.click()
    ]);
    await yourPopup.waitForLoadState();

    return yourPopup
}


// All of your steps must be exported to run.mjs from here
export {
    openMPAN
}