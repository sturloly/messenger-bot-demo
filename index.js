/*
 * @Author: sturloly 
 * @Date: 2017-11-16 17:51:53 
 * @Last Modified by: sturloly
 * @Last Modified time: 2017-11-17 03:53:11
 */

'use strict';

// Imports dependencies and set up http server
const
	express = require('express'),
	request = require('request'),
	bodyParser = require('body-parser'),
	app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 5000, () => {
			console.log('-------------------------------------------------->>>\n------ [ Webhook is listenning at port 5000! ] ------');
		};

		// Creates the endpoint for our webhook 
		app.post('/webhook', (req, res) => {
			// console.log('------ [Getting response from webhook] ------');
			let body = req.body;

			// Checks this is an event from a page subscription
			if (body.object === 'page') {

				// Iterates over each entry - there may be multiple if batched
				body.entry.forEach(function (entry) {
					// console.log('-----> Iterating entry array from response');
					// console.log("[entry.messaging]" + entry.messaging);
					// Gets the message. entry.messaging is an array, but 
					// will only ever contain one message, so we get index 0
					let webhook_event = entry.messaging && entry.messaging[0] || "----->[ERROR] entry.messaging is not defined";
					console.log("------ [ Response Object ] ------\n" + JSON.stringify(webhook_event, null, 2));

					// Get the sender PSID
					let sender_psid = webhook_event.sender && webhook_event.sender.id || "----->[ERROR] webhook_event is not defined!!";
					console.log('Sender PSID: ' + sender_psid || "----->[ERROR] sender_psid is not defined!!");
					console.log('------ [ Session End ] ------\n-------------------------------------------------->>>');

					// Check if the event is a message or postback and
					// pass the event to the appropriate handler function
					if (webhook_event.message) {
						handleMessage(sender_psid, webhook_event.message);
					} else if (webhook_event.postback) {
						handlePostback(sender_psid, webhook_event.postback);
					}

					function handleMessage(sender_psid, received_message) {

						let response;

						// Check if the message contains text
						if (received_message.text) {

							// Create the payload for a basic text message
							response = {
								"text": `You sent the message: "${received_message.text}". ` +
									`I can only repeat what you say, but I will do more later.` +
									`我现在只会重复你说的话哦，晚点我将回答更多！`

							}
						} else if (received_message.attachments) {
							// Get the URL of the message attachment
							let attachment_url = received_message.attachments[0].payload.url;
							response = {
								"attachment": {
									"type": "template",
									"payload": {
										"template_type": "generic",
										"elements": [{
											"title": "Is this the right picture?",
											"subtitle": "Tap a button to answer.",
											"image_url": attachment_url,
											"buttons": [{
													"type": "postback",
													"title": "Yes!",
													"payload": "yes",
												},
												{
													"type": "postback",
													"title": "No!",
													"payload": "no",
												}
											],
										}]
									}
								}
							}
						}

						// Sends the response message
						callSendAPI(sender_psid, response);
					}

					function callSendAPI(sender_psid, response) {
						// Construct the message body
						let request_body = {
							"recipient": {
								"id": sender_psid
							},
							"message": response
						}

						// Send the HTTP request to the Messenger Platform
						request({
							"uri": "https://graph.facebook.com/v2.6/me/messages",
							"qs": {
								"access_token": "your_access_token"
							},
							"method": "POST",
							"json": request_body
						}, (err, res, body) => {
							console.log("request sent out");
							if (!err) {
								console.log('------ [ Response message sent ] ------');
								console.log('-------------------------------------------------->>>');
							} else {
								console.error("----->[ERROR] Unable to send message:" + err);
							}
						});
					}

					// Handles messaging_postbacks events
					function handlePostback(sender_psid, received_postback) {
						let response;

						// Get the payload for the postback
						let payload = received_postback.payload;

						// Set the response based on the postback payload
						if (payload === 'yes') {
							response = {
								"text": "Thanks!"
							}
						} else if (payload === 'no') {
							response = {
								"text": "Oops, try sending another image."
							}
						}
						// Send the message to acknowledge the postback
						callSendAPI(sender_psid, response);
					}

				});

				// Returns a '200 OK' response to all requests
				res.status(200).send('------ [ EVENT_RECEIVED ] ------');
			} else {
				// Returns a '404 Not Found' if event is not from a page subscription
				res.sendStatus(404);
			}

		});

		// Adds support for GET requests to our webhook
		app.get('/webhook', (req, res) => {

			// Your verify token. Should be a random string.
			let VERIFY_TOKEN = "your_token"

			// Parse the query params
			let mode = req.query['hub.mode'];
			let token = req.query['hub.verify_token'];
			let challenge = req.query['hub.challenge'];

			// Checks if a token and mode is in the query string of the request
			if (mode && token) {

				// Checks the mode and token sent is correct
				if (mode === 'subscribe' && token === VERIFY_TOKEN) {

					// Responds with the challenge token from the request
					console.log('------ [ WEBHOOK_VERIFIED ] ------');
					res.status(200).send(challenge);

				} else {
					// Responds with '403 Forbidden' if verify tokens do not match
					res.sendStatus(403);
				}
			}
		});