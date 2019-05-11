"use strict"
const request = require('request-promise');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class Utilities {
    crawlMetaDataFromAnUrl(link) {
        return request(link).then(htmlString => {
            const dom = new JSDOM(htmlString);
            const title = dom.window.document.querySelector('title') === null ?
                         "Economy articles" : dom.window.document.querySelector('title').text;
            const subtitle = dom.window.document.querySelector("meta[property='og:description']") === null ? 
                            "economy" : dom.window.document.querySelector("meta[property='og:description']").getAttribute('content');
            const imgUrl = dom.window.document.querySelector("meta[property='og:image']") === null ?
            "https://ichef.bbci.co.uk/news/1024/branded_vietnamese/EE79/production/_106894016_06basamtaitoa9-2016.jpg"
             : dom.window.document.querySelector("meta[property='og:image']").getAttribute('content');
            return {
                title: title,
                subtitle: subtitle,
                imgUrl: imgUrl
            };
        }).catch(e => console.log(e));
    }
}

module.exports = new Utilities(); 