const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const Contacts = sequelize.define(
  "Contacts",
  {
    profile: {
      type: DataTypes.JSON,
    },
    input: {
      type: DataTypes.STRING,
    },
    wa_id: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "Contacts",
    updatedAt: false,
  }
);

(async () => {
  await Contacts.sync({ force: false });
})();

module.exports = Contacts;