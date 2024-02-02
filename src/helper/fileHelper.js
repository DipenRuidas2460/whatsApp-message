const fs = require("fs");
const path = require("path");

const getVideo = async (req, res) => {
  const fileName = req.params.fileName;
  const filePath = "../uploads/video/" + fileName;
  const profVideoPath = path.join(__dirname, filePath);
  const fileVideo = await fs.readFileSync(profVideoPath);
  res.write(fileVideo);
  res.end();
};

const getAudio = async (req, res) => {
  const fileName = req.params.fileName;
  const filePath = "../uploads/audio/" + fileName;
  const profAudioPath = path.join(__dirname, filePath);
  const fileAudio = await fs.readFileSync(profAudioPath);
  res.write(fileAudio);
  res.end();
};

const getDocument = async (req, res) => {
  const fileName = req.params.fileName;
  const filePath = "../uploads/document/" + fileName;
  const profDocumentPath = path.join(__dirname, filePath);
  const fileDocument = await fs.readFileSync(profDocumentPath);
  res.write(fileDocument);
  res.end();
};

module.exports = { getVideo, getAudio, getDocument };