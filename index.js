import { request } from 'https';

const http = require('http'); 
const bodyParser = require('body-parser'); 
const express = require('express'); 

const app = express(); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded( {extended: false })); 
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.send("Home page. Server is running okay"); 
})

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === 'chatbot') {
        res.send(req.query['hub.challenge']); 
    }
    res.send('Error, wrong validation token'); 
})

app.post('/hook', (req, res) => {
    const entries = req.body.entry; 
    entries.forEach(entry => {
        const messaging = entry.messaging; 
        messaging.forEach(message => {
            const senderId = message.sender.id; 
            if (message.message.text) {
                const text = message.message.text; 
                console.log(text); 
                sendMessage(senderId, text); 
            }
        });
    });
})

function sendMessage(senderId, text) {
    request('https://graph.facebook.com/v3.3/me/messages', {
        
    })
}

app.set('port', process.env.PORT || 1337); 

server.listen(app.get('port'), () => {
    console.log(`Chat bot server listening at ${app.get('port')}`); 
})
