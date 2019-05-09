"use strict"
const puppeteer = require('puppeteer');

class Crawler {
    async crawl() {
        const url = "http://www.viet-studies.net/kinhte/kinhte.htm";
    
        const links = await this.getLinks(url);
        console.log(links);
        return links;
    }
    
    async getLinks(url) {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url);
    
        const links = await page.evaluate(() => {
            const today = document.querySelector('ul.auto-style23');
            const todayA = Array.from(today.querySelectorAll('li a'));
            const todayLinks = todayA.map(a => a.getAttribute('href'));
            return todayLinks;
        });
        await browser.close();
        return links;
    }
}

module.exports = new Crawler();