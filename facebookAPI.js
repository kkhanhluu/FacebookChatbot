"use strict"
const request = require('request'); 

class FacebookAPI {
    constructor() {
        this.token = 'EAAJkP0LZByAABAJKZAxhdCv7KQugcBiwDEBDPulhDtQSiSZCSLvxBW7v1QgSShnjeSS9KtOgNHjbGrPydZCHyNKNpQg9ZCyMSOuDqxotFLMHLZAGCle3Gq8CeelFdBM89vBk4nU0s3frU8gtEqhgv3l0saVKP4bSeFsM5UbDi5ZBQZDZD'; 
        this.sendFacebookAPIURL = 'https://graph.facebook.com/v3.3/me/messages'; 
    }

    sendGeneralMessage(senderId, messageData) {
        request({
            url: this.sendFacebookAPIURL, 
            method: 'POST', 
            qs : {
                access_token: this.token,
            }, 
            json: {
                recipient: {
                    id: senderId
                  },
                  message: messageData
            }
        });
    }

    createElementFromLink(link) {
        return {
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
          };
    }

    sendGenericTemplateButtonMessagesFromArrayLink(senderId, links) {
        let messageData = {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    "elements":[]
                }
            }
        }; 
        links.forEach(link => {
            const element = this.createElementFromLink(link);
            messageData.attachment.payload.elements.push(element); 
        });
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