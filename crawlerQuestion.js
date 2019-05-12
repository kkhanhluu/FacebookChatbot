const puppeteer = require('puppeteer');
const fs = require('fs');


const categories = [
    { subject: "noun", max: 143 },
    { subject: "articles", max: 116 },
    { subject: "spelling-error", max: 220 },
    { subject: "transformation-of-sentences", max: 99 },
    { subject: "common-errors", max: 823 },
    { subject: "idioms-and-phrases", max: 70 },
    { subject: "one-word-substitution", max: 100 },
    { subject: "sequence-of-sentences", max: 248 },
    { subject: "synonyms", max: 199 },
    { subject: "antonyms", max: 100 },
    { subject: "sentence-improvement", max: 239 },
    { subject: "voice", max: 87 },
    { subject: "choosing-appropriate-words", max: 144 },
    { subject: "narration", max: 60 },
    { subject: "pronoun", max: 185 },
    { subject: "adjective-and-determiners", max: 220 },
    { subject: "verb", max: 180 },
    { subject: "adverb", max: 161 },
    { subject: "conjunction", max: 132 },
    { subject: "preposition", max: 324 },
]
async function crawl() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.justexam.in/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="emailx"]', "lukasmueller2020@gmail.com");
    await page.type('input[name="passwordx"]', "Abc@12345");
    await page.click('input[type="submit"');
    await page.waitForNavigation();
    const cookies = await page.cookies();
    // sequence of sentences xong 168

    let count = 1; 
    for (let j = 0; j < categories.length; j++) {
        const subject = categories[j].subject; 
        for (let i = 1; i <= categories[j].max; i++) {
            const questionAndChoices = await getQuestionAndChoices(browser, cookies, subject, i);
            const answer = await getCorrectAnswer(browser, cookies, subject, i); 
            const correctObject = {...questionAndChoices, correct: answer};

            const data = `${correctObject.question} | ${correctObject.a} |${correctObject.b} | ${correctObject.c} | ${correctObject.d} | ${correctObject.correct} |`;
            fs.appendFile("data.csv", data, (error) => {
                if (error) {
                    console.log(error);
                }
                console.log(`Write to data.csv successfully. Count: ${count}`);
                count++; 
            })
        }
    }

    await browser.close();
}

async function getCorrectAnswer(browser, cookies, subject, pageNumber) {
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto(`https://www.justexam.in/chapter-wise-solution-bank/${subject}-18/?&page=${pageNumber}`);
    const answer = await page.evaluate(() => {
        return document.getElementsByTagName('b')[1].textContent;
    });
    await page.close();
    return answer;
}

async function getQuestionAndChoices(browser, cookies, subject, pageNumber) {
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto(`https://www.justexam.in/chapter-wise-question-bank/${subject}-18/?&page=${pageNumber}`);
    const questionAndChoices = await page.evaluate(() => {
        return {
            question: document.getElementsByTagName('b')[0].textContent,
            a: document.querySelector('input[value="a"]').parentNode.textContent.trim(),
            b: document.querySelector('input[value="b"]').parentNode.textContent.trim(),
            c: document.querySelector('input[value="c"]').parentNode.textContent.trim(),
            d: document.querySelector('input[value="d"]').parentNode.textContent.trim(),
        }
    });
    await page.close();
    return questionAndChoices;
}

async function main() {
    await crawl();
    // console.log(categories.reduce((acc, curr) => acc + curr.max, 0)); 
}
main(); 