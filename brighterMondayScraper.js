const puppeteer = require("puppeteer")
const fs = require("fs")
const pino = require("pino")
const logger = pino({
    transport: {
      target: 'pino-pretty'
    },
  })
async function scrape(){
    const searchParam = process.argv[2]
    
    const browser = await puppeteer.launch({headless:"new"})
    const page = await browser.newPage()
    try {
        
    
    await page.goto("https://www.brightermonday.co.ke/jobs",{timeout:60000})

    await page.waitForSelector("#onetrust-accept-btn-handler")
    await  page.click("#onetrust-accept-btn-handler")
    logger.info("cookies accepted")
   
    page.waitForNavigation()
    await page.type("#side-search", searchParam, {delay:300})
    logger.info("search parameters added")

    await Promise.all([
        page.waitForNavigation(),
        page.click("#job-search-btn")
    
    ])

    logger.info("loading jobs...")
    const titles = await page.$$eval("div.flex.items-center > a > p", titles=>titles.map(p=>p.innerText))
    const companies = await page.$$eval("div.w-full > p", companies=>companies.map(p=>p.innerText))
    const locations = await page.$$eval("div.flex.flex-wrap > span", locations=>locations.map(span=>span.innerText))

    const data = processData(titles, companies, locations)

    try{
        fs.writeFileSync(`data/${searchParam}.json`, JSON.stringify({jobs:data}), "utf-8")
       logger.info("jobs successfully loaded")
       logger.info(data.length +" jobs found")
    }catch(err){
        logger.error("jobs failed to load: " + err.message())
    }

    await browser.close()
} catch (error) {
       logger.error("something went wrong..  "+ error.message()) 
}
}

function processData(titles,companies,locations){
    let i = 0;
    let data = []
    titles.forEach((title,index)=>{
        const details = {
            id: index,
            jobTitle:title,
            company:companies[i],
            location:locations[i],
            timePosted: companies[i+2],
             contract:locations[i+1],
            salary:locations[i+2], 
        }
        data.push(details)
        index++
        i=i+3
    })
    return data
    
}
scrape()
