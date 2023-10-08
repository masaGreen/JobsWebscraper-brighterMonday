const puppeteer = require("puppeteer")
const fs = require("fs")


async function scrape(){
    const searchParam = process.argv[2]
    
    const browser = await puppeteer.launch({headless:"new"})
    const page = await browser.newPage()
    
    await page.goto("https://www.brightermonday.co.ke/jobs",{timeout:60000})

    await page.waitForSelector("#onetrust-accept-btn-handler")
    await  page.click("#onetrust-accept-btn-handler")
   
   
    page.waitForNavigation()
    await page.type("#side-search", searchParam, {delay:300})

    console.log("hello1")
    await Promise.all([
        page.waitForNavigation(),
        page.click("#job-search-btn")
    ])

 
    const titles = await page.$$eval("div.flex.items-center > a > p", titles=>titles.map(p=>p.innerText))
    const companies = await page.$$eval("div.w-full > p", companies=>companies.map(p=>p.innerText))
    const locations = await page.$$eval("div.flex.flex-wrap > span", locations=>locations.map(span=>span.innerText))

    const data = processData(titles, companies, locations)

    try{
        fs.writeFileSync(`data/${searchParam}.json`, JSON.stringify({jobs:data}), "utf-8")
       
    }catch(err){
        console.error(err.message())
    }

    await browser.close()
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
