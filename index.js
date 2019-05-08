// packages import
const http = require('http'); 
const bodyParser = require('body-parser'); 
const express = require('express');
const request = require('request'); 
const puppeteer = require('puppeteer');  

// setup 
const app = express(); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded( {extended: false })); 
const server = http.createServer(app);

// index
app.get('/', (req, res) => {
    res.send("Home page. Server is running okay"); 
})

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === 'chatbot') {
        res.send(req.query['hub.challenge']); 
    }
    res.send('Error, wrong validation token'); 
})

// when user sends messages to page, make a post request to webhook 
app.post('/webhook', (req, res) => {
    const entries = req.body.entry; 
    entries.forEach(entry => {
        const messaging = entry.messaging; 
        messaging.forEach(message => {
            const senderId = message.sender.id; 
            if (message.message.text.includes('kinh te')) {
                sendMessage(senderId, "Bạn xem các bài viết kinh tế hay ở đây nha"); 
                crawler().then(links => {
                    links.forEach(link => sendGenericButtonMessage(senderId, link));
                }).catch(e => console.log(e.message));
            }
            else {
                console.log(message.message.text); 
                sendMessage(senderId, "Tao là bot đây " + message.message.text); 
            }
        });
    });
    res.status(200).send("OK");
})

// send replies by messages back to user via facebook rest api 
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


// send replys by buttons back to users via facebook Rest API 
function sendGenericButtonMessage(senderId, text, link) {
    let messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                "elements":[
                    {
                     "title":"Welcome!",
                     "subtitle":"We have the right hat for everyone.",
                     "default_action": {
                       "type": "web_url",
                       "url": link,
                       "webview_height_ratio": "tall",
                     },
                     "buttons":[
                       {
                         "type":"web_url",
                         "url": link,
                         "title":"Xem thêm"
                       }             
                     ]      
                   }
                 ]
            }
        }
    }; 
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
              message: messageData
        }
    });
}
// crawler to craw articles from viet-studies
async function crawler() {
    const url = "http://www.viet-studies.net/kinhte/kinhte.htm"; 
    
    const links = await getLinks(url);  
    console.log(links); 
    return links; 
}

async function getLinks(url) {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
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


app.set('port', process.env.PORT || 1337); 
server.listen(app.get('port'), () => {
    console.log(`Chat bot server listening at ${app.get('port')}`); 
})
