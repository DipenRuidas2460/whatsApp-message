const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const Messages = sequelize.define(
  "Messages",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    from: {
      type: DataTypes.STRING,
    },
    webhook_msg_id: {
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
    errors: {
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
