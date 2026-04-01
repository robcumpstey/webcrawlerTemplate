


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

// If your process involves a new page opening, use this function
// You'll need to capture the new page and assign it to a variable and return it to yourProcess()
// See readme, Gemini or chatgpt can guide you on how to utilise this function if you're unsure
async function detectNewPage(page, clickForNewPage) {
    const context = page.context();
    const newPageName = page.getByRole('button', { name: 'your button here!'})
    const [newPageNamee] = await Promise.all([
        context.waitForEvent('page'),
        clickForNewPage.click()
    ]);
    await newPageName.waitForLoadState();

    return newPageName
}

export {
    openMPAN,
    detectNewPage
}