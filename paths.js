/*  This holds the xpath or css paths for all of the objects used by a webcrawler.
    Import these as variables into the main script, the xpaths are long and scruffy
    and this will keep the main scripts much tidier */
    
    const krakenSearchBox = 'xpath=/html/body/div/main/section/div[1]/div[1]/form/input';
    const propsMeterpoints = 'xpath=/html/body/div/main/div/div[3]/div/div[2]/div/ul/li[6]/a'
    const krakenSpanner = 'xpath=/html/body/div/main/div/div[3]/div/div[3]/div/div/div[2]/div/div[2]/div/div/div[1]/div[1]/div[2]/div[2]/button'
    const updateRegistration = 'xpath=/html/body/div/main/div/div[3]/div/div[3]/div/div/div[2]/div/div[2]/div/div/div[1]/div[1]/div[2]/div[2]/div/button[1]'
    const isDomesticOption = '#id_is_domestic'
    const submitRegistration = 'xpath=/html/body/div/div/div[2]/form/div[5]/button'

    export {
        krakenSearchBox,
        propsMeterpoints,
        krakenSpanner,
        updateRegistration,
        isDomesticOption,
        submitRegistration
    }