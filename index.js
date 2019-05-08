const http = require('http'); 
const bodyParser = require('body-parser'); 
const express = require('express');
const request = require('request');  

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
                sendMessage(senderId, "Tao la bot day " + text); 
            }
        });
    });
    res.status(200).send("OK");
})

function sendMessage(senderId, text) {
    request({
        url: 'https://graph.facebook.com/v3.3/me/messages', 
        method: 'POST', 
        qs : {
            access_token: 'EAAJkP0LZByAABAJKZAxhdCv7KQugcBiwDEBDPulhDtQSiSZCSLvxBW7v1QgSShnjeSS9KtOgNHjbGrPydZCHyNKNpQg9ZCyMSOuDqxotFLMHLZAGCle3Gq8CeelFdBM89vBk4nU0s3frU8gtEqhgv3l0saVKP4bSeFsM5UbDi5ZBQZDZD',
        }, 
        json: {
            recipient: {
                id: senderId
              },
              message: {
                text: text
              }
        }
    });
}

app.set('port', process.env.PORT || 1337); 

server.listen(app.get('port'), () => {
    console.log(`Chat bot server listening at ${app.get('port')}`); 
})
