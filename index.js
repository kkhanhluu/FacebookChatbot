// packages import
const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const puppeteer = require('puppeteer');
import FacebookAPI from './facebookAPI';  
import Crawler from './crawler';

// setup 
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const server = http.createServer(app);
const facebookAPI = new FacebookAPI(); 
// crawler to craw articles from viet-studies
const crawler = new Crawler();

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
    const entries = req.body.entry;
    entries.forEach(entry => {
        const messaging = entry.messaging;
        messaging.forEach(message => {
            const senderId = message.sender.id;
            if (message.message.text.includes('kinh te')) {
                facebookAPI.sendTextMessage(senderId, "Bạn xem các bài viết kinh tế hay ở đây nha");
                
                crawler.crawl().then(links => {
                    facebookAPI.sendGenericTemplateButtonMessagesFromArrayLink(link); 
                }).catch(e => console.log(e.message));
            }
            else {
                console.log(message.message.text);
                sendMessage(senderId, "Tao là bot đây " + message.message.text);
            }
        });
    });
    res.status(200).send("OK");
});

app.set('port', process.env.PORT || 1337);
server.listen(app.get('port'), () => {
    console.log(`Chat bot server listening at ${app.get('port')}`);
});
