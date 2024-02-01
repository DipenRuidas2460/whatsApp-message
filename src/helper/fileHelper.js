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

module.exports = { getVideo };