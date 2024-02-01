const express = require("express");
const {
  getMessageWebhook,
  receiveMessageWebhook,
  fetchAllReceiveMessage,
  sendMessage,
  sendReplyMessage,
  fetchMediaUrl,
} = require("../controller.js/messageController");

const { getVideo } = require("../helper/fileHelper");

const router = express.Router();

// ******* Receive Message through webhook *************************

router.post("/webhook", receiveMessageWebhook);
router.get("/webhook", getMessageWebhook);

// ******* fetch all receive messages ******************************

router.get("/fetchAllReceiveMsg/:msgId", fetchAllReceiveMessage)

// ******* send messages *******************************************

router.post("/send-msg", sendMessage)

// ******* send reply message **************************************

router.post('/reply-send-message', sendReplyMessage)

// ****** get files ************************************************

router.get("/assets/video/:fileName", getVideo)

// ******  get media ***********************************************

router.get("/media-access", fetchMediaUrl)


module.exports = router;
