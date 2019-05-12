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

    async createElementFromLink(link) {
        const metadata = await util.crawlMetaDataFromAnUrl(link);
        return {
            title: metadata.title,
            subtitle: metadata.subtitle,
            image_url: metadata.imgUrl,
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
        const arrayPromise = links.slice(0, 10).map(async (link) => {
            return await this.createElementFromLink(link);
        });
        return Promise.all(arrayPromise).then(elements => {
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
        });
    }

    // send replies by messages back to user via facebook rest api 
    sendTextMessage(senderId, text) {
        let messageData = {
            text: text
        };
        this.sendGeneralMessage(senderId, messageData);
    }

    sendGenericButtonWithPostback(senderId) {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Tôi có thể giúp gì cho bạn?",
                        "subtitle": "Nhấn để trả lời.",
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Đọc báo",
                                "payload": "articles",
                            },
                            {
                                "type": "postback",
                                "title": "Luyện tiếng anh",
                                "payload": "questions",
                            }, 
                            {
                                "type": "postback",
                                "title": "Tác giả",
                                "payload": "author",
                            }
                        ],
                    }]
                }
            }
        };
        this.sendGeneralMessage(senderId, messageData); 
    }


}
module.exports = new FacebookAPI();