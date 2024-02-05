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
  sendStickerMediaByObjectId,
  sendImgMediaByObjectId,
  sendImgByUrl,
  sendStickByUrl,
  sendAudioByUrl,
  sendVideoByUrl,
  sendDocumentByUrl,
  sendMessageWithPreviewUrl,
  sendReplyWithReactionMsg,
  sendReplyToImgByImgId,
  sendReplyToImgByUrl,
  sendReplyToStickerById,
  sendReplyToStickerByUrl,
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

router.post("/send-message-preview-url", sendMessageWithPreviewUrl);

router.post("/send-reply-with-reaction-msg", sendReplyWithReactionMsg);

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

router.post("/send-photo-whatsapp", sendImgMediaByObjectId);
router.post("/send-photo-whatsapp-link", sendImgByUrl);
router.post("/send-sticker-whatsapp", sendStickerMediaByObjectId);
router.post("/send-sticker-whatsapp-link", sendStickByUrl);
router.post("/send-reply-to-image-by-id", sendReplyToImgByImgId);
router.post("/send-reply-to-image-by-url", sendReplyToImgByUrl);
router.post("/send-reply-to-sticker-message-by-id", sendReplyToStickerById);
router.post("/send-reply-to-sticker-message-by-url", sendReplyToStickerByUrl);

// ***** send Audio Video and Document ******************************

router.post("/send-audio-whatsapp-link", sendAudioByUrl);
router.post("/send-video-whatsapp-link", sendVideoByUrl);
router.post("/send-document-whatsapp-link", sendDocumentByUrl);

module.exports = router;
