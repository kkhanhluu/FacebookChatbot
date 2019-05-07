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

app.set('port', process.env.PORT || 1337); 
app.set('ip', process.env.IP || "127.0.0.1"); 

server.listen(app.get('port'), app.get('ip'), () => {
    console.log(`Chat bot server listening at ${app.get('port')}, ${app.get('ip')}`); 
})
