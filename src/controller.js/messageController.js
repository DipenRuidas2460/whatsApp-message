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

        let mediaId = null;

        if (messages.type === "image") {
          mediaId = messages.image.id;
        } else if (messages.type === "sticker") {
          mediaId = messages.sticker.id;
        } else if (messages.type === "video") {
          mediaId = messages.video.id;
        } else if (messages.type === "audio") {
          mediaId = messages.audio.id;
        } else if (messages.type === "document") {
          mediaId = messages.document.id;
        }

        const messageSavedData = {
          from: messages.from,
          webhook_recived_msg_id: messages.id,
          mediaObjectId: mediaId,
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
    console.log(err.message);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const sendMessageWithPreviewUrl = (req, res) => {
  try {
    const { phon_no_id, messaging_product, to, preview_url, body } = req.body;
    axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        to: to,
        text: {
          preview_url: preview_url,
          body: body,
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
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const sendReplyWithReactionMsg = (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      message_id,
      emoji,
    } = req.body;
    axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        reaction: {
          message_id: message_id,
          emoji: emoji,
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
    const filTypeArr = updatedVideo.name.split(".");
    const randomInRange = Math.floor(Math.random() * 10) + 1;
    const videoPath = path.join(
      __dirname,
      "../uploads/video/",
      `${randomInRange}_video.${filTypeArr[1]}`
    );
    await updatedVideo.mv(videoPath);
    return res.json({
      url: `${process.env.BCK_URL}/assets/video/${randomInRange}_video.${filTypeArr[1]}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const createAudioUrl = async (req, res) => {
  try {
    const updatedAudio = req.files.audio;
    const filTypeArr = updatedAudio.name.split(".");

    const randomInRange = Math.floor(Math.random() * 10) + 1;
    const audioPath = path.join(
      __dirname,
      "../uploads/audio/",
      `${randomInRange}_audio.${filTypeArr[1]}`
    );
    await updatedAudio.mv(audioPath);
    return res.json({
      url: `${process.env.BCK_URL}/assets/audio/${randomInRange}_audio.${filTypeArr[1]}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const createDocumentUrl = async (req, res) => {
  try {
    const updatedDocument = req.files.document;
    const filTypeArr = updatedDocument.name.split(".");
    const randomInRange = Math.floor(Math.random() * 10) + 1;
    const documentPath = path.join(
      __dirname,
      "../uploads/document/",
      `${randomInRange}_document.${filTypeArr[1]}`
    );
    await updatedDocument.mv(documentPath);
    return res.json({
      url: `${process.env.BCK_URL}/assets/document/${randomInRange}_document.${filTypeArr[1]}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err, msg: "Internal Server Error!" });
  }
};

const sendImgMediaByObjectId = async (req, res) => {
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendReplyToImgByImgId = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      message_id,
      type,
      imageId,
    } = req.body;

    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        context: {
          message_id: message_id,
        },
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendReplyToImgByUrl = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      message_id,
      type,
      imageLink,
    } = req.body;

    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        context: {
          message_id: message_id,
        },
        type: type,
        image: {
          link: imageLink,
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendImgByUrl = async (req, res) => {
  try {
    const { phon_no_id, messaging_product, recipient_type, to, type, imgLink } =
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
          link: imgLink,
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendStickerMediaByObjectId = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      stickerId,
    } = req.body;

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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendStickByUrl = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      stickerLink,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        sticker: {
          link: stickerLink,
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendReplyToStickerById = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      message_id,
      type,
      stickerId,
    } = req.body;

    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        context: {
          message_id: message_id,
        },
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendReplyToStickerByUrl = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      message_id,
      type,
      stickerLink,
    } = req.body;

    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        context: {
          message_id: message_id,
        },
        type: type,
        sticker: {
          link: stickerLink,
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendAudioByUrl = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      audioLink,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        audio: {
          link: audioLink,
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendVideoByUrl = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      videoLink,
      caption,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        video: {
          link: videoLink,
          caption: caption,
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendDocumentByUrl = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      documentLink,
      caption,
      filename,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        document: {
          link: documentLink,
          caption: caption,
          filename: filename,
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
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendReplyButton = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      interactive,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        interactive: interactive,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err.message);
    return res
      .status(500)
      .send({ error: err.message, msg: "Internal server error!" });
  }
};

const sendMessageByTemplate = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      template,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        template: template,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: err, msg: "Internal server error!" });
  }
};

const sendListMessage = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      interactive,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        interactive: interactive,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: err, msg: "Internal server error!" });
  }
};

const sendReplyToListMessage = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      message_id,
      type,
      interactive,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        context: {
          message_id: message_id,
        },
        type: type,
        interactive: interactive,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: err, msg: "Internal server error!" });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { phon_no_id, messaging_product, status, message_id } = req.body;
    await axios({
      method: "PUT",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        status: status,
        message_id: message_id,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: err, msg: "Internal server error!" });
  }
};

const sendSingleProductMessage = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      interactive,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        interactive: interactive,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: err, msg: "Internal server error!" });
  }
};

const sendMultiProductMessage = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      interactive,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        interactive: interactive,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: err, msg: "Internal server error!" });
  }
};

const sendCatalogMessage = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      interactive,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        interactive: interactive,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: err, msg: "Internal server error!" });
  }
};

const sendCatalogTemplateMessage = async (req, res) => {
  try {
    const {
      phon_no_id,
      messaging_product,
      recipient_type,
      to,
      type,
      template,
    } = req.body;
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phon_no_id}/messages`,
      data: {
        messaging_product: messaging_product,
        recipient_type: recipient_type,
        to: to,
        type: type,
        template: template,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
        "Content-Type": "application/json",
      },
    }).then(({ data }) => {
      return res.json({ data });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: err, msg: "Internal server error!" });
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
  sendImgMediaByObjectId,
  sendStickerMediaByObjectId,
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
  sendReplyButton,
  sendMessageByTemplate,
  sendListMessage,
  sendReplyToListMessage,
  markMessageAsRead,
  sendSingleProductMessage,
  sendMultiProductMessage,
  sendCatalogMessage,
  sendCatalogTemplateMessage,
};
