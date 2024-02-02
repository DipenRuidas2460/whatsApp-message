const axios = require("axios");
const asyncHandler = require("express-async-handler");
require("dotenv").config();
const Contacts = require("../models/contacts");
const Messages = require("../models/message");
const path = require("path");

const Token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

const receiveMessageWebhook = asyncHandler(async (req, res) => {
  try {
    let body_param = req.body;
    if (body_param.object) {
      if (
        body_param.entry &&
        body_param.entry[0].changes &&
        body_param.entry[0].changes[0].value.messages &&
        body_param.entry[0].changes[0].value.messages[0]
      ) {
        const contacts = body_param.entry[0].changes[0].value.contacts[0];
        const messages = body_param.entry[0].changes[0].value.messages[0];

        const messageSavedData = {
          from: messages.from,
          webhook_recived_msg_id: messages.id,
          timestamp: messages.timestamp,
          type: messages.type,
          text: messages.text,
          context: messages.context,
          identity: messages.identity,
          reaction: messages.reaction,
          contacts: messages.contacts,
          location: messages.location,
          referral: messages.referral,
          order: messages.order,
        };

        const contactsDataObj = {
          profile: contacts.profile,
          wa_id: contacts.wa_id,
        };

        const contactsData = await Contacts.create(contactsDataObj);
        const data = await contactsData.save();

        const receiveMessageData = await Messages.create(messageSavedData);
        const msgData = await receiveMessageData.save();

        return res
          .status(200)
          .send({ messages: msgData.dataValues, contacts: data.dataValues });
      } else {
        return res.status(404).send({ msg: "Data not found!" });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
});

const getMessageWebhook = (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const challange = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    if (mode && token) {
      if (mode === "subscribe" && token === mytoken) {
        res.status(200).send(challange);
      } else {
        res.status(403).send({ msg: "Unautharized access!" });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const fetchAllMessages = asyncHandler(async (req, res) => {
  try {
    const allMessages = await Messages.findAll({});
    return res.json(allMessages);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
});

const sendMessage = async (req, res) => {
  try {
    const { phon_no_id, to, message } = req.body;

    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: "whatsapp",
        to: to,
        text: {
          body: message,
        },
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(async ({ data }) => {
      const contactsData = {
        input: data.contacts[0].input,
        wa_id: data.contacts[0].wa_id,
      };

      const messageData = {
        send_msg_id: data.messages[0].id,
        text: {
          body: message,
        },
      };

      const contactsInfo = await Contacts.create(contactsData);
      const messageInfo = await Messages.create(messageData);

      return res.json({ contactsInfo, messageInfo });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const sendReplyMessage = (req, res) => {
  try {
    const { phon_no_id, to, reply_message_id, message } = req.body;
    axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: "whatsapp",
        to: to,
        context: {
          message_id: reply_message_id,
        },
        text: {
          body: message,
        },
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(async ({ data }) => {
      const contactsData = {
        input: data.contacts[0].input,
        wa_id: data.contacts[0].wa_id,
      };

      const messageData = {
        reply_msg_id: data.messages[0].id,
        text: {
          body: message,
        },
      };

      const contactsInfo = await Contacts.create(contactsData);
      const messageInfo = await Messages.create(messageData);

      return res.json({ contactsInfo, messageInfo });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const fetchMediaUrl = async (req, res) => {
  try {
    const mediaId = req.query.mediaId;
    const phon_no_id = req.query.phon_no_id;
    await axios({
      method: "GET",
      url: `https://graph.facebook.com/v19.0/${mediaId}?phone_number_id=${phon_no_id}`,
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    }).then(async ({ data }) => {
      // return res.json({data})

      await axios({
        method: "GET",
        url: `https://graph.facebook.com/v19.0/${data.url}`,
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }).then(({ data }) => {
        return res.status(200).send({ status: "true", img: data.id });
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const createVideoUrl = async (req, res) => {
  try {
    const updatedVideo = req.files.video;
    const randomInRange = Math.floor(Math.random() * 10) + 1;
    const videoPath = path.join(
      __dirname,
      "../uploads/video/",
      `${randomInRange}_video.mp4`
    );
    await updatedVideo.mv(videoPath);
    return res.json({
      url: `${process.env.BCK_URL}/assets/video/${randomInRange}_video.mp4`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const createAudioUrl = async (req, res) => {
  try {
    const updatedAudio = req.files.audio;
    const randomInRange = Math.floor(Math.random() * 10) + 1;
    const audioPath = path.join(
      __dirname,
      "../uploads/audio/",
      `${randomInRange}_audio.mp3`
    );
    await updatedAudio.mv(audioPath);
    return res.json({
      url: `${process.env.BCK_URL}/assets/audio/${randomInRange}_audio.mp3`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const createDocumentUrl = async (req, res) => {
  try {
    const updatedDocument = req.files.document;
    const randomInRange = Math.floor(Math.random() * 10) + 1;
    const documentPath = path.join(
      __dirname,
      "../uploads/document/",
      `${randomInRange}_document.pdf`
    );
    await updatedDocument.mv(documentPath);
    return res.json({
      url: `${process.env.BCK_URL}/assets/document/${randomInRange}_document.pdf`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const sendImgMedia = async (req, res) => {
  try {
    const { phon_no_id, messaging_product, recipient_type, to, type, imageId } =
      req.body;

    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        image: {
          id: imageId,
        },
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendStickerMedia = async (req, res) => {
  try {
    const { phon_no_id, messaging_product, recipient_type, to, type, stickerId } =
      req.body;

    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        sticker: {
          id: stickerId,
        },
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

module.exports = {
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
  sendStickerMedia
};
