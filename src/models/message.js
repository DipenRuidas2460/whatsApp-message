const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const Messages = sequelize.define(
  "Messages",
  {
    from: {
      type: DataTypes.STRING,
    },
    webhook_recived_msg_id: {
      type: DataTypes.STRING,
    },
    send_msg_id: {
      type: DataTypes.STRING,
    },
    reply_msg_id: {
      type: DataTypes.STRING,
    },
    timestamp: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    context: {
      type: DataTypes.JSON,
    },
    identity: {
      type: DataTypes.JSON,
    },
    text: {
      type: DataTypes.JSON,
    },
    reaction: {
      type: DataTypes.JSON,
    },
    contacts: {
      type: DataTypes.JSON,
    },
    location: {
      type: DataTypes.JSON,
    },
    referral: {
      type: DataTypes.JSON,
    },
    order: {
      type: DataTypes.JSON,
    },
  },
  {
    tableName: "Messages",
    updatedAt: false,
  }
);

(async () => {
  await Messages.sync({ force: false });
})();

module.exports = Messages;
