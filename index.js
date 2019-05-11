// packages import
const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');

const facebookAPI = require('./facebookAPI');
const crawler = require('./crawler');
const constants = require('./constants');

// setup 
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const server = http.createServer(app);

// read data from data.csv 
// const inputFile='data.csv';
// let dataArray = []; 
// const buf = fs.readFileSync(inputFile, "utf-8");  
// const stringArray = buf.split(','); 
// for (let i = 0; i < stringArray.length; i += 6) {
//     dataArray.push({
//         question: stringArray[i], 
//         a: stringArray[i + 1],
//         b: stringArray[i + 2],
//         c: stringArray[i + 3],
//         d: stringArray[i + 4],
//         correct: stringArray[i + 5],
//     });
// }

// crawling information from viet-studies
let articlesLinksPromise = crawler.crawl();

// index
app.get('/', (req, res) => {
    res.send("Home page. Server is running okay");
});

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === 'chatbot') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

// when user sends messages to page, make a post request to webhook 
app.post('/webhook', (req, res) => {
    req.body.entry.forEach(entry => {
        const webhookEvent = entry.messaging[0];
        const senderId = webhookEvent.sender.id;
        if (webhookEvent.message) {
            handleMessage(webhookEvent, senderId);
            // if user wants to get grammar english questions 
            // else if(message.message.text.includes('english')) {
            //     const question = dataArray[Math.floor(Math.random() * dataArray.length)];
            //     const choices = `A. ${question.a}   B. ${question.b}    C. ${question.c}    D. ${question.d}`;  
            //     facebookAPI.sendTextMessage(senderId, question.question);
            //     facebookAPI.sendTextMessage(senderId, choices);  
            // }

        } else if (webhookEvent.postback) {
            handlePostback(webhookEvent, senderId);
        }
    });
    res.status(200).send("OK");  
});

function handleMessage(webhookEvent, senderId) {
    const text = webhookEvent.message.text;
    if (text.includes(constants.TEXT_HELP)) {
        facebookAPI.sendGenericButtonWithPostback(senderId);
    }
    else if (text.includes(constants.TEXT_ARTICELS)) {
        sendArticlesToUsers(senderId);
    }
    else if (text.includes(constants.TEXT_AUTHOR)) {
        facebookAPI.sendTextMessage(senderId, 'Tác giả là sinh viên bị ảnh hướng nhiều bởi toidicodedao. Nếu các bạn thấy bot bổ ích hãy cho mình 1 star trên github. https://github.com/kkhanhluu/FacebookChatbot');
    }
    else {
        facebookAPI.sendTextMessage(senderId, "Tao là bot đây " + text);
    }
}

function handlePostback(webhookEvent, senderId) {
    let payload = webhookEvent.postback.payload;
    if (payload === constants.PAYLOAD_GETSTARTED) {
        facebookAPI.sendGenericButtonWithPostback(senderId); 
    }
    else if (payload === constants.PAYLOAD_ARTICLES) {
        sendArticlesToUsers(senderId);
    } else if (payload === constants.PAYLOAD_QUESTIONS) {
        facebookAPI.sendTextMessage(senderId, 'Bạn đợi chút nha');
    } else if (payload === constants.PAYLOAD_AUTHOR) {
        facebookAPI.sendTextMessage(senderId, 'Tác giả là sinh viên bị ảnh hướng nhiều bởi toidicodedao. Nếu các bạn thấy bot bổ ích hãy cho mình 1 star trên github. https://github.com/kkhanhluu/FacebookChatbot');
    }
}

function sendArticlesToUsers(senderId) {
    facebookAPI.sendTextMessage(senderId, "Bạn xem các bài viết hay ở đây nha");
    articlesLinksPromise.then(links => {
        facebookAPI.sendGenericTemplateButtonMessagesFromArrayLink(senderId, links);
    }).catch(e => console.log(e.message));
}

app.set('port', process.env.PORT || 1337);
server.listen(app.get('port'), () => {
    console.log(`Chat bot server listening at ${app.get('port')}`);
});
