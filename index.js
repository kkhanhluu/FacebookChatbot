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
const inputFile='data.csv';
let dataArray = []; 
const buf = fs.readFileSync(inputFile, "utf-8");  
const stringArray = buf.split('|'); 
for (let i = 0; i < stringArray.length - 1; i += 6) {
    dataArray.push({
        question: stringArray[i], 
        a: stringArray[i + 1],
        b: stringArray[i + 2],
        c: stringArray[i + 3],
        d: stringArray[i + 4],
        correct: stringArray[i + 5],
    });
}
let currentQuestion = dataArray[Math.floor(Math.random() * dataArray.length)]; 
let questionMode = false; 

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
        } else if (webhookEvent.postback) {
            handlePostback(webhookEvent, senderId);
        }
    });
    res.status(200).send("OK");  
});

function handleMessage(webhookEvent, senderId) {
    const text = webhookEvent.message.text.toLowerCase();
    if (text.includes(constants.TEXT_HELP.toLowerCase)) {
        facebookAPI.sendGenericButtonWithPostback(senderId);
    }
    else if (text.includes("hello") || text.includes("hi") || text.includes("xin chào")) {
        facebookAPI.sendTextMessage(senderId, "Xin chào, mình là bot của page Tiếng anh thi đại học không khó."); 
        facebookAPI.sendGenericButtonWithPostback(senderId); 
    }
    else if (text.includes(constants.TEXT_ARTICELS.toLowerCase())) {
        sendArticlesToUsers(senderId);
    }
    else if (text.includes(constants.TEXT_AUTHOR.toLowerCase())) {
        facebookAPI.sendTextMessage(senderId, 'Tác giả là sinh viên bị ảnh hướng nhiều bởi toidicodedao. Nếu các bạn thấy bot bổ ích hãy cho mình 1 star trên github. https://github.com/kkhanhluu/FacebookChatbot');
    }
    else if (text.includes(constants.TEXT_QUESTION.toLowerCase())) {
        questionMode = true; 
        facebookAPI.sendTextMessage(senderId, "Bạn hãy nhập start để bắt đầu, nhập end để kết thúc"); 
    }
    else if (text === 'start') {
        questionMode = true; 
        sendQuestionAndChoices(senderId);
    }
    else if (questionMode) {
        if (text === 'end') {
            questionMode = false; 
            facebookAPI.sendTextMessage(senderId, 'Cảm ơn. Hẹn gặp lại bạn lần sau');
        }
        else if (text !== 'a' && text !== 'd' && text !== 'b' && text !== 'c') {
            facebookAPI.sendTextMessage(senderId, 'Xin lỗi, tôi không hiểu câu trả lời của bạn. Hãy nhập a, b, c hoặc d'); 
        }
        else {
            const correctAnswer = currentQuestion.correct; 
            let userAnswer = ''; 
            switch(text) {
                case 'a': 
                    userAnswer = currentQuestion.a;
                    break;
                case 'b': 
                    userAnswer = currentQuestion.b;
                    break;
                case 'c': 
                    userAnswer = currentQuestion.c;
                    break;
                case 'd': 
                    userAnswer = currentQuestion.d;
                    break;
            } 
            if (correctAnswer.includes(userAnswer)) {
                facebookAPI.sendTextMessage(senderId, "Wow, bạn giỏi thật"); 
                setTimeout(() => sendQuestionAndChoices(senderId), 1000);
                currentQuestion = dataArray[Math.floor(Math.random() * dataArray.length)]; 
            }
            else {
                facebookAPI.sendTextMessage(senderId, "Lần sau bạn cố hơn nha. Đáp án đúng là: " + currentQuestion.correct);    
                setTimeout(() => sendQuestionAndChoices(senderId), 1000);
                currentQuestion = dataArray[Math.floor(Math.random() * dataArray.length)];
            }
        }
    }
    else {
        facebookAPI.sendTextMessage(senderId, "Xin lỗi tôi hơi ngu nên không hiểu bạn nói gì. Bạn chọn các mục sau để được bot giúp đỡ nha");
        facebookAPI.sendGenericButtonWithPostback(senderId); 
    }
}

function sendQuestionAndChoices(senderId) {
    const choices = `A. ${currentQuestion.a}    B. ${currentQuestion.b}     C. ${currentQuestion.c}     D. ${currentQuestion.d}`;
    facebookAPI.sendTextMessage(senderId, currentQuestion.question);
    setTimeout(() => facebookAPI.sendTextMessage(senderId, choices), 500);
}

function handlePostback(webhookEvent, senderId) {
    let payload = webhookEvent.postback.payload;
    if (payload === constants.PAYLOAD_GETSTARTED) {
        facebookAPI.sendGenericButtonWithPostback(senderId); 
    }
    else if (payload === constants.PAYLOAD_ARTICLES) {
        sendArticlesToUsers(senderId);
    } else if (payload === constants.PAYLOAD_QUESTIONS) {
        facebookAPI.sendTextMessage(senderId, "Bạn hãy nhập start để bắt đầu"); 
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
