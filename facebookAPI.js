"use strict"
const request = require('request');
const util = require('./Utilities');

class FacebookAPI {
    constructor() {
        this.token = 'EAAJkP0LZByAABAAWXdq0Q0hZAy2pzGUbJUesMQYXbTLeMFOrZCrSR9uN5CEfIOvdpjM3CiZCfmdYLnp0sep7VwQFjt1PTZAi1WmEODdKZBzSGnfoKoFHlViJHttZBPzH4kwht5o0Et53Na7SZAt29i8pERvEZBZCLvett5EAZC5ZCSMBrgZDZD';
        this.sendFacebookAPIURL = 'https://graph.facebook.com/v3.3/me/messages';
    }

    sendGeneralMessage(senderId, messageData) {
        request({
            url: this.sendFacebookAPIURL,
            method: 'POST',
            qs: {
                access_token: this.token,
            },
            json: {
                recipient: {
                    id: senderId
                },   
                message: messageData
            }  
        }, (error, response, body) => {
            if (error) {
                console.log('Error sending message: ', error);
            }
            else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }

    createElementFromLink(link) {
        const metadata = util.crawlMetaDataFromAnUrl(link); 
        return {
            title: "Article",
            subtitle: "economy",
            item_url: link,   
            "buttons": [
                {
                    "type": "web_url",
                    "url": link,
                    "title": "Xem thêm"
                }
            ]
        };
    }

    sendGenericTemplateButtonMessagesFromArrayLink(senderId, links) {
        let elements = []; 
        links.slice(0, 10).forEach(link => {
            const element = this.createElementFromLink(link);
            elements.push(element);
        });
        let messageData = {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: elements
                }
            }
        };
        this.sendGeneralMessage(senderId, messageData);
    }

    // send replies by messages back to user via facebook rest api 
    sendTextMessage(senderId, text) {
        let messageData = {
            text: text    
        };
        this.sendGeneralMessage(senderId, messageData);
    }
}


module.exports = new FacebookAPI();