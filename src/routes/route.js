const express = require("express");
const {
  sendMessageWebhook,
  getMessageWebhook,
} = require("../controller.js/messageController");
const router = express.Router();

router.post("/webhook", sendMessageWebhook);
router.get("/webhook", getMessageWebhook);

module.exports = router;
