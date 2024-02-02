const express = require("express");
const {
  getMessageWebhook,
  receiveMessageWebhook,
  fetchAllMessages,
  sendMessage,
  sendReplyMessage,
  fetchMediaUrl,
  createVideoUrl,
  createAudioUrl,
  createDocumentUrl,
  sendImgMedia,
  sendStickerMedia,
} = require("../controller.js/messageController");

const { getVideo, getAudio, getDocument } = require("../helper/fileHelper");

const router = express.Router();

// ******* Receive Message through webhook *************************

router.post("/webhook", receiveMessageWebhook);
router.get("/webhook", getMessageWebhook);

// ******* fetch all receive messages ******************************

router.get("/fetchAllMsg", fetchAllMessages);

// ******* send messages *******************************************

router.post("/send-msg", sendMessage);

// ******* send reply message **************************************

router.post("/reply-send-message", sendReplyMessage);

// ****** get files ************************************************

router.get("/assets/video/:fileName", getVideo);
router.get("/assets/audio/:fileName", getAudio);
router.get("/assets/document/:fileName", getDocument);

// ****** get media ***********************************************

router.get("/media-access", fetchMediaUrl);

// ****** send media && document ************************************

router.post("/create-video-url", createVideoUrl);
router.post("/create-audio-url", createAudioUrl);
router.post("/create-document-url", createDocumentUrl);

// ***** send photo and sticker *************************************

router.post("/send-photo-whatsapp", sendImgMedia);
router.post("/send-sticker-whatsapp", sendStickerMedia);

module.exports = router;